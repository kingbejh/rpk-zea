#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const { createRequire } = require('module');

const htmlPath = path.resolve(process.argv[2] || 'bundle.html');
const timeoutMs = Number(process.env.RUNTIME_VALIDATE_TIMEOUT_MS || 10000);
const settleMs = Number(process.env.RUNTIME_VALIDATE_SETTLE_MS || 1500);
const evidenceDir = process.env.RUNTIME_VALIDATE_EVIDENCE_DIR
  ? path.resolve(process.env.RUNTIME_VALIDATE_EVIDENCE_DIR)
  : fs.mkdtempSync(path.join(os.tmpdir(), 'web-artifact-runtime-'));

function fail(message, diagnostics) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  const diagnosticsPath = path.join(evidenceDir, 'diagnostics.json');
  fs.writeFileSync(
    diagnosticsPath,
    `${JSON.stringify({ message, htmlPath, ...diagnostics }, null, 2)}\n`
  );

  console.error('');
  console.error('❌ Runtime validation failed');
  console.error(`   HTML: ${htmlPath}`);
  console.error(`   Reason: ${message}`);
  console.error(`   Evidence: ${evidenceDir}`);
  if (diagnostics?.pageErrors?.length) {
    console.error('   Page errors:');
    diagnostics.pageErrors.forEach((error) => console.error(`   - ${error}`));
  }
  if (diagnostics?.consoleErrors?.length) {
    console.error('   console.error entries:');
    diagnostics.consoleErrors.forEach((entry) => console.error(`   - ${entry.text}`));
  }
  process.exit(1);
}

function loadPlaywright() {
  const candidates = [
    path.join(process.cwd(), 'node_modules', 'playwright'),
    path.join(process.cwd(), 'node_modules', '@playwright', 'test'),
    'playwright',
  ];

  const cwdRequire = createRequire(path.join(process.cwd(), 'package.json'));
  const errors = [];
  for (const candidate of candidates) {
    try {
      return cwdRequire(candidate);
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }

  fail('Playwright is not installed or cannot be loaded.', { errors });
}

async function launchChromium(playwright) {
  const attempts = [
    {
      label: 'bundled chromium',
      launch: () => playwright.chromium.launch({ headless: true }),
    },
    {
      label: 'Chrome stable channel',
      launch: () => playwright.chromium.launch({ channel: 'chrome', headless: true }),
    },
    {
      label: 'Google Chrome app',
      launch: () =>
        playwright.chromium.launch({
          executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          headless: true,
        }),
    },
  ];

  const errors = [];
  for (const attempt of attempts) {
    try {
      const browser = await attempt.launch();
      return { browser, label: attempt.label };
    } catch (error) {
      errors.push(`${attempt.label}: ${error.message}`);
    }
  }

  fail('No headless Chromium runtime is available.', { browserLaunchErrors: errors });
}

(async () => {
  if (!fs.existsSync(htmlPath)) {
    fail('Bundle HTML file does not exist.', {});
  }
  if (!fs.statSync(htmlPath).isFile()) {
    fail('Bundle path is not a file.', {});
  }

  fs.mkdirSync(evidenceDir, { recursive: true });

  const playwright = loadPlaywright();
  const { browser, label: browserLabel } = await launchChromium(playwright);
  const consoleEntries = [];
  const consoleErrors = [];
  const pageErrors = [];
  let page;

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    page = await context.newPage();

    page.on('console', (message) => {
      const entry = {
        type: message.type(),
        text: message.text(),
        location: message.location(),
      };
      consoleEntries.push(entry);
      if (message.type() === 'error') {
        consoleErrors.push(entry);
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error.stack || error.message || String(error));
    });

    const url = pathToFileURL(htmlPath).href;
    await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
    await page.waitForTimeout(settleMs);

    const domState = await page.evaluate(() => {
      const body = document.body;
      const root = document.querySelector('#root');
      const visibleElements = Array.from(document.body.querySelectorAll('*')).filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) !== 0 &&
          rect.width > 0 &&
          rect.height > 0
        );
      });

      return {
        title: document.title,
        bodyTextLength: (body?.innerText || '').trim().length,
        bodyChildCount: body?.children.length || 0,
        visibleElementCount: visibleElements.length,
        hasRoot: Boolean(root),
        rootTextLength: root ? (root.textContent || '').trim().length : null,
        rootChildCount: root ? root.children.length : null,
      };
    });

    const diagnostics = {
      browser: browserLabel,
      url,
      consoleEntries,
      consoleErrors,
      pageErrors,
      domState,
    };

    fs.writeFileSync(
      path.join(evidenceDir, 'console.json'),
      `${JSON.stringify(consoleEntries, null, 2)}\n`
    );
    fs.writeFileSync(
      path.join(evidenceDir, 'pageerror.txt'),
      `${pageErrors.join('\n\n')}\n`
    );

    const screenshotPath = path.join(evidenceDir, 'screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    diagnostics.screenshot = screenshotPath;

    if (pageErrors.length > 0) {
      fail('Page-level JavaScript exception detected.', diagnostics);
    }
    if (consoleErrors.length > 0) {
      fail('console.error was emitted.', diagnostics);
    }
    if (domState.bodyTextLength === 0 || domState.visibleElementCount === 0) {
      fail('document.body has no visible content.', diagnostics);
    }
    if (domState.hasRoot && domState.rootChildCount === 0 && domState.rootTextLength === 0) {
      fail('#root exists but is empty.', diagnostics);
    }

    fs.writeFileSync(
      path.join(evidenceDir, 'diagnostics.json'),
      `${JSON.stringify(diagnostics, null, 2)}\n`
    );

    console.log('✅ Runtime validation passed');
    console.log(`   Opened via file:// using ${browserLabel}`);
    console.log(`   Evidence: ${evidenceDir}`);
  } catch (error) {
    const diagnostics = {
      browser: browserLabel,
      consoleEntries,
      consoleErrors,
      pageErrors,
      error: error.stack || error.message || String(error),
    };
    if (page) {
      try {
        const screenshotPath = path.join(evidenceDir, 'screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        diagnostics.screenshot = screenshotPath;
      } catch (screenshotError) {
        diagnostics.screenshotError = screenshotError.message;
      }
    }
    fail('Runtime validation timed out or could not complete.', diagnostics);
  } finally {
    await browser.close().catch(() => {});
  }
})();
