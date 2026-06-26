import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

/* ═══════════════════════════════════════════════════════════ */
/*  SELLER ORDERS — Incoming sales                             */
/* ═══════════════════════════════════════════════════════════ */
function SellerOrdersView({ user, orders }) {
  const sellerSales = [];
  orders.forEach(order => {
    const uid = user._id || user.id;
    const items = order.items?.filter(i => i.seller === uid);
    if (items?.length) {
      sellerSales.push({
        ...order,
        items,
        sellerTotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      });
    }
  });

  const totalRevenue = sellerSales.reduce((s, o) => s + o.sellerTotal, 0);
  const totalItems = sellerSales.reduce((s, o) => s + o.items.length, 0);

  return (
    <div className="page-wrapper">
      <div className="page-header page-header--seller">
        <div className="page-header-inner">
          <div>
            <p className="page-header-eyebrow">Seller Portal</p>
            <h1 className="page-header-title">Incoming Sales Orders</h1>
            <p className="page-header-sub">Review orders placed by customers for your products</p>
          </div>
          <Link to="/seller" className="btn-primary">Manage Store →</Link>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          {[
            { icon: "📦", label: "Total Orders", value: sellerSales.length },
            { icon: "💰", label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
            { icon: "🛍️", label: "Items Sold", value: totalItems },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {sellerSales.length === 0 ? (
          <div className="empty-state empty-state--card">
            <span className="empty-state-icon">📭</span>
            <h2>No sales orders yet</h2>
            <p>Orders from buyers will appear here as they complete checkout.</p>
            <Link to="/seller" className="btn-primary">Manage Listings</Link>
          </div>
        ) : sellerSales.map(sale => (
          <div key={sale.orderId} className="order-card order-card--seller">
            {/* Meta bar */}
            <div className="order-meta-bar order-meta-bar--seller">
              {[
                { label: "ORDER DATE", value: sale.date },
                { label: "YOUR EARNINGS", value: `₹${sale.sellerTotal.toLocaleString("en-IN")}`, hi: true },
                { label: "CUSTOMER", value: sale.shippingDetails?.fullName || "—" },
                { label: "ORDER #", value: sale.orderId?.slice(-10) },
              ].map((m, i) => (
                <div key={m.label} className={`order-meta-col ${i < 3 ? "order-meta-col--bordered" : ""}`}>
                  <div className="order-meta-label">{m.label}</div>
                  <div className={`order-meta-value ${m.hi ? "order-meta-value--accent" : ""}`}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="order-body">
              <div className="order-status-row">
                <div className="order-status-dot order-status-dot--pending" />
                <strong>Pending Shipment Dispatch</strong>
                <span className="badge badge--purple" style={{ marginLeft: "auto" }}>
                  {sale.paymentMethod === "card" ? "Credit Card" : "Cash on Delivery"}
                </span>
              </div>

              {sale.shippingDetails && (
                <div className="order-address-box">
                  <strong>Ship to:</strong> {sale.shippingDetails.addressLine}, {sale.shippingDetails.city} — {sale.shippingDetails.zipCode}
                </div>
              )}

              {sale.items.map(item => (
                <div key={item.id} className="order-item-row">
                  <img src={item.image} alt={item.title} className="order-item-img" />
                  <div className="order-item-info">
                    <div className="order-item-name">{item.title}</div>
                    <div className="order-item-meta">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="order-item-subtotal">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  BUYER ORDERS — Purchase history                            */
/* ═══════════════════════════════════════════════════════════ */
function BuyerOrdersView({ orders }) {
  const { addToCart } = useCart();
  const [toast, setToast] = useState({ show: false, msg: "" });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const totalSpent = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);

  return (
    <div className="page-wrapper">
      {/* Toast */}
      {toast.show && (
        <div className="toast">
          {toast.msg}
        </div>
      )}

      <div className="page-header page-header--buyer">
        <div className="page-header-inner">
          <div>
            <p className="page-header-eyebrow">Buyer Account</p>
            <h1 className="page-header-title">Your Orders</h1>
            <p className="page-header-sub">Track shipments, request returns, or buy items again</p>
          </div>
          <Link to="/" className="btn-primary">Shop More →</Link>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          {[
            { icon: "📦", label: "Total Orders", value: orders.length },
            { icon: "💳", label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}` },
            { icon: "🚚", label: "In Transit", value: orders.length },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="empty-state empty-state--card">
            <span className="empty-state-icon">📭</span>
            <h2>No orders placed yet</h2>
            <p>Your orders will appear here after checkout.</p>
            <Link to="/" className="btn-primary">Explore Store</Link>
          </div>
        ) : orders.map(order => (
          <div key={order.orderId} className="order-card order-card--buyer">
            {/* Meta bar */}
            <div className="order-meta-bar order-meta-bar--buyer">
              {[
                { label: "ORDER PLACED", value: order.date },
                { label: "TOTAL PAID", value: `₹${order.grandTotal?.toLocaleString("en-IN")}`, hi: true },
                { label: "SHIP TO", value: order.shippingDetails?.fullName || "—" },
                { label: "ORDER #", value: order.orderId?.slice(-10) },
              ].map((m, i) => (
                <div key={m.label} className={`order-meta-col ${i < 3 ? "order-meta-col--bordered" : ""}`}>
                  <div className="order-meta-label">{m.label}</div>
                  <div className={`order-meta-value ${m.hi ? "order-meta-value--accent" : ""}`}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="order-body">
              <div className="order-status-row">
                <div className="order-status-dot order-status-dot--active" />
                <strong>Arriving shortly — Processing shipment</strong>
                <span className="badge badge--green" style={{ marginLeft: "auto" }}>Confirmed</span>
              </div>

              {order.items?.map(item => (
                <div key={item.id} className="order-item-row">
                  <img src={item.image} alt={item.title} className="order-item-img" />
                  <div className="order-item-info">
                    <div className="order-item-name">{item.title}</div>
                    <div className="order-item-desc">{item.description}</div>
                    <div className="order-item-meta">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="order-item-actions">
                    <button onClick={() => { addToCart(item, 1); showToast(`Added "${item.title}" to cart!`); }} className="btn-primary order-btn">
                      Buy Again
                    </button>
                    <button onClick={() => showToast(`Return for Order #${order.orderId?.slice(-8)} requested.`)} className="btn-secondary order-btn">
                      Return
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN ORDERS — role router                                  */
/* ═══════════════════════════════════════════════════════════ */
export default function Orders() {
  const { user } = useAuth();
  const { orders } = useCart();
  if (user?.role === "seller") return <SellerOrdersView user={user} orders={orders} />;
  return <BuyerOrdersView orders={orders} />;
}
