import { fbSet, fbGet, isFirebaseConfigured } from './firebase';

// ============ TYPES ============
export interface Product {
  id: string;
  name: string;
  category: Category;
  priceBuy: number;
  priceSell: number;
  stock: number;
  unit: string;
  image: string;
  badge?: string;
}

export type Category = 'beras' | 'minyak' | 'makanan' | 'minuman' | 'lainnya';

export interface Transaction {
  id: string;
  type: 'sale' | 'expense';
  date: string;
  items: SaleItem[];
  expenseCategory?: string;
  total: number;
  note: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  pin: string;
}

// ============ CONSTANTS ============
export const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'beras', label: 'Beras', icon: '🌾' },
  { id: 'minyak', label: 'Minyak Goreng', icon: '🫗' },
  { id: 'makanan', label: 'Makanan & Snack', icon: '🍜' },
  { id: 'minuman', label: 'Minuman', icon: '🥤' },
  { id: 'lainnya', label: 'Lainnya', icon: '📦' },
];

export const expenseCategories = [
  'Restok Barang', 'Sewa / Listrik / Air', 'Gaji Karyawan',
  'Transport / Ongkir', 'Perlengkapan Toko', 'Lainnya',
];

export const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

// ============ DEFAULT DATA ============
export const defaultProducts: Product[] = [
  { id: 'p1', name: 'Beras SPHP BULOG 5kg', category: 'beras', priceBuy: 52000, priceSell: 60000, stock: 50, unit: 'sak', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&q=70', badge: 'Subsidi' },
  { id: 'p2', name: 'Beras Premium 5kg', category: 'beras', priceBuy: 68000, priceSell: 76000, stock: 30, unit: 'sak', image: 'https://images.unsplash.com/photo-1536304993881-460ea32a3b0f?w=300&h=300&fit=crop&q=70' },
  { id: 'p3', name: 'Beras Medium 25kg', category: 'beras', priceBuy: 260000, priceSell: 285000, stock: 15, unit: 'karung', image: 'https://images.unsplash.com/photo-1594054448498-73fa2ace8ada?w=300&h=300&fit=crop&q=70', badge: 'Grosir' },
  { id: 'p4', name: 'Minyak Goreng 1L', category: 'minyak', priceBuy: 15000, priceSell: 18000, stock: 60, unit: 'btl', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop&q=70' },
  { id: 'p5', name: 'Minyak Goreng 2L', category: 'minyak', priceBuy: 29000, priceSell: 34000, stock: 40, unit: 'btl', image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=300&h=300&fit=crop&q=70' },
  { id: 'p6', name: 'Minyak Goreng 5L', category: 'minyak', priceBuy: 70000, priceSell: 78000, stock: 20, unit: 'jrgn', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop&q=70', badge: 'Hemat' },
  { id: 'p7', name: 'Indomie Goreng 1 dus', category: 'makanan', priceBuy: 100000, priceSell: 115000, stock: 25, unit: 'dus', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&h=300&fit=crop&q=70' },
  { id: 'p8', name: 'Gula Pasir 1kg', category: 'makanan', priceBuy: 15000, priceSell: 17500, stock: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&h=300&fit=crop&q=70' },
  { id: 'p9', name: 'Telur Ayam 1kg', category: 'makanan', priceBuy: 24000, priceSell: 28000, stock: 30, unit: 'kg', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop&q=70' },
  { id: 'p10', name: 'Tepung Terigu 1kg', category: 'makanan', priceBuy: 10500, priceSell: 12500, stock: 35, unit: 'kg', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop&q=70' },
  { id: 'p11', name: 'Aqua 600ml', category: 'minuman', priceBuy: 3000, priceSell: 4000, stock: 120, unit: 'btl', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&h=300&fit=crop&q=70' },
  { id: 'p12', name: 'Teh Botol Sosro', category: 'minuman', priceBuy: 3800, priceSell: 5000, stock: 80, unit: 'btl', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop&q=70' },
  { id: 'p13', name: 'Gas LPG 3kg (isi)', category: 'lainnya', priceBuy: 18000, priceSell: 22000, stock: 10, unit: 'tbg', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=300&fit=crop&q=70' },
  { id: 'p14', name: 'Sabun Cuci Rinso 800g', category: 'lainnya', priceBuy: 11000, priceSell: 14000, stock: 25, unit: 'pcs', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop&q=70' },
];

// ============ STORAGE (localStorage + Firebase sync) ============
const KEYS = {
  products: 'rpkzea_products',
  transactions: 'rpkzea_txn',
  settings: 'rpkzea_settings',
  capital: 'rpkzea_capital',
};

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}
function saveLocal(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Dual-write: save to localStorage AND Firebase
function saveBoth(localKey: string, fbPath: string, data: unknown) {
  saveLocal(localKey, data);
  if (isFirebaseConfigured()) {
    fbSet(fbPath, data);
  }
}

// Read: try Firebase first, fallback to localStorage
async function loadBoth<T>(localKey: string, fbPath: string, fallback: T): Promise<T> {
  if (isFirebaseConfigured()) {
    const fbData = await fbGet<T>(fbPath);
    if (fbData !== null) {
      saveLocal(localKey, fbData); // sync to local cache
      return fbData;
    }
  }
  return loadLocal(localKey, fallback);
}

export const db = {
  // Synchronous reads (from localStorage cache)
  getProducts: (): Product[] => loadLocal(KEYS.products, defaultProducts),
  getTxns: (): Transaction[] => loadLocal(KEYS.transactions, []),
  getCapital: (): number => loadLocal(KEYS.capital, 5000000),
  getSettings: (): StoreSettings => loadLocal(KEYS.settings, {
    name: 'RPK ZEA',
    address: 'Ruko Bukit Sakura BG 00 No. 33, Citra Indah City Jonggol, Kab. Bogor',
    phone: '089512443677',
    pin: '1234',
  }),

  // Writes (dual: localStorage + Firebase)
  saveProducts: (p: Product[]) => saveBoth(KEYS.products, 'store/products', p),
  saveTxns: (t: Transaction[]) => saveBoth(KEYS.transactions, 'store/transactions', t),
  saveCapital: (c: number) => saveBoth(KEYS.capital, 'store/capital', c),
  saveSettings: (s: StoreSettings) => saveBoth(KEYS.settings, 'store/settings', s),

  // Async reads from Firebase (initial sync)
  syncFromFirebase: async () => {
    if (!isFirebaseConfigured()) return null;
    const [products, txns, capital, settings] = await Promise.all([
      loadBoth<Product[]>(KEYS.products, 'store/products', defaultProducts),
      loadBoth<Transaction[]>(KEYS.transactions, 'store/transactions', []),
      loadBoth<number>(KEYS.capital, 'store/capital', 5000000),
      loadBoth<StoreSettings>(KEYS.settings, 'store/settings', db.getSettings()),
    ]);
    return { products, txns, capital, settings };
  },

  // Export/Import
  exportAll: () => JSON.stringify({
    products: db.getProducts(),
    transactions: db.getTxns(),
    capital: db.getCapital(),
    settings: db.getSettings(),
    exportedAt: new Date().toISOString(),
  }, null, 2),

  importAll: (json: string) => {
    const d = JSON.parse(json);
    if (d.products) db.saveProducts(d.products);
    if (d.transactions) db.saveTxns(d.transactions);
    if (d.capital !== undefined) db.saveCapital(d.capital);
    if (d.settings) db.saveSettings(d.settings);
  },

  clearAll: () => Object.values(KEYS).forEach(k => localStorage.removeItem(k)),
};
