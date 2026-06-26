import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

import { API_BASE_URL } from "../config";

const CartContext = createContext();

const API_BASE = `${API_BASE_URL}/api/cart`;

/* Helper: per-user localStorage keys */
function keys(userId) {
  const prefix = userId ? `amazeon_${userId}` : "amazeon_guest";
  return {
    cart:   `${prefix}_cart`,
    orders: `${prefix}_orders`,
    coupon: `${prefix}_coupon`,
  };
}

function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const { token, user } = useAuth();
  const userId = user?._id || user?.id || null;

  /* ── State — all initialised to empty; loaded on user-change ── */
  const [cartItems, setCartItems]   = useState([]);
  const [orders,    setOrders]      = useState([]);
  const [coupon,    setCoupon]      = useState({ code: "", discount: 0 });

  /* Track previous userId to detect switches */
  const prevUserIdRef = useRef(userId);

  /* ── Reload data whenever the logged-in user changes ─────────── */
  useEffect(() => {
    const prevId = prevUserIdRef.current;

    /* Save previous user's state before switching */
    if (prevId !== userId && prevId !== null) {
      const k = keys(prevId);
      // (already saved live via the write-effects below)
      // Reset state to empty first so we don't flash another user's data
      setCartItems([]);
      setOrders([]);
      setCoupon({ code: "", discount: 0 });
    }

    prevUserIdRef.current = userId;

    /* Load this user's saved data */
    const k = keys(userId);
    setCartItems(readJSON(k.cart,   []));
    setOrders(   readJSON(k.orders, []));
    setCoupon(   readJSON(k.coupon, { code: "", discount: 0 }));
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Persist live changes ─────────────────────────────────────── */
  useEffect(() => {
    localStorage.setItem(keys(userId).cart, JSON.stringify(cartItems));
  }, [cartItems, userId]);

  useEffect(() => {
    localStorage.setItem(keys(userId).orders, JSON.stringify(orders));
  }, [orders, userId]);

  useEffect(() => {
    localStorage.setItem(keys(userId).coupon, JSON.stringify(coupon));
  }, [coupon, userId]);

  /* ── Backend sync on login ────────────────────────────────────── */
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    if (!token || !userId) return;

    const syncAndFetch = async () => {
      try {
        // Sync any locally stored guest items for this user to the server
        const k = keys(userId);
        const local = readJSON(k.cart, []);
        for (const item of local) {
          const pid = item.id || item._id;
          if (!pid || typeof pid !== "string" || pid.length !== 24) continue;
          try {
            await axios.post(`${API_BASE}/add`, { productId: pid, quantity: item.quantity || 1 }, getHeaders());
          } catch { /* skip invalid */ }
        }

        // Fetch authoritative cart from DB
        const res = await axios.get(API_BASE, getHeaders());
        if (res.data.success) {
          const dbItems = res.data.data.items.map(i => ({
            id:          i.productId._id,
            title:       i.productId.title,
            price:       i.productId.price,
            image:       i.productId.image,
            description: i.productId.description,
            quantity:    i.quantity,
            stock:       i.productId.stock,
          }));
          setCartItems(dbItems);
        }
      } catch (err) {
        console.error("Cart sync error:", err);
        // Clear corrupt cache
        localStorage.setItem(keys(userId).cart, JSON.stringify([]));
      }
    };

    syncAndFetch();
  }, [token, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Cart actions ─────────────────────────────────────────────── */
  const addToCart = async (product, quantity = 1) => {
    const qty = Number(quantity);
    setCartItems(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...product, quantity: qty }];
    });
    if (token) {
      try { await axios.post(`${API_BASE}/add`, { productId: product.id, quantity: qty }, getHeaders()); }
      catch (e) { console.error("addToCart DB error", e); }
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems(prev => prev.filter(i => i.id !== productId));
    if (token) {
      try { await axios.delete(`${API_BASE}/remove`, { headers: { Authorization: `Bearer ${token}` }, data: { productId } }); }
      catch (e) { console.error("removeFromCart DB error", e); }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) { removeFromCart(productId); return; }
    setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: qty } : i));
    if (token) {
      try { await axios.put(`${API_BASE}/update`, { productId, quantity: qty }, getHeaders()); }
      catch (e) { console.error("updateQuantity DB error", e); }
    }
  };

  const clearCart = async () => {
    const snapshot = [...cartItems];
    setCartItems([]);
    removeCoupon();
    if (token && snapshot.length > 0) {
      for (const item of snapshot) {
        try { await axios.delete(`${API_BASE}/remove`, { headers: { Authorization: `Bearer ${token}` }, data: { productId: item.id } }); }
        catch { /* silent */ }
      }
    }
  };

  /* ── Orders ───────────────────────────────────────────────────── */
  const addOrder = (order) => setOrders(prev => [order, ...prev]);

  /* ── Coupons ──────────────────────────────────────────────────── */
  const applyCoupon = (code) => {
    const c = code.toUpperCase().trim();
    if (c === "SAVE10")    { setCoupon({ code: "SAVE10",    discount: 10 }); return { success: true,  message: "10% discount applied!" }; }
    if (c === "WELCOME20") { setCoupon({ code: "WELCOME20", discount: 20 }); return { success: true,  message: "20% discount applied!" }; }
    return { success: false, message: "Invalid coupon code." };
  };

  const removeCoupon = () => setCoupon({ code: "", discount: 0 });

  /* ── Derived values ───────────────────────────────────────────── */
  const cartCount      = cartItems.reduce((a, i) => a + i.quantity, 0);
  const cartSubtotal   = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);
  const cartDiscount   = Math.round((cartSubtotal * coupon.discount) / 100);
  const cartGrandTotal = cartSubtotal - cartDiscount;

  return (
    <CartContext.Provider value={{
      cartItems, orders, coupon,
      addToCart, removeFromCart, updateQuantity, clearCart, addOrder,
      applyCoupon, removeCoupon,
      cartCount, cartSubtotal, cartDiscount, cartGrandTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
