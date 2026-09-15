import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Dashboard from './sections/Dashboard';
import ProductsPage from './sections/ProductsPage';
import TransactionsPage from './sections/TransactionsPage';
import SettingsPage from './sections/SettingsPage';
import { useStore } from './lib/hooks';
import { db } from './lib/data';

type Page = 'dashboard' | 'products' | 'transactions' | 'settings';

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'products', label: 'Produk', icon: '📦' },
  { id: 'transactions', label: 'Transaksi', icon: '💳' },
  { id: 'settings', label: 'Pengaturan', icon: '⚙️' },
];

function App() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState(false);
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const store = useStore();

  const handleLogin = () => {
    if (pin === store.settings.pin) {
      setAuthed(true);
      setPinErr(false);
    } else {
      setPinErr(true);
    }
  };

  // Auto-close mobile nav on page change
  useEffect(() => setMobileNavOpen(false), [page]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body px-4"
        style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-xs text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center font-display font-bold text-xl"
            style={{ background: 'var(--color-primary)', color: 'white' }}>
            ZEA
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>RPK ZEA</h1>
            <p className="font-body text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Sistem Manajemen Bisnis</p>
          </div>
          <div>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Masukkan PIN"
              value={pin}
              onChange={e => { setPin(e.target.value); setPinErr(false); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="text-center text-2xl tracking-[0.3em] font-display h-14 rounded-xl"
              style={{ borderColor: pinErr ? 'var(--color-error)' : 'var(--color-border)' }}
            />
            {pinErr && (
              <p className="font-body text-xs mt-2" style={{ color: 'var(--color-error)' }}>
                PIN salah. Default: 1234
              </p>
            )}
          </div>
          <Button onClick={handleLogin} className="w-full rounded-full h-11 font-body text-base font-medium"
            style={{ background: 'var(--color-primary)', color: 'white' }}>
            Masuk
          </Button>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--color-bg)' }}>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-3"
        style={{ background: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        {/* Mobile hamburger */}
        <button className="lg:hidden p-1.5" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-primary)' }}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs"
            style={{ background: 'var(--color-primary)', color: 'white' }}>Z</div>
          <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            RPK ZEA
          </span>
        </div>
        <div className="flex-1" />
        {store.firebaseOk && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-body text-[10px] font-medium"
            style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-success)' }} />
            Firebase
          </span>
        )}
        <span className="font-body text-xs hidden sm:inline" style={{ color: 'var(--color-text-muted)' }}>
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => { setAuthed(false); setPin(''); }}
          className="p-1.5 rounded-full"
          style={{ color: 'var(--color-text-muted)' }}
          title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed top-14 left-0 bottom-0 w-52 flex-col py-4 px-3 z-40"
        style={{ background: 'var(--color-surface-elevated)', borderRight: '1px solid var(--color-border-subtle)' }}>
        <nav className="space-y-1">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-body text-sm font-medium transition-colors text-left"
              style={{
                background: page === item.id ? 'var(--color-primary-light)' : 'transparent',
                color: page === item.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Nav Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'oklch(0% 0 0 / 0.3)' }} />
          <div className="absolute top-14 left-0 bottom-0 w-56 p-3"
            style={{ background: 'var(--color-surface-elevated)' }}
            onClick={e => e.stopPropagation()}>
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => setPage(item.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-body text-sm font-medium transition-colors text-left"
                  style={{
                    background: page === item.id ? 'var(--color-primary-light)' : 'transparent',
                    color: page === item.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}>
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex"
        style={{ background: 'var(--color-surface-elevated)', borderTop: '1px solid var(--color-border-subtle)' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
            style={{ color: page === item.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="pt-14 pb-20 lg:pb-8 lg:pl-52">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {page === 'dashboard' && <Dashboard stats={store.stats} capital={store.capital} />}
          {page === 'products' && <ProductsPage products={store.products} onSave={store.saveProduct} onDelete={store.deleteProduct} />}
          {page === 'transactions' && <TransactionsPage products={store.products} txns={store.txns} onAdd={store.addTxn} onDelete={store.deleteTxn} />}
          {page === 'settings' && <SettingsPage settings={store.settings} capital={store.capital} onUpdateSettings={store.updateSettings} onUpdateCapital={store.updateCapital} firebaseOk={store.firebaseOk} onRefreshFirebase={store.refreshFirebase} />}
        </div>
      </main>

      <Toaster
        toastOptions={{
          style: {
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontFamily: '"DM Sans", system-ui, sans-serif',
          },
        }}
      />
    </div>
  );
}

export default App;
