import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";

import { API_BASE_URL } from "../config";

function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ["All", "Mobiles", "Laptops", "Audio"];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE_URL}/api/products`;
        const params = [];
        if (selectedCategory !== "All") {
          params.push(`category=${selectedCategory}`);
        }
        if (searchQuery) {
          params.push(`search=${encodeURIComponent(searchQuery)}`);
        }
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }

        const res = await axios.get(url);
        if (res.data && res.data.success) {
          // Map _id to id for compatibility with the frontend code components
          const mappedProducts = res.data.data.map((prod) => ({
            ...prod,
            id: prod._id,
          }));
          setProducts(mappedProducts);
        } else {
          setError("Failed to load products from server.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error connecting to server. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="home-wrapper">
      <div className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-badge">New Arrival Deals</span>
          <h1 className="home-hero-title">Experience the extraordinary.</h1>
          <p className="home-hero-subtitle">Shop the latest tech, gadgets, and accessories at unbeatable prices.</p>
          <button className="home-hero-btn" onClick={() => {
            const el = document.getElementById('products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}>
            Shop Now →
          </button>
        </div>
        <div className="home-hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
      </div>

      <div id="products-section" className="category-filters-container">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`filter-pill ${selectedCategory === category ? "active" : ""}`}
          >
            {category}
          </button>
        ))}
      </div>

      {searchQuery && (
        <div style={{ maxWidth: "1200px", margin: "10px auto 25px auto", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#e0e7ff", borderRadius: "12px", border: "1px solid rgba(99, 102, 241, 0.15)", color: "var(--brand-primary-hover)", fontWeight: "600", fontSize: "0.95rem" }}>
          <span>Showing results for "{searchQuery}"</span>
          <Link to="/" style={{ color: "var(--brand-red)", textDecoration: "none", borderBottom: "1px solid var(--brand-red)", paddingBottom: "1px", fontSize: "0.85rem" }}>
            Clear Search
          </Link>
        </div>
      )}

      {loading ? (
        <div className="products-loading" style={{ textAlign: "center", padding: "60px 20px", fontSize: "1.2rem", color: "var(--text-muted)" }}>
          <div className="spinner" style={{ margin: "0 auto 15px auto", width: "40px", height: "40px", border: "4px solid rgba(99, 102, 241, 0.1)", borderTop: "4px solid var(--brand-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          Loading products...
        </div>
      ) : error ? (
        <div className="products-error" style={{ textAlign: "center", padding: "60px 20px", color: "var(--brand-red)", fontSize: "1.1rem" }}>
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="products-empty" style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: "1.1rem" }}>
          No products found in this category.
        </div>
      ) : (
        <div className="products-container">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;