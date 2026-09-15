import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRp, expenseCategories, type Product, type Transaction, type SaleItem } from '@/lib/data';

interface Props {
  products: Product[];
  txns: Transaction[];
  onAdd: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionsPage({ products, txns, onAdd, onDelete }: Props) {
  const [showSale, setShowSale] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sale' | 'expense'>('all');

  const filtered = useMemo(() => {
    const list = filter === 'all' ? txns : txns.filter(t => t.type === filter);
    return list.slice(0, 100);
  }, [txns, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Transaksi</h2>
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>{txns.length} total transaksi</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSale(true)} className="rounded-full font-body text-sm h-9 px-4"
            style={{ background: 'var(--color-success)', color: 'white' }}>
            + Penjualan
          </Button>
          <Button onClick={() => setShowExpense(true)} className="rounded-full font-body text-sm h-9 px-4"
            style={{ background: 'var(--color-accent)', color: 'white' }}>
            + Pengeluaran
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(['all', 'sale', 'expense'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full font-body text-xs font-medium transition-colors"
            style={{
              background: filter === f ? 'var(--color-primary)' : 'transparent',
              color: filter === f ? 'white' : 'var(--color-text-secondary)',
            }}>
            {f === 'all' ? 'Semua' : f === 'sale' ? '💰 Penjualan' : '💸 Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Belum ada transaksi. Mulai catat penjualan atau pengeluaran!
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="rounded-xl p-3.5 flex items-center gap-3"
              style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
                style={{
                  background: t.type === 'sale' ? 'var(--color-success-light)' : 'var(--color-accent-light)',
                }}>
                {t.type === 'sale' ? '💰' : '💸'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {t.type === 'sale'
                      ? `${t.items.length} item${t.items.length > 1 ? 's' : ''}`
                      : t.expenseCategory || 'Pengeluaran'}
                  </span>
                  <span className="font-body text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: t.type === 'sale' ? 'var(--color-success-light)' : 'var(--color-accent-light)',
                      color: t.type === 'sale' ? 'var(--color-success)' : 'var(--color-accent)',
                    }}>
                    {t.type === 'sale' ? 'Penjualan' : 'Pengeluaran'}
                  </span>
                </div>
                <p className="font-body text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {t.note && ` · ${t.note}`}
                </p>
                {t.type === 'sale' && t.items.length > 0 && (
                  <p className="font-body text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {t.items.map(i => `${i.productName} x${i.qty}`).join(', ')}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-display text-sm font-bold"
                  style={{ color: t.type === 'sale' ? 'var(--color-success)' : 'var(--color-accent)' }}>
                  {t.type === 'sale' ? '+' : '-'}{formatRp(t.total)}
                </span>
              </div>
              <button onClick={() => { if(confirm('Hapus transaksi ini?')) onDelete(t.id); }}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center opacity-40 hover:opacity-100"
                style={{ color: 'var(--color-error)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sale Dialog */}
      {showSale && <SaleForm products={products} onSave={t => { onAdd(t); setShowSale(false); }} onClose={() => setShowSale(false)} />}
      {showExpense && <ExpenseForm onSave={t => { onAdd(t); setShowExpense(false); }} onClose={() => setShowExpense(false)} />}
    </div>
  );
}

function SaleForm({ products, onSave, onClose }: { products: Product[]; onSave: (t: Transaction) => void; onClose: () => void }) {
  const [items, setItems] = useState<(SaleItem & { _key: number })[]>([]);
  const [note, setNote] = useState('');
  const [selProd, setSelProd] = useState('');
  const [selQty, setSelQty] = useState(1);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const addItem = () => {
    const prod = products.find(p => p.id === selProd);
    if (!prod) return;
    const existing = items.find(i => i.productId === prod.id);
    if (existing) {
      setItems(items.map(i => i.productId === prod.id ? { ...i, qty: i.qty + selQty } : i));
    } else {
      setItems([...items, { _key: Date.now(), productId: prod.id, productName: prod.name, qty: selQty, price: prod.priceSell }]);
    }
    setSelProd('');
    setSelQty(1);
  };

  const submit = () => {
    if (items.length === 0) return;
    onSave({
      id: `txn-${Date.now()}`,
      type: 'sale',
      date: new Date().toISOString(),
      items: items.map(({ _key, ...rest }) => rest),
      total,
      note,
    });
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-base">💰 Catat Penjualan</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="flex gap-2">
            <Select value={selProd} onValueChange={setSelProd}>
              <SelectTrigger className="flex-1 h-9 rounded-lg font-body text-sm"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
              <SelectContent>{products.filter(p=>p.stock>0||p.stock<0).map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({formatRp(p.priceSell)})</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" min={1} value={selQty} onChange={e => setSelQty(+e.target.value)} className="w-16 h-9 rounded-lg font-body text-sm text-center" />
            <Button onClick={addItem} disabled={!selProd} className="h-9 rounded-lg font-body text-sm px-3"
              style={{ background: 'var(--color-primary)', color: 'white' }}>+</Button>
          </div>

          {items.length > 0 && (
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-subtle)' }}>
              {items.map(item => (
                <div key={item._key} className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0"
                  style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg)' }}>
                  <span className="flex-1 font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {item.productName} <span style={{ color: 'var(--color-text-muted)' }}>x{item.qty}</span>
                  </span>
                  <span className="font-display text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {formatRp(item.price * item.qty)}
                  </span>
                  <button onClick={() => setItems(items.filter(i => i._key !== item._key))} className="text-xs opacity-50 hover:opacity-100" style={{ color: 'var(--color-error)' }}>✕</button>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2.5 font-display font-bold text-base"
                style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <span>Total</span><span>{formatRp(total)}</span>
              </div>
            </div>
          )}

          <div>
            <Label className="font-body text-xs">Catatan (opsional)</Label>
            <Input value={note} onChange={e => setNote(e.target.value)} className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="Nama pembeli, dll." />
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-full font-body text-sm">Batal</Button>
          <Button onClick={submit} disabled={items.length === 0} className="rounded-full font-body text-sm"
            style={{ background: 'var(--color-success)', color: 'white' }}>
            Simpan Penjualan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExpenseForm({ onSave, onClose }: { onSave: (t: Transaction) => void; onClose: () => void }) {
  const [cat, setCat] = useState(expenseCategories[0]);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');

  const submit = () => {
    if (amount <= 0) return;
    onSave({
      id: `txn-${Date.now()}`,
      type: 'expense',
      date: new Date().toISOString(),
      items: [],
      expenseCategory: cat,
      total: amount,
      note,
    });
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-base">💸 Catat Pengeluaran</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="font-body text-xs">Kategori</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="mt-1 h-9 rounded-lg font-body text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-body text-xs">Jumlah (Rp) *</Label>
            <Input type="number" value={amount || ''} onChange={e => setAmount(+e.target.value)} className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="50000" />
          </div>
          <div>
            <Label className="font-body text-xs">Catatan</Label>
            <Input value={note} onChange={e => setNote(e.target.value)} className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="Detail pengeluaran" />
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-full font-body text-sm">Batal</Button>
          <Button onClick={submit} disabled={amount <= 0} className="rounded-full font-body text-sm"
            style={{ background: 'var(--color-accent)', color: 'white' }}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
