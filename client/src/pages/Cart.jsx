import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

/* ─────────────────────────────────────────────────────────── */
/*  SELLER CART — Inventory panel                              */
/* ─────────────────────────────────────────────────────────── */
function SellerCartView({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = user?._id || user?.id;
    if (!uid) return;
    axios.get(`${API_BASE_URL}/api/products?seller=${uid}`)
      .then(res => { if (res.data.success) setProducts(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const outOfStock = products.filter(p => !p.stock).length;
  const totalValue = products.reduce((s, p) => s + p.price * (p.stock || 0), 0);

  return (
    <div className="page-wrapper">
      {/* Page header */}
      <div className="page-header page-header--seller">
        <div className="page-header-inner">
          <div>
            <p className="page-header-eyebrow">Seller Portal</p>
            <h1 className="page-header-title">Inventory Overview</h1>
            <p className="page-header-sub">Monitor stock levels and product availability</p>
          </div>
          <Link to="/seller" className="btn-primary">Manage Store →</Link>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: "📦", label: "Products", value: products.length },
            { icon: "📋", label: "Stock Units", value: totalStock },
            { icon: "⚠️", label: "Out of Stock", value: outOfStock },
            { icon: "💰", label: "Inventory Value", value: `₹${totalValue.toLocaleString("en-IN")}` },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Product list */}
        <div className="content-card">
          <div className="content-card-header">
            <h3 className="content-card-title">Stock Status</h3>
            <Link to="/seller" className="link-primary">Manage All →</Link>
          </div>
          {loading ? (
            <p className="loading-text">Loading inventory…</p>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <h3>No products listed yet</h3>
              <p><Link to="/seller">Add your first product</Link></p>
            </div>
          ) : products.map((p, i) => (
            <div key={p._id} className={`list-row ${i < products.length - 1 ? "list-row--bordered" : ""}`}>
              <img src={p.image} alt={p.title} className="list-row-img" />
              <div className="list-row-info">
                <div className="list-row-title">{p.title}</div>
                <div className="list-row-meta">₹{p.price?.toLocaleString("en-IN")} per unit</div>
              </div>
              <div className="list-row-right">
                <div className="list-row-count">{p.stock} units</div>
                <span className={`badge ${p.stock === 0 ? "badge--red" : p.stock < 5 ? "badge--yellow" : "badge--green"}`}>
                  {p.stock === 0 ? "Out of Stock" : p.stock < 5 ? "Low Stock" : "In Stock"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  BUYER CART                                                 */
/* ─────────────────────────────────────────────────────────── */
function BuyerCartView() {
  const {
    cartItems, removeFromCart, updateQuantity, cartSubtotal, cartCount,
    clearCart, coupon, applyCoupon, removeCoupon, cartDiscount, cartGrandTotal,
  } = useCart();

  const [products, setProducts] = useState([]);
  const [promoInput, setPromoInput] = useState("");
  const [promoFeedback, setPromoFeedback] = useState({ success: null, message: "" });
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products`)
      .then(res => { if (res.data?.success) setProducts(res.data.data.map(p => ({ ...p, id: p._id }))); })
      .catch(() => {});
  }, []);

  const FREE = 499;
  const isFree = cartSubtotal >= FREE;
  const needed = FREE - cartSubtotal;
  const recs = products.filter(p => !cartItems.some(i => i.id === p._id));

  const handleApply = (e) => {
    e.preventDefault();
    if (!promoInput) return;
    const r = applyCoupon(promoInput);
    setPromoFeedback({ success: r.success, message: r.message });
    if (r.success) setPromoInput("");
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="empty-page-center">
          <div className="empty-state">
            <span className="empty-state-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Explore today's deals and add items to get started.</p>
            <Link to="/" className="btn-primary">Continue Shopping</Link>
          </div>
          {recs.length > 0 && (
            <div className="page-body">
              <h3 className="section-title">Recommended for you</h3>
              <div className="rec-grid">
                {recs.slice(0, 4).map(p => (
                  <div key={p._id} className="rec-card">
                    <div className="rec-card-img-wrap">
                      <img src={p.image} alt={p.title} />
                    </div>
                    <div className="rec-card-body">
                      <div className="rec-card-title">{p.title}</div>
                      <div className="rec-card-price">₹{p.price?.toLocaleString("en-IN")}</div>
                      <Link to={`/product/${p._id}`} className="btn-secondary rec-card-btn">View Details</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-body">
        <h1 className="page-title">
          Shopping Bag <span className="page-title-count">({cartCount} {cartCount === 1 ? "item" : "items"})</span>
        </h1>

        <div className="cart-layout">
          {/* Left — items */}
          <div className="cart-items-col">
            {/* Shipping bar */}
            <div className={`shipping-bar ${isFree ? "shipping-bar--free" : ""}`}>
              <span>🚚</span>
              {isFree ? (
                <span className="shipping-bar-text shipping-bar-text--free">You qualify for FREE express delivery!</span>
              ) : (
                <div className="shipping-bar-progress-wrap">
                  <span className="shipping-bar-text">Add <strong>₹{needed.toLocaleString("en-IN")}</strong> more for free shipping</span>
                  <div className="shipping-bar-track">
                    <div className="shipping-bar-fill" style={{ width: `${Math.min((cartSubtotal / FREE) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img-wrap">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="cart-item-body">
                  <h3 className="cart-item-title">{item.title}</h3>
                  <p className="cart-item-availability">✓ Available · Standard free shipping</p>
                  <div className="cart-item-controls">
                    <select
                      value={item.quantity}
                      onChange={e => updateQuantity(item.id, Number(e.target.value))}
                      className="cart-qty-select"
                    >
                      {[...Array(Math.max(1, Math.min(item.stock || 10, 10))).keys()].map(n => (
                        <option key={n + 1} value={n + 1}>Qty: {n + 1}</option>
                      ))}
                    </select>
                    <span className="cart-divider">|</span>
                    <button onClick={() => removeFromCart(item.id)} className="cart-delete-btn">Delete</button>
                  </div>
                </div>
                <div className="cart-item-price">
                  <div className="cart-item-price-total">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                  <div className="cart-item-price-each">₹{item.price.toLocaleString("en-IN")} each</div>
                </div>
              </div>
            ))}

            {/* Notes */}
            <div className="content-card" style={{ marginTop: 12 }}>
              <label className="form-label">Delivery Instructions</label>
              <textarea
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                placeholder="Leave at door, ring bell, security code..."
                rows={3}
                className="form-input notes-textarea"
              />
            </div>

            <div className="cart-clear-row">
              <button onClick={clearCart} className="cart-clear-btn">Remove all items</button>
            </div>
          </div>

          {/* Right — summary */}
          <div className="cart-summary-col">
            <div className="content-card">
              <h3 className="content-card-title">Order Summary</h3>

              {/* Promo */}
              <div className="promo-section">
                <label className="form-label">Promotions &amp; Coupons</label>
                {coupon.code ? (
                  <div className="promo-applied">
                    <span className="badge badge--green">✓ {coupon.code} ({coupon.discount}% Off)</span>
                    <button onClick={() => { removeCoupon(); setPromoFeedback({ success: null, message: "" }); }} className="promo-remove-btn">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="promo-form">
                    <input
                      type="text"
                      placeholder="Code (e.g. WELCOME20)"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      className="form-input promo-input"
                    />
                    <button type="submit" className="btn-secondary">Apply</button>
                  </form>
                )}
                {promoFeedback.message && (
                  <p className={`promo-msg ${promoFeedback.success ? "promo-msg--ok" : "promo-msg--err"}`}>{promoFeedback.message}</p>
                )}
                {!coupon.code && <p className="promo-tip">Tip: Use <strong>WELCOME20</strong> for 20% off</p>}
              </div>

              <hr className="divider" />

              {/* Pricing */}
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className={isFree ? "text-green" : ""}>{isFree ? "FREE" : "₹49"}</span>
                </div>
                {coupon.code && (
                  <div className="summary-row text-green">
                    <span>Coupon ({coupon.code})</span>
                    <span>-₹{cartDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              <hr className="divider" />

              <div className="summary-total">
                <span>Order Total</span>
                <span>₹{cartGrandTotal.toLocaleString("en-IN")}</span>
              </div>

              <Link to="/checkout" className="btn-primary checkout-btn">Proceed to Checkout →</Link>
              <p className="secure-text">🔒 Secured with 256-bit SSL encryption</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h3 className="section-title">You may also love</h3>
            <div className="rec-grid">
              {recs.slice(0, 4).map(p => (
                <div key={p._id} className="rec-card">
                  <div className="rec-card-img-wrap"><img src={p.image} alt={p.title} /></div>
                  <div className="rec-card-body">
                    <div className="rec-card-title">{p.title}</div>
                    <div className="rec-card-price">₹{p.price?.toLocaleString("en-IN")}</div>
                    <Link to={`/product/${p._id}`} className="btn-secondary rec-card-btn">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  MAIN CART — role router                                    */
/* ─────────────────────────────────────────────────────────── */
export default function Cart() {
  const { user } = useAuth();
  if (user?.role === "seller") return <SellerCartView user={user} />;
  return <BuyerCartView />;
}