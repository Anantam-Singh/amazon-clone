import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const isSeller = user?.role === "seller";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="logo-text">amaze</span>
        <span className="logo-dot"> on</span>
      </Link>

      <form onSubmit={handleSearch} className="nav-search">
        <input
          type="text"
          placeholder="Search items, tech, accessories..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>

      <div className="nav-links">

        {/* Profile dropdown */}
        <div className="nav-item hide-mobile" style={{ position: "relative" }} onMouseLeave={() => setProfileOpen(false)}>
          <div onMouseEnter={() => setProfileOpen(true)} style={{ cursor: "pointer" }}>
            <span className="nav-item-line-1">
              Hello, {user ? user.name.split(" ")[0] : "Sign in"}
            </span>
            {user ? (
              <span className="nav-item-line-2" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {isSeller ? "🏪 Seller" : "👤 Buyer"} ▾
              </span>
            ) : (
              <Link to="/login" className="nav-item-line-2">Sign In ▾</Link>
            )}
          </div>

          {user && profileOpen && (
            <div style={{
              position: "absolute", top: "100%", right: 0, zIndex: 999,
              background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)", minWidth: 220,
              overflow: "hidden", animation: "fadeDown 0.2s ease",
            }}>
              <style>{`@keyframes fadeDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }`}</style>

              {/* Profile header */}
              <div style={{ padding: "16px 18px", background: isSeller ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{user.name}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: 2 }}>{isSeller ? "Seller Account" : "Buyer Account"}</div>
              </div>

              {/* Menu items */}
              <div style={{ padding: "8px 0" }}>
                {[
                  { icon: "👤", label: "My Profile", to: "/profile" },
                  isSeller
                    ? { icon: "🏪", label: "Seller Dashboard", to: "/seller" }
                    : { icon: "🛒", label: "Shopping Cart", to: "/cart" },
                  { icon: "📦", label: isSeller ? "Sales Orders" : "My Orders", to: "/orders" },
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", color: "#0f172a", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", padding: "8px 0" }}>
                <button onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", width: "100%", background: "none", border: "none", color: "#ef4444", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fff1f2"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span>🚪</span> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Seller Portal link */}
        {isSeller && (
          <Link to="/seller" className="nav-item hide-mobile" style={{ color: "white" }}>
            <span className="nav-item-line-1">Seller</span>
            <span className="nav-item-line-2">Portal</span>
          </Link>
        )}

        {/* Orders link */}
        <Link to="/orders" className="nav-item hide-mobile" style={{ color: "white" }}>
          <span className="nav-item-line-1">{isSeller ? "Sales" : "Returns"}</span>
          <span className="nav-item-line-2">{isSeller ? "Orders" : "& Orders"}</span>
        </Link>

        {/* Cart — hidden for sellers */}
        {!isSeller && (
          <Link to="/cart" className="nav-cart">
            <div className="cart-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cart-svg">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span className="cart-text">Cart</span>
          </Link>
        )}

        {/* Inventory icon for sellers instead of cart */}
        {isSeller && (
          <Link to="/cart" className="nav-cart">
            <div className="cart-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cart-svg">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <span className="cart-text">Stock</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;