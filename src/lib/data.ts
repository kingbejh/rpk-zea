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
// Kosong — user yang isi sendiri semua produk via app
export const defaultProducts: Product[] = [];

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
  getCapital: (): number => loadLocal(KEYS.capital, 0),
  getSettings: (): StoreSettings => loadLocal(KEYS.settings, {
    name: 'RPK ZEA',
    address: 'Ruko Bukit Sakura BG 00 No. 33, Citra Indah City Jonggol, Kab. Bogor',
    phone: '089512443677',
    pin: '1234',
  }),

  // Writes (dual: localStorage + Firebase)
  saveProducts: (p: Product[]) => saveBoth(KEYS.products, 'rpk-zea/products', p),
  saveTxns: (t: Transaction[]) => saveBoth(KEYS.transactions, 'rpk-zea/transactions', t),
  saveCapital: (c: number) => saveBoth(KEYS.capital, 'rpk-zea/capital', c),
  saveSettings: (s: StoreSettings) => saveBoth(KEYS.settings, 'rpk-zea/settings', s),

  // Async reads from Firebase (initial sync)
  syncFromFirebase: async () => {
    if (!isFirebaseConfigured()) return null;
    const [products, txns, capital, settings] = await Promise.all([
      loadBoth<Product[]>(KEYS.products, 'rpk-zea/products', defaultProducts),
      loadBoth<Transaction[]>(KEYS.transactions, 'rpk-zea/transactions', []),
      loadBoth<number>(KEYS.capital, 'rpk-zea/capital', 0),
      loadBoth<StoreSettings>(KEYS.settings, 'rpk-zea/settings', db.getSettings()),
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
