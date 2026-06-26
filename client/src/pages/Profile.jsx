import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

/* ─── Avatar initials circle ───────────────────────────────── */
function Avatar({ name, role }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  return (
    <div className={`profile-avatar profile-avatar--${role}`}>{initials}</div>
  );
}

/* ─── Stat card ────────────────────────────────────────────── */
function StatCard({ icon, label, value }) {
  return (
    <div className="profile-stat-card">
      <div className="profile-stat-icon">{icon}</div>
      <div className="profile-stat-value">{value}</div>
      <div className="profile-stat-label">{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  BUYER PROFILE                                              */
/* ═══════════════════════════════════════════════════════════ */
function BuyerProfile({ user, orders, cartCount }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const totalSpent = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);
  const totalItems = orders.reduce((s, o) => s + (o.items?.length || 0), 0);

  return (
    <div className="profile-page">
      {/* Hero header */}
      <div className="profile-hero profile-hero--buyer">
        <div className="profile-hero-inner">
          <Avatar name={user.name} role="buyer" />
          <div className="profile-hero-text">
            <span className="profile-role-badge">Buyer Account</span>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          <div className="profile-hero-actions">
            <Link to="/orders" className="btn-secondary">My Orders</Link>
            <Link to="/" className="btn-primary">Shop Now</Link>
          </div>
        </div>
      </div>

      <div className="profile-body">
        {/* Stats */}
        <div className="profile-stats-grid">
          <StatCard icon="📦" label="Total Orders" value={orders.length} />
          <StatCard icon="💳" label="Total Spent" value={`₹${totalSpent.toLocaleString("en-IN")}`} />
          <StatCard icon="🛍️" label="Items Bought" value={totalItems} />
          <StatCard icon="🛒" label="In Cart" value={cartCount} />
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {["overview", "orders", "account"].map(t => (
            <button key={t} className={`profile-tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="profile-tab-grid">
            <div className="profile-card">
              <h3 className="profile-card-title">Quick Links</h3>
              {[
                { icon: "📦", label: "View All Orders", to: "/orders" },
                { icon: "🛒", label: "Shopping Cart", to: "/cart" },
                { icon: "🏠", label: "Continue Shopping", to: "/" },
              ].map(l => (
                <Link key={l.to} to={l.to} className="profile-link-row">
                  <span className="profile-link-icon">{l.icon}</span>
                  <span>{l.label}</span>
                  <span className="profile-link-arrow">→</span>
                </Link>
              ))}
            </div>
            <div className="profile-card">
              <h3 className="profile-card-title">Account Info</h3>
              {[
                { label: "Full Name", value: user.name },
                { label: "Email", value: user.email },
                { label: "Account Type", value: "Buyer" },
                { label: "Member Since", value: "2025" },
              ].map(r => (
                <div key={r.label} className="profile-info-row">
                  <span className="profile-info-label">{r.label}</span>
                  <span className="profile-info-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title" style={{ margin: 0 }}>Recent Orders</h3>
              <Link to="/orders" className="profile-view-all">View All →</Link>
            </div>
            {orders.length === 0 ? (
              <div className="profile-empty">
                <span className="profile-empty-icon">📦</span>
                <p>No orders yet. <Link to="/">Start shopping!</Link></p>
              </div>
            ) : orders.slice(0, 3).map(o => (
              <div key={o.orderId} className="profile-order-row">
                <div>
                  <div className="profile-order-id">Order #{o.orderId?.slice(-8)}</div>
                  <div className="profile-order-meta">{o.date} · {o.items?.length} items</div>
                </div>
                <div className="profile-order-right">
                  <div className="profile-order-total">₹{o.grandTotal?.toLocaleString("en-IN")}</div>
                  <span className="profile-badge profile-badge--green">Delivered</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Account */}
        {tab === "account" && (
          <div className="profile-card">
            <h3 className="profile-card-title">Account Settings</h3>
            {[
              { label: "Email Notifications", desc: "Receive order updates via email", on: true },
              { label: "SMS Alerts", desc: "Get shipping & delivery SMS", on: false },
              { label: "Newsletter", desc: "Deals & offers in your inbox", on: true },
            ].map(s => (
              <div key={s.label} className="profile-toggle-row">
                <div>
                  <div className="profile-toggle-label">{s.label}</div>
                  <div className="profile-toggle-desc">{s.desc}</div>
                </div>
                <div className={`profile-toggle ${s.on ? "on" : ""}`}>
                  <div className="profile-toggle-thumb" />
                </div>
              </div>
            ))}
            <button onClick={() => { logout(); navigate("/"); }} className="profile-signout-btn">
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  SELLER PROFILE                                             */
/* ═══════════════════════════════════════════════════════════ */
function SellerProfile({ user, products }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const outOfStock = products.filter(p => !p.stock).length;
  const totalValue = products.reduce((s, p) => s + p.price * (p.stock || 0), 0);

  return (
    <div className="profile-page">
      {/* Hero header */}
      <div className="profile-hero profile-hero--seller">
        <div className="profile-hero-inner">
          <Avatar name={user.name} role="seller" />
          <div className="profile-hero-text">
            <span className="profile-role-badge">Seller Account</span>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          <div className="profile-hero-actions">
            <Link to="/orders" className="btn-secondary">Sales Orders</Link>
            <Link to="/seller" className="btn-primary">Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="profile-body">
        {/* Stats */}
        <div className="profile-stats-grid">
          <StatCard icon="📦" label="Total Products" value={products.length} />
          <StatCard icon="📋" label="Total Stock" value={totalStock} />
          <StatCard icon="⚠️" label="Out of Stock" value={outOfStock} />
          <StatCard icon="💰" label="Inventory Value" value={`₹${totalValue.toLocaleString("en-IN")}`} />
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {["overview", "listings", "account"].map(t => (
            <button key={t} className={`profile-tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="profile-tab-grid">
            <div className="profile-card">
              <h3 className="profile-card-title">Quick Actions</h3>
              {[
                { icon: "🏪", label: "Manage Store", to: "/seller" },
                { icon: "📊", label: "View Sales Orders", to: "/orders" },
                { icon: "🛍️", label: "Browse as Customer", to: "/" },
              ].map(l => (
                <Link key={l.to} to={l.to} className="profile-link-row">
                  <span className="profile-link-icon">{l.icon}</span>
                  <span>{l.label}</span>
                  <span className="profile-link-arrow">→</span>
                </Link>
              ))}
            </div>
            <div className="profile-card">
              <h3 className="profile-card-title">Store Info</h3>
              {[
                { label: "Store Name", value: `${user.name}'s Store` },
                { label: "Email", value: user.email },
                { label: "Account Type", value: "Verified Seller" },
                { label: "Active Listings", value: products.length },
              ].map(r => (
                <div key={r.label} className="profile-info-row">
                  <span className="profile-info-label">{r.label}</span>
                  <span className="profile-info-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings */}
        {tab === "listings" && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title" style={{ margin: 0 }}>Your Listings</h3>
              <Link to="/seller" className="profile-view-all">Manage All →</Link>
            </div>
            {products.length === 0 ? (
              <div className="profile-empty">
                <span className="profile-empty-icon">📦</span>
                <p>No products yet. <Link to="/seller">Add your first listing!</Link></p>
              </div>
            ) : products.slice(0, 5).map(p => (
              <div key={p._id} className="profile-product-row">
                <img src={p.image} alt={p.title} className="profile-product-img" />
                <div className="profile-product-info">
                  <div className="profile-product-name">{p.title}</div>
                  <div className="profile-product-meta">₹{p.price?.toLocaleString("en-IN")} · Stock: {p.stock}</div>
                </div>
                <span className={`profile-badge ${p.stock === 0 ? "profile-badge--red" : "profile-badge--green"}`}>
                  {p.stock === 0 ? "Out of Stock" : "In Stock"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Account */}
        {tab === "account" && (
          <div className="profile-card">
            <h3 className="profile-card-title">Account Settings</h3>
            {[
              { label: "Order Notifications", desc: "Alert when a buyer places an order", on: true },
              { label: "Low Stock Alerts", desc: "Warn when stock drops below 5", on: true },
              { label: "Marketing Emails", desc: "Platform tips and growth insights", on: false },
            ].map(s => (
              <div key={s.label} className="profile-toggle-row">
                <div>
                  <div className="profile-toggle-label">{s.label}</div>
                  <div className="profile-toggle-desc">{s.desc}</div>
                </div>
                <div className={`profile-toggle ${s.on ? "on" : ""}`}>
                  <div className="profile-toggle-thumb" />
                </div>
              </div>
            ))}
            <button onClick={() => { logout(); navigate("/"); }} className="profile-signout-btn">
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN PROFILE (role router)                                 */
/* ═══════════════════════════════════════════════════════════ */
export default function Profile() {
  const { user } = useAuth();
  const { orders, cartCount } = useCart();
  const [sellerProducts, setSellerProducts] = useState([]);

  useEffect(() => {
    if (user?.role === "seller") {
      const uid = user._id || user.id;
      axios.get(`http://localhost:5000/api/products?seller=${uid}`)
        .then(res => { if (res.data.success) setSellerProducts(res.data.data); })
        .catch(() => {});
    }
  }, [user]);

  if (user?.role === "seller") return <SellerProfile user={user} products={sellerProducts} />;
  return <BuyerProfile user={user} orders={orders} cartCount={cartCount} />;
}
