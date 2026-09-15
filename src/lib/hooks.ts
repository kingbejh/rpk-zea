import { useState, useCallback, useMemo, useEffect } from 'react';
import { db, type Product, type Transaction, type StoreSettings } from './data';
import { isFirebaseConfigured } from './firebase';

export function useStore() {
  const [products, setProducts] = useState<Product[]>(db.getProducts);
  const [txns, setTxns] = useState<Transaction[]>(db.getTxns);
  const [capital, setCapital] = useState<number>(db.getCapital);
  const [settings, setSettings] = useState<StoreSettings>(db.getSettings);
  const [firebaseOk, setFirebaseOk] = useState(isFirebaseConfigured);

  // Initial Firebase sync on mount
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    setFirebaseOk(true);
    db.syncFromFirebase().then(data => {
      if (data) {
        setProducts(data.products);
        setTxns(data.txns);
        setCapital(data.capital);
        setSettings(data.settings);
      }
    });
  }, []);

  const saveProduct = useCallback((p: Product) => {
    setProducts(prev => {
      const exists = prev.find(x => x.id === p.id);
      const next = exists ? prev.map(x => x.id === p.id ? p : x) : [...prev, p];
      db.saveProducts(next);
      return next;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => {
      const next = prev.filter(x => x.id !== id);
      db.saveProducts(next);
      return next;
    });
  }, []);

  const addTxn = useCallback((t: Transaction) => {
    setTxns(prev => {
      const next = [t, ...prev];
      db.saveTxns(next);
      return next;
    });
    if (t.type === 'sale') {
      setProducts(prev => {
        const next = prev.map(p => {
          const item = t.items.find(i => i.productId === p.id);
          if (item && p.stock >= 0) return { ...p, stock: Math.max(0, p.stock - item.qty) };
          return p;
        });
        db.saveProducts(next);
        return next;
      });
    }
  }, []);

  const deleteTxn = useCallback((id: string) => {
    setTxns(prev => {
      const next = prev.filter(x => x.id !== id);
      db.saveTxns(next);
      return next;
    });
  }, []);

  const updateCapital = useCallback((c: number) => {
    setCapital(c);
    db.saveCapital(c);
  }, []);

  const updateSettings = useCallback((s: StoreSettings) => {
    setSettings(s);
    db.saveSettings(s);
  }, []);

  const refreshFirebase = useCallback(() => {
    setFirebaseOk(isFirebaseConfigured());
    if (isFirebaseConfigured()) {
      db.syncFromFirebase().then(data => {
        if (data) {
          setProducts(data.products);
          setTxns(data.txns);
          setCapital(data.capital);
          setSettings(data.settings);
        }
      });
    }
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const today = now.toISOString().slice(0, 10);
    const monthTxns = txns.filter(t => t.date.startsWith(thisMonth));
    const todayTxns = txns.filter(t => t.date.startsWith(today));
    const totalSalesMonth = monthTxns.filter(t => t.type === 'sale').reduce((s,t) => s + t.total, 0);
    const totalExpenseMonth = monthTxns.filter(t => t.type === 'expense').reduce((s,t) => s + t.total, 0);
    const totalSalesToday = todayTxns.filter(t => t.type === 'sale').reduce((s,t) => s + t.total, 0);
    const txnCountToday = todayTxns.filter(t => t.type === 'sale').length;
    const cogsMonth = monthTxns.filter(t => t.type === 'sale').flatMap(t => t.items).reduce((s, item) => {
      const prod = products.find(p => p.id === item.productId);
      return s + (prod ? prod.priceBuy * item.qty : 0);
    }, 0);
    const grossProfitMonth = totalSalesMonth - cogsMonth;
    const netProfitMonth = grossProfitMonth - totalExpenseMonth;
    const stockValue = products.reduce((s, p) => s + (p.stock >= 0 ? p.priceBuy * p.stock : 0), 0);
    const stockSellValue = products.reduce((s, p) => s + (p.stock >= 0 ? p.priceSell * p.stock : 0), 0);
    const lowStockProducts = products.filter(p => p.stock >= 0 && p.stock <= 5);
    const dailySales: { date: string; sales: number; expense: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const dayTxns = txns.filter(t => t.date.startsWith(ds));
      dailySales.push({
        date: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        sales: dayTxns.filter(t => t.type === 'sale').reduce((s,t) => s + t.total, 0),
        expense: dayTxns.filter(t => t.type === 'expense').reduce((s,t) => s + t.total, 0),
      });
    }
    const catSales: Record<string, number> = {};
    monthTxns.filter(t => t.type === 'sale').flatMap(t => t.items).forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) { catSales[prod.category] = (catSales[prod.category] || 0) + item.price * item.qty; }
    });
    return { totalSalesMonth, totalExpenseMonth, grossProfitMonth, netProfitMonth, totalSalesToday, txnCountToday, stockValue, stockSellValue, lowStockProducts, dailySales, catSales, cogsMonth };
  }, [txns, products]);

  return { products, saveProduct, deleteProduct, txns, addTxn, deleteTxn, capital, updateCapital, settings, updateSettings, stats, firebaseOk, refreshFirebase };
}
