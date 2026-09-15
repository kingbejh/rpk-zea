import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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

      {/* Product Cards (mobile-friendly) */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {products.length === 0 ? 'Belum ada produk. Tap "+ Tambah" untuk mulai.' : 'Produk tidak ditemukan.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const margin = p.priceSell - p.priceBuy;
            const marginPct = p.priceBuy > 0 ? ((margin / p.priceBuy) * 100).toFixed(0) : '0';
            const hasWholesale = p.priceWholesale && p.wholesaleMin;
            return (
              <div key={p.id} className="rounded-xl p-3.5 flex items-center gap-3"
                style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
                {/* Thumbnail */}
                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--color-primary-container)' }}>
                  {p.image ? (
                    <img src={p.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {categories.find(c => c.id === p.category)?.icon || '📦'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-body text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {p.name}
                    </span>
                    {p.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                        style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-display text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {formatRp(p.priceSell)}<span className="font-body text-[10px] font-normal" style={{ color: 'var(--color-text-muted)' }}>/{p.unit}</span>
                    </span>
                    {hasWholesale && (
                      <span className="font-body text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: 'var(--color-promo-bg)', color: 'var(--color-promo)' }}>
                        Grosir ≥{p.wholesaleMin}: {formatRp(p.priceWholesale!)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 font-body text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    <span>Modal: {formatRp(p.priceBuy)}</span>
                    <span style={{ color: margin > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                      +{formatRp(margin)} ({marginPct}%)
                    </span>
                  </div>
                </div>

                {/* Stock */}
                <div className="text-center shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold block"
                    style={{
                      background: p.stock <= 5 ? 'var(--color-accent-light)' : 'var(--color-success-light)',
                      color: p.stock <= 5 ? 'var(--color-accent)' : 'var(--color-success)',
                    }}>
                    {p.stock}
                  </span>
                  <span className="text-[10px] mt-0.5 block" style={{ color: 'var(--color-text-muted)' }}>{p.unit}</span>
                </div>

                {/* Edit */}
                <button onClick={() => { setEditProd(p); setIsNew(false); }}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

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
  const [hasWholesale, setHasWholesale] = useState(!!(product.priceWholesale && product.wholesaleMin));
  const update = (patch: Partial<Product>) => setF(prev => ({ ...prev, ...patch }));

  const handleSave = () => {
    if (!f.name) return;
    const saved = { ...f };
    if (!hasWholesale) {
      saved.priceWholesale = undefined;
      saved.wholesaleMin = undefined;
    }
    onSave(saved);
  };

  const marginRetail = f.priceSell - f.priceBuy;
  const marginWholesale = (f.priceWholesale || 0) - f.priceBuy;

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-base">{isNew ? '✨ Produk Baru' : '✏️ Edit Produk'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          {/* Name */}
          <div>
            <Label className="font-body text-xs">Nama Produk *</Label>
            <Input value={f.name} onChange={e => update({ name: e.target.value })} className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="Contoh: Beras SPHP 5kg" />
          </div>

          {/* Category + Unit */}
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
              <Input value={f.unit} onChange={e => update({ unit: e.target.value })} className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="sak, btl, kg" />
            </div>
          </div>

          {/* Price Buy */}
          <div>
            <Label className="font-body text-xs">Harga Beli / Modal (per {f.unit || 'unit'}) *</Label>
            <Input type="number" inputMode="numeric" value={f.priceBuy || ''} onChange={e => update({ priceBuy: +e.target.value })}
              className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="55000" />
          </div>

          {/* Price Sell (Retail) */}
          <div>
            <Label className="font-body text-xs">Harga Jual Satuan (per {f.unit || 'unit'}) *</Label>
            <Input type="number" inputMode="numeric" value={f.priceSell || ''} onChange={e => update({ priceSell: +e.target.value })}
              className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="62000" />
            {f.priceBuy > 0 && f.priceSell > 0 && (
              <p className="font-body text-xs mt-1" style={{ color: marginRetail > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                Margin satuan: {formatRp(marginRetail)} ({((marginRetail / f.priceBuy) * 100).toFixed(1)}%)
              </p>
            )}
          </div>

          {/* Wholesale Toggle */}
          <div className="rounded-lg p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-subtle)' }}>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-body text-xs font-semibold">Harga Grosir</Label>
                <p className="font-body text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  Harga berbeda untuk pembelian dalam jumlah banyak
                </p>
              </div>
              <Switch checked={hasWholesale} onCheckedChange={setHasWholesale} />
            </div>

            {hasWholesale && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-body text-[11px]">Minimal Beli</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input type="number" inputMode="numeric" value={f.wholesaleMin || ''} onChange={e => update({ wholesaleMin: +e.target.value })}
                        className="h-9 rounded-lg font-body text-sm" placeholder="10" />
                      <span className="font-body text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>{f.unit}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="font-body text-[11px]">Harga Grosir (per {f.unit || 'unit'})</Label>
                    <Input type="number" inputMode="numeric" value={f.priceWholesale || ''} onChange={e => update({ priceWholesale: +e.target.value })}
                      className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="60000" />
                  </div>
                </div>
                {f.priceBuy > 0 && f.priceWholesale && f.priceWholesale > 0 && (
                  <p className="font-body text-xs" style={{ color: marginWholesale > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    Margin grosir: {formatRp(marginWholesale)} ({((marginWholesale / f.priceBuy) * 100).toFixed(1)}%)
                    {f.wholesaleMin && f.wholesaleMin > 0 && (
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {' '}· Min {f.wholesaleMin} {f.unit} = {formatRp(f.priceWholesale * f.wholesaleMin)}/order
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stock */}
          <div>
            <Label className="font-body text-xs">Stok (dalam {f.unit || 'unit'})</Label>
            <Input type="number" inputMode="numeric" value={f.stock} onChange={e => update({ stock: +e.target.value })}
              className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="0" />
          </div>

          {/* Image */}
          <div>
            <Label className="font-body text-xs">URL Foto (opsional)</Label>
            <Input value={f.image} onChange={e => update({ image: e.target.value })} className="mt-1 h-9 rounded-lg font-body text-sm" placeholder="https://..." />
            {f.image && <img src={f.image} alt="" className="mt-1.5 w-14 h-14 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />}
          </div>

          {/* Badge */}
          <div>
            <Label className="font-body text-xs">Badge / Label</Label>
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
          {onDelete && <Button variant="outline" onClick={() => { if(confirm('Hapus produk ini?')) onDelete(); }} className="rounded-full font-body text-sm" style={{ borderColor:'var(--color-error)', color:'var(--color-error)' }}>Hapus</Button>}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} className="rounded-full font-body text-sm">Batal</Button>
          <Button onClick={handleSave} className="rounded-full font-body text-sm" style={{ background:'var(--color-primary)', color:'white' }}>
            {isNew ? 'Tambah' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
