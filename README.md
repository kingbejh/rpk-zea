# RPK ZEA — Sistem Manajemen Bisnis

Web app all-in-one untuk mengelola bisnis **Rumah Pangan Kita (RPK) ZEA** — toko sembako mitra BULOG di Citra Indah City Jonggol.

## Fitur

- 📊 **Dashboard** — KPI real-time, grafik penjualan 7 hari, pie chart per kategori, alert stok menipis
- 📦 **Manajemen Produk** — CRUD produk, harga beli/jual, margin otomatis, stok tracking
- 💳 **Transaksi** — Catat penjualan & pengeluaran, stok otomatis berkurang
- 📈 **Laporan Keuangan** — Laba kotor, laba bersih, HPP, pengeluaran bulanan
- 💰 **Modal Usaha** — Tracking modal awal
- 🔥 **Firebase Realtime Database** — Sync data ke cloud, akses dari device mana aja
- 💾 **Export/Import** — Backup data ke JSON, restore kapan saja
- 🔐 **PIN Login** — Akses admin terlindungi

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts (grafik)
- Firebase Realtime Database (REST API)
- Parcel (bundling ke single HTML)

## Setup Firebase

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Buat project baru (nama: `rpk-zea`)
3. Buka **Realtime Database** → Create Database → Start in **test mode**
4. Copy URL database (contoh: `https://rpk-zea-xxxxx.firebasedatabase.app`)
5. Di app, buka **Pengaturan** → paste URL di bagian **Firebase Database** → klik **Hubungkan**

## Development

```bash
pnpm install
pnpm dev
```

## Build (Single HTML)

```bash
bash scripts/bundle-artifact.sh
# Output: bundle.html
```

## Info Toko

- **Nama**: RPK ZEA (Rumah Pangan Kita ZEA)
- **Alamat**: Ruko Bukit Sakura BG 00 No. 33, Citra Indah City Jonggol, Kab. Bogor
- **WhatsApp**: 089512443677
