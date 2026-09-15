import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories, formatRp, type Product, type Category } from '@/lib/data';

interface Props {
  products: Product[];
  onSave: (p: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductsPage({ products, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = products.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openNew = () => {
    setEditProd({
      id: `p${Date.now()}`, name: '', category: 'beras',
      priceBuy: 0, priceSell: 0, stock: 0, unit: 'pcs', image: '',
    });
    setIsNew(true);
  };

  const handleSave = (p: Product) => {
    onSave(p);
    setEditProd(null);
    setIsNew(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Produk & Stok</h2>
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>{products.length} produk</p>
        </div>
        <Button onClick={openNew} className="rounded-full font-body text-sm h-9 px-4"
          style={{ background: 'var(--color-success)', color: 'white' }}>
          + Tambah
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Input placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 h-9 rounded-full font-body text-sm" />
        <Select value={catFilter} onValueChange={v => setCatFilter(v as any)}>
          <SelectTrigger className="w-36 h-9 rounded-full font-body text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full font-body text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                <th className="text-left px-3 py-2.5 font-medium text-xs" style={{ color: 'var(--color-text-muted)' }}>Produk</th>
                <th className="text-right px-3 py-2.5 font-medium text-xs hidden sm:table-cell" style={{ color: 'var(--color-text-muted)' }}>Modal</th>
                <th className="text-right px-3 py-2.5 font-medium text-xs" style={{ color: 'var(--color-text-muted)' }}>Harga Jual</th>
                <th className="text-right px-3 py-2.5 font-medium text-xs" style={{ color: 'var(--color-text-muted)' }}>Margin</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs" style={{ color: 'var(--color-text-muted)' }}>Stok</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const margin = p.priceSell - p.priceBuy;
                const marginPct = p.priceBuy > 0 ? ((margin / p.priceBuy) * 100).toFixed(0) : '0';
                return (
                  <tr key={p.id} className="border-t" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-surface-elevated)' }}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--color-primary-container)' }}>
                          <img src={p.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{p.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                            {categories.find(c => c.id === p.category)?.icon} {categories.find(c => c.id === p.category)?.label}
                            {p.badge && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>{p.badge}</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-3 py-2.5 hidden sm:table-cell" style={{ color: 'var(--color-text-secondary)' }}>{formatRp(p.priceBuy)}</td>
                    <td className="text-right px-3 py-2.5 font-semibold" style={{ color: 'var(--color-primary)' }}>{formatRp(p.priceSell)}</td>
                    <td className="text-right px-3 py-2.5">
                      <span className="font-medium" style={{ color: margin > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {formatRp(margin)} <span className="text-[10px]">({marginPct}%)</span>
                      </span>
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold`}
                        style={{
                          background: p.stock <= 5 ? 'var(--color-accent-light)' : 'var(--color-success-light)',
                          color: p.stock <= 5 ? 'var(--color-accent)' : 'var(--color-success)',
                        }}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => { setEditProd(p); setIsNew(false); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      {editProd && (
        <ProductForm product={editProd} isNew={isNew}
          onSave={handleSave}
          onDelete={!isNew ? () => { onDelete(editProd.id); setEditProd(null); } : undefined}
          onClose={() => { setEditProd(null); setIsNew(false); }} />
      )}
    </div>
  );
}

function ProductForm({ product, isNew, onSave, onDelete, onClose }: {
  product: Product; isNew: boolean;
  onSave: (p: Product) => void; onDelete?: () => void; onClose: () => void;
}) {
  const [f, setF] = useState(product);
  const update = (patch: Partial<Product>) => setF(prev => ({ ...prev, ...patch }));

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-base">{isNew ? '✨ Produk Baru' : '✏️ Edit Produk'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="font-body text-xs">Nama *</Label>
            <Input value={f.name} onChange={e => update({ name: e.target.value })} className="mt-1 h-9 rounded-lg font-body text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-body text-xs">Kategori</Label>
              <Select value={f.category} onValueChange={v => update({ category: v as Category })}>
                <SelectTrigger className="mt-1 h-9 rounded-lg font-body text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-body text-xs">Satuan</Label>
              <Input value={f.unit} onChange={e => update({ unit: e.target.value })} className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="kg, btl, dus" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-body text-xs">Harga Beli (Modal) *</Label>
              <Input type="number" value={f.priceBuy || ''} onChange={e => update({ priceBuy: +e.target.value })} className="mt-1 h-9 rounded-lg font-body text-sm" />
            </div>
            <div>
              <Label className="font-body text-xs">Harga Jual *</Label>
              <Input type="number" value={f.priceSell || ''} onChange={e => update({ priceSell: +e.target.value })} className="mt-1 h-9 rounded-lg font-body text-sm" />
            </div>
          </div>
          {f.priceBuy > 0 && f.priceSell > 0 && (
            <p className="font-body text-xs" style={{ color: 'var(--color-success)' }}>
              Margin: {formatRp(f.priceSell - f.priceBuy)} ({((f.priceSell - f.priceBuy) / f.priceBuy * 100).toFixed(1)}%)
            </p>
          )}
          <div>
            <Label className="font-body text-xs">Stok</Label>
            <Input type="number" value={f.stock} onChange={e => update({ stock: +e.target.value })} className="mt-1 h-9 rounded-lg font-body text-sm" />
          </div>
          <div>
            <Label className="font-body text-xs">URL Foto</Label>
            <Input value={f.image} onChange={e => update({ image: e.target.value })} className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="https://..." />
            {f.image && <img src={f.image} alt="" className="mt-1.5 w-14 h-14 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />}
          </div>
          <div>
            <Label className="font-body text-xs">Badge</Label>
            <Select value={f.badge || '__none'} onValueChange={v => update({ badge: v === '__none' ? undefined : v })}>
              <SelectTrigger className="mt-1 h-9 rounded-lg font-body text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— Tidak ada —</SelectItem>
                {['Subsidi','Grosir','Hemat','Baru','Promo'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex gap-2 pt-2">
          {onDelete && <Button variant="outline" onClick={() => { if(confirm('Hapus?')) onDelete(); }} className="rounded-full font-body text-sm" style={{ borderColor:'var(--color-error)', color:'var(--color-error)' }}>Hapus</Button>}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} className="rounded-full font-body text-sm">Batal</Button>
          <Button onClick={() => { if(!f.name) return; handleSave(); }} className="rounded-full font-body text-sm" style={{ background:'var(--color-primary)', color:'white' }}>
            {isNew ? 'Tambah' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function handleSave() { onSave(f); }
}
