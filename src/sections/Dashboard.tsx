import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { formatRp, categories } from '@/lib/data';

interface Props {
  stats: any;
  capital: number;
}

const PIE_COLORS = ['oklch(55% 0.14 230)', 'oklch(55% 0.22 25)', 'oklch(55% 0.14 145)', 'oklch(70% 0.15 85)', 'oklch(55% 0.10 300)'];

export default function Dashboard({ stats, capital }: Props) {
  const kpis = [
    { label: 'Penjualan Hari Ini', value: formatRp(stats.totalSalesToday), sub: `${stats.txnCountToday} transaksi`, color: 'var(--color-primary)' },
    { label: 'Penjualan Bulan Ini', value: formatRp(stats.totalSalesMonth), sub: 'Total omzet', color: 'var(--color-success)' },
    { label: 'Laba Bersih Bulan Ini', value: formatRp(stats.netProfitMonth), sub: `Laba kotor: ${formatRp(stats.grossProfitMonth)}`, color: stats.netProfitMonth >= 0 ? 'var(--color-success)' : 'var(--color-error)' },
    { label: 'Pengeluaran Bulan Ini', value: formatRp(stats.totalExpenseMonth), sub: `HPP: ${formatRp(stats.cogsMonth)}`, color: 'var(--color-accent)' },
    { label: 'Nilai Stok (Modal)', value: formatRp(stats.stockValue), sub: `Jual: ${formatRp(stats.stockSellValue)}`, color: 'var(--color-primary)' },
    { label: 'Modal Usaha', value: formatRp(capital), sub: 'Total modal awal', color: 'oklch(55% 0.10 300)' },
  ];

  const pieData = useMemo(() => {
    return Object.entries(stats.catSales as Record<string, number>)
      .map(([key, val]) => ({
        name: categories.find(c => c.id === key)?.label || key,
        value: val,
      }))
      .filter(d => d.value > 0);
  }, [stats.catSales]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h2>
        <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Ringkasan bisnis RPK ZEA</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl p-4"
            style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
            <p className="font-body text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
            <p className="font-display text-lg font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
            <p className="font-body text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Bar Chart - 7 Day Sales */}
        <div className="lg:col-span-2 rounded-xl p-4" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
          <h3 className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Penjualan vs Pengeluaran (7 Hari)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailySales} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(88% 0.01 230)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'oklch(50% 0.01 230)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'oklch(50% 0.01 230)' }} tickFormatter={(v: number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}rb` : String(v)} />
                <Tooltip formatter={(v: number) => formatRp(v)} contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid oklch(88% 0.01 230)' }} />
                <Bar dataKey="sales" name="Penjualan" fill="oklch(55% 0.14 230)" radius={[4,4,0,0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="oklch(55% 0.22 25)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Category */}
        <div className="rounded-xl p-4" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
          <h3 className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Penjualan per Kategori
          </h3>
          {pieData.length > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={30} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatRp(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Belum ada data penjualan
            </div>
          )}
          {pieData.length > 0 && (
            <div className="mt-2 space-y-1">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 font-body text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{d.name}</span>
                  <span className="ml-auto font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatRp(d.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--color-warning-light)', border: '1px solid oklch(70% 0.15 85 / 0.3)' }}>
          <h3 className="font-display text-sm font-semibold mb-2" style={{ color: 'oklch(40% 0.12 85)' }}>
            ⚠️ Stok Menipis ({stats.lowStockProducts.length} produk)
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockProducts.map((p: any) => (
              <span key={p.id} className="px-2.5 py-1 rounded-full font-body text-xs font-medium"
                style={{ background: 'oklch(98% 0.005 85)', color: 'oklch(35% 0.10 85)' }}>
                {p.name}: <strong>{p.stock}</strong> {p.unit}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
