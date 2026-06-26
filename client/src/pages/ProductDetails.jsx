import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { API_BASE_URL } from "../config";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        if (res.data && res.data.success) {
          const mappedProduct = {
            ...res.data.data,
            id: res.data.data._id,
          };
          setProduct(mappedProduct);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Error connecting to server or product not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="details-page-wrapper">
        <div style={{ textAlign: "center", padding: "100px 20px", fontSize: "1.2rem", color: "var(--text-muted)" }}>
          <div className="spinner" style={{ margin: "0 auto 15px auto", width: "40px", height: "40px", border: "4px solid rgba(99, 102, 241, 0.1)", borderTop: "4px solid var(--brand-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          Loading product details...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container" style={{ textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ color: "var(--brand-red)", marginBottom: "20px" }}>Product Not Found</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>{error || "The requested product does not exist."}</p>
        <Link to="/" className="back-link">Return to Home</Link>
      </div>
    );
  }

  // Find if item is already in cart
  const cartItem = cartItems.find((item) => item.id === product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="details-page-wrapper">
      <div className="details-container">
        <div className="details-img-container">
          <img
            src={product.image}
            alt={product.title}
          />
        </div>

        <div className="details-info-container">
          <h1 className="details-title">{product.title}</h1>
          
          <div className="details-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-count">4.8 out of 5 stars (832 reviews)</span>
          </div>
          
          <hr className="details-divider" />
          
          <div className="details-price-tag">
            <span className="price-label">Price:</span>
            <span className="price-value">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="tax-notice">Inclusive of all local taxes</span>
          </div>

          <div className="details-delivery-badge">
            <strong>Express shipping</strong>: Arriving within 48 hours.
          </div>

          <div className="details-stock-status" style={{ color: product.stock === 0 ? "var(--brand-red)" : "var(--brand-accent)" }}>
            {product.stock === 0 ? "Out of Stock - Will be available soon." : "In Stock & Ready to Ship."}
          </div>

          <p className="details-desc">{product.description}</p>

          <hr className="details-divider" />

          {/* Conditional rendering based on stock availability and cart presence */}
          {product.stock === 0 ? (
            <div style={{ padding: "20px", backgroundColor: "#fef2f2", borderLeft: "4px solid var(--brand-red)", borderRadius: "8px", margin: "20px 0" }}>
              <h3 style={{ color: "var(--brand-red)", marginBottom: "5px", fontSize: "1.05rem" }}>Temporarily Out of Stock</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>This item is currently sold out. It will be available soon. You can check back later or add other premium gear to your cart.</p>
            </div>
          ) : cartItem ? (
            <div className="details-cart-controls-panel">
              <div className="in-cart-pill">Already in Cart</div>
              <div className="details-qty-controls">
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                  className="qty-btn-minus"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="qty-val">{cartItem.quantity}</span>
                <button
                  onClick={() => {
                    if (cartItem.quantity < product.stock) {
                      updateQuantity(product.id, cartItem.quantity + 1)
                    }
                  }}
                  className="qty-btn-plus"
                  aria-label="Increase quantity"
                  disabled={cartItem.quantity >= product.stock}
                  style={cartItem.quantity >= product.stock ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  +
                </button>
              </div>
              <p className="sub-price">Total: <strong>₹{(product.price * cartItem.quantity).toLocaleString("en-IN")}</strong></p>
            </div>
          ) : (
            <div className="details-actions">
              <div className="qty-selector">
                <label htmlFor="qty-select">Quantity:</label>
                <select
                  id="qty-select"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {[...Array(Math.min(product.stock, 10)).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={handleAddToCart} className="btn-primary details-add-btn">
                Add to Cart
              </button>
            </div>
          )}

          {added && (
            <div className="added-banner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="checkmark-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Added to Cart! Subtotal: <strong>₹{(product.price * quantity).toLocaleString("en-IN")}</strong></span>
              <Link to="/cart" className="view-cart-link">Go to Cart</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;