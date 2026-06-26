import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [added, setAdded] = useState(false);

  // Find if item is in cart
  const cartItem = cartItems.find((item) => item.id === product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-img-wrapper" style={{ position: "relative" }}>
          {product.stock === 0 && (
            <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "var(--brand-red)", color: "white", padding: "4px 10px", fontSize: "0.75rem", fontWeight: "bold", borderRadius: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.15)", zIndex: 2 }}>
              Out of Stock
            </div>
          )}
          <img src={product.image} alt={product.title} style={{ opacity: product.stock === 0 ? 0.65 : 1 }} />
        </div>
        <h3>{product.title}</h3>
        <p className="product-price">₹{product.price.toLocaleString("en-IN")}</p>
      </Link>

      <div className="product-card-actions">
        <Link to={`/product/${product.id}`} className="details-link-btn">
          <button className="btn-secondary">Details</button>
        </Link>
        
        {product.stock === 0 ? (
          <button
            className="btn-secondary"
            style={{ width: "100%", color: "var(--brand-red)", borderColor: "rgba(239, 68, 68, 0.2)", cursor: "not-allowed", backgroundColor: "#fef2f2" }}
            disabled
          >
            Out of Stock
          </button>
        ) : cartItem ? (
          <div className="card-qty-controls">
            <button
              onClick={(e) => {
                e.preventDefault();
                updateQuantity(product.id, cartItem.quantity - 1);
              }}
              className="qty-btn-minus"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="qty-val">{cartItem.quantity}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (cartItem.quantity < product.stock) {
                  updateQuantity(product.id, cartItem.quantity + 1);
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
        ) : (
          <button
            onClick={handleAddToCart}
            className={`btn-primary ${added ? "btn-success-flash" : ""}`}
          >
            {added ? "Added!" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;