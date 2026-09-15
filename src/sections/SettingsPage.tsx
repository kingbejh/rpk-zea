import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { db, formatRp, type StoreSettings } from '@/lib/data';
import { setFirebaseURL, isFirebaseConfigured } from '@/lib/firebase';

interface Props {
  settings: StoreSettings;
  capital: number;
  onUpdateSettings: (s: StoreSettings) => void;
  onUpdateCapital: (c: number) => void;
  firebaseOk: boolean;
  onRefreshFirebase: () => void;
}

export default function SettingsPage({ settings, capital, onUpdateSettings, onUpdateCapital, firebaseOk, onRefreshFirebase }: Props) {
  const [s, setS] = useState(settings);
  const [cap, setCap] = useState(capital);
  const [newPin, setNewPin] = useState('');
  const [fbUrl, setFbUrl] = useState(localStorage.getItem('rpkzea_fb_url') || '');
  const fileRef = useRef<HTMLInputElement>(null);

  const saveFirebaseUrl = () => {
    setFirebaseURL(fbUrl);
    onRefreshFirebase();
    alert('Firebase URL disimpan! Data akan disinkronkan.');
  };

  const saveInfo = () => {
    onUpdateSettings({ ...s });
    alert('Info toko disimpan!');
  };

  const saveCapital = () => {
    onUpdateCapital(cap);
    alert('Modal disimpan!');
  };

  const changePin = () => {
    if (newPin.length < 4) { alert('PIN minimal 4 digit'); return; }
    onUpdateSettings({ ...settings, pin: newPin });
    setNewPin('');
    alert('PIN berhasil diubah!');
  };

  const handleExport = () => {
    const data = db.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rpk-zea-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        db.importAll(reader.result as string);
        alert('Data berhasil diimpor! Halaman akan di-refresh.');
        window.location.reload();
      } catch {
        alert('File tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('RESET SEMUA DATA? Semua produk, transaksi, dan pengaturan akan kembali ke default. Ini tidak bisa dibatalkan!')) {
      db.clearAll();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Pengaturan</h2>
        <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Kelola toko, modal, dan data</p>
      </div>

      {/* Store Info */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
        <h3 className="font-display text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>🏪 Info Toko</h3>
        <div>
          <Label className="font-body text-xs">Nama Toko</Label>
          <Input value={s.name} onChange={e => setS({...s, name: e.target.value})} className="mt-1 h-9 rounded-lg font-body text-sm" />
        </div>
        <div>
          <Label className="font-body text-xs">Alamat</Label>
          <Input value={s.address} onChange={e => setS({...s, address: e.target.value})} className="mt-1 h-9 rounded-lg font-body text-sm" />
        </div>
        <div>
          <Label className="font-body text-xs">No. WhatsApp</Label>
          <Input value={s.phone} onChange={e => setS({...s, phone: e.target.value})} className="mt-1 h-9 rounded-lg font-body text-sm" />
        </div>
        <Button onClick={saveInfo} className="rounded-full font-body text-sm h-9 px-5" style={{ background: 'var(--color-primary)', color: 'white' }}>
          Simpan
        </Button>
      </div>

      {/* Capital */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
        <h3 className="font-display text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>💰 Modal Usaha</h3>
        <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>Total modal yang sudah kamu keluarkan untuk usaha ini</p>
        <div>
          <Label className="font-body text-xs">Jumlah Modal (Rp)</Label>
          <Input type="number" value={cap} onChange={e => setCap(+e.target.value)} className="mt-1 h-9 rounded-lg font-body text-sm" />
          <p className="font-body text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Saat ini: {formatRp(capital)}</p>
        </div>
        <Button onClick={saveCapital} className="rounded-full font-body text-sm h-9 px-5" style={{ background: 'var(--color-primary)', color: 'white' }}>
          Simpan Modal
        </Button>
      </div>

      {/* PIN */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
        <h3 className="font-display text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>🔐 Keamanan</h3>
        <div>
          <Label className="font-body text-xs">Ganti PIN Login</Label>
          <div className="flex gap-2 mt-1">
            <Input type="password" inputMode="numeric" maxLength={8} value={newPin} onChange={e => setNewPin(e.target.value)}
              placeholder="PIN baru (min 4 digit)" className="h-9 rounded-lg font-body text-sm" />
            <Button onClick={changePin} className="rounded-full h-9 px-4 font-body text-sm" style={{ background: 'var(--color-primary)', color: 'white' }}>
              Ubah
            </Button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
        <h3 className="font-display text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>💾 Kelola Data</h3>

        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="rounded-full font-body text-sm h-9 px-4">
            📥 Export Backup
          </Button>
          <Button onClick={() => fileRef.current?.click()} variant="outline" className="rounded-full font-body text-sm h-9 px-4">
            📤 Import Data
          </Button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>

        <Separator />

        <div>
          <Button onClick={handleReset} variant="outline" className="rounded-full font-body text-sm h-9 px-4"
            style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
            🗑️ Reset Semua Data
          </Button>
          <p className="font-body text-[10px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Semua data produk, transaksi, dan pengaturan akan dihapus
          </p>
        </div>
      </div>

      {/* Firebase */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>🔥 Firebase Database</h3>
          <span className="px-2 py-0.5 rounded-full font-body text-[10px] font-medium"
            style={{
              background: firebaseOk ? 'var(--color-success-light)' : 'var(--color-accent-light)',
              color: firebaseOk ? 'var(--color-success)' : 'var(--color-accent)',
            }}>
            {firebaseOk ? '✅ Terhubung' : '⚪ Offline (localStorage)'}
          </span>
        </div>
        <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Hubungkan ke Firebase Realtime Database agar data bisa diakses dari device mana saja.
        </p>
        <div>
          <Label className="font-body text-xs">Database URL</Label>
          <div className="flex gap-2 mt-1">
            <Input value={fbUrl} onChange={e => setFbUrl(e.target.value)}
              placeholder="https://your-project.firebasedatabase.app"
              className="h-9 rounded-lg font-body text-sm flex-1" />
            <Button onClick={saveFirebaseUrl} className="rounded-full h-9 px-4 font-body text-sm"
              style={{ background: 'var(--color-primary)', color: 'white' }}>
              Hubungkan
            </Button>
          </div>
          <p className="font-body text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Buat project di console.firebase.google.com → Realtime Database → Copy URL
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl p-4" style={{ background: 'var(--color-primary-container)' }}>
        <h4 className="font-display text-sm font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>💡 Tips</h4>
        <ul className="font-body text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
          <li>• Data tersimpan di browser (localStorage). Export backup secara berkala!</li>
          <li>• Kalau pindah device, import file backup untuk mengembalikan data</li>
          <li>• Catat setiap penjualan agar laporan laba/rugi akurat</li>
          <li>• Update stok setelah restok barang baru</li>
        </ul>
      </div>
    </div>
  );
}
