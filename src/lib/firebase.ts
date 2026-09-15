// ============ FIREBASE REALTIME DATABASE (REST API) ============
// Ringan, tanpa SDK berat. Cukup fetch() biasa.

interface FirebaseConfig {
  databaseURL: string;
}

// *** GANTI URL INI dengan URL database Firebase kamu ***
// Buka console.firebase.google.com → Realtime Database → Copy URL
const config: FirebaseConfig = {
  databaseURL: 'https://studio-1290501711-39566-default-rtdb.asia-southeast1.firebasedatabase.app',
};

export function isFirebaseConfigured(): boolean {
  return config.databaseURL.length > 0 && !config.databaseURL.includes('GANTI');
}

export function setFirebaseURL(url: string) {
  config.databaseURL = url.replace(/\/$/, '');
  localStorage.setItem('rpkzea_fb_url', url);
}

// Load saved URL from localStorage
export function initFirebase() {
  const saved = localStorage.getItem('rpkzea_fb_url');
  if (saved) config.databaseURL = saved.replace(/\/$/, '');
}

// ============ REST API OPERATIONS ============
async function fbFetch(path: string, method: string = 'GET', body?: unknown): Promise<any> {
  if (!isFirebaseConfigured()) return null;
  try {
    const url = `${config.databaseURL}/${path}.json`;
    const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Firebase] ${method} ${path} failed:`, err);
    return null;
  }
}

export async function fbSet(path: string, data: unknown): Promise<boolean> {
  const result = await fbFetch(path, 'PUT', data);
  return result !== null;
}

export async function fbGet<T>(path: string): Promise<T | null> {
  return await fbFetch(path, 'GET');
}
