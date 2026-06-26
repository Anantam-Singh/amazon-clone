import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

function SellerDashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Mobiles");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(`${API_BASE_URL}/images/iphone.jpg`);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Preset stock images for easy selection
  const imagePresets = [
    { name: "iPhone 16", url: `${API_BASE_URL}/images/iphone.jpg` },
    { name: "Samsung S25", url: `${API_BASE_URL}/images/samsung.jpg` },
    { name: "MacBook Air", url: `${API_BASE_URL}/images/macbook.jpg` },
    { name: "Boat Headphones", url: `${API_BASE_URL}/images/boat.jpg` }
  ];

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchSellerProducts = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products?seller=${user.id}`);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching seller products", err);
      setError("Failed to load products listing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user && user.role !== "seller") {
      setError("Access Denied: You are not registered as a Seller.");
      setLoading(false);
      return;
    }
    fetchSellerProducts();
  }, [user, token, isAuthenticated, navigate]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!title || !price || !category || !stock || !image) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        title,
        price: Number(price),
        category,
        stock: Number(stock),
        image,
        description
      };

      const res = await axios.post(`${API_BASE_URL}/api/products`, payload, getHeaders());
      if (res.data.success) {
        setSuccessMsg("Product listed successfully!");
        setShowAddModal(false);
        resetForm();
        fetchSellerProducts();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to list product.");
    }
  };

  const handleEditClick = (product) => {
    setActiveProduct(product);
    setTitle(product.title);
    setPrice(product.price);
    setCategory(product.category);
    setStock(product.stock);
    setImage(product.image);
    setDescription(product.description || "");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!title || !price || !category || !stock || !image) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        title,
        price: Number(price),
        category,
        stock: Number(stock),
        image,
        description
      };

      const res = await axios.put(`${API_BASE_URL}/api/products/${activeProduct._id}`, payload, getHeaders());
      if (res.data.success) {
        setSuccessMsg("Product updated successfully!");
        setShowEditModal(false);
        resetForm();
        fetchSellerProducts();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update product.");
    }
  };

  const handleDeleteClick = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product listing?")) return;
    setSuccessMsg("");

    try {
      const res = await axios.delete(`${API_BASE_URL}/api/products/${productId}`, getHeaders());
      if (res.data.success) {
        setSuccessMsg("Product deleted successfully!");
        fetchSellerProducts();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setCategory("Mobiles");
    setStock("");
    setImage(`${API_BASE_URL}/images/iphone.jpg`);
    setDescription("");
    setFormError("");
    setActiveProduct(null);
  };

  // Metrics Calculations
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= 3).length;
  const inventoryWorth = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--text-muted)", minHeight: "80vh" }}>
        <div style={{ margin: "0 auto 15px auto", width: "40px", height: "40px", border: "4px solid rgba(99, 102, 241, 0.1)", borderTop: "4px solid var(--brand-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        Loading Seller Panel...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", padding: "30px", textAlign: "center", backgroundColor: "white", borderRadius: "12px", boxShadow: "var(--shadow-md)" }}>
        <h2 style={{ color: "var(--brand-red)", marginBottom: "15px" }}>Access Restrained</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "25px" }}>{error}</p>
        <Link to="/" style={{ background: "var(--brand-primary)", color: "white", padding: "10px 24px", borderRadius: "8px", fontWeight: "600" }}>
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 5%", backgroundColor: "var(--body-bg)", minHeight: "90vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "5px" }}>Seller Portal</h1>
          <p style={{ color: "var(--text-muted)" }}>Welcome back, <strong>{user?.name}</strong>. Manage your listed products and stock levels.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="btn-primary" 
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>+</span> List New Product
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: "15px", backgroundColor: "#d1fae5", borderLeft: "4px solid var(--brand-accent)", color: "#065f46", borderRadius: "8px", marginBottom: "25px", fontWeight: "500" }}>
          {successMsg}
        </div>
      )}

      {/* Metrics Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", color: "white", padding: "24px", borderRadius: "16px", boxShadow: "var(--shadow-md)" }}>
          <span style={{ fontSize: "0.85rem", textTransform: "uppercase", opacity: 0.8 }}>Total Listed Items</span>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "10px" }}>{totalProducts}</h3>
        </div>
        <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Low / Out Of Stock</span>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "10px", color: lowStockProducts > 0 ? "var(--brand-red)" : "var(--text-main)" }}>{lowStockProducts}</h3>
        </div>
        <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Est. Inventory Value</span>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "10px", color: "var(--brand-accent)" }}>₹{inventoryWorth.toLocaleString("en-IN")}</h3>
        </div>
      </div>

      {/* Products Listing Grid */}
      <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "20px" }}>Your Active Listings</h2>

      {products.length === 0 ? (
        <div style={{ background: "white", padding: "60px 20px", textAlign: "center", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "20px" }}>You have not listed any products yet.</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" }}>
          {products.map((prod) => (
            <div key={prod._id} className="product-card" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div>
                <div className="product-img-wrapper" style={{ height: "200px", padding: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={prod.image} alt={prod.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ padding: "15px" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--brand-primary)", fontWeight: "bold" }}>{prod.category}</span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "600", margin: "5px 0" }}>{prod.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", height: "40px", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.description}</p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                    <span style={{ fontWeight: "700", fontSize: "1.2rem" }}>₹{prod.price.toLocaleString("en-IN")}</span>
                    <span style={{ fontSize: "0.85rem", color: prod.stock <= 3 ? "var(--brand-red)" : "var(--text-muted)", fontWeight: "600" }}>
                      Stock: {prod.stock}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "15px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "10px" }}>
                <button 
                  onClick={() => handleEditClick(prod)}
                  className="btn-secondary" 
                  style={{ flex: 1, padding: "8px" }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteClick(prod._id)}
                  className="btn-secondary" 
                  style={{ flex: 1, color: "var(--brand-red)", borderColor: "rgba(239, 68, 68, 0.2)", padding: "8px" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "30px", width: "100%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>List a New Product</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-muted)" }}>&times;</button>
            </div>

            {formError && (
              <div style={{ padding: "10px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "15px", fontSize: "0.9rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Product Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="e.g. iPhone 16 Pro Max" required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div className="form-group">
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Price (₹)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-input" placeholder="e.g. 79999" min="0" required />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Stock Qty</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="form-input" placeholder="e.g. 15" min="0" required />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input" style={{ width: "100%", padding: "10px" }}>
                  <option value="Mobiles">Mobiles</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Audio">Audio</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Product Image URL</label>
                <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="form-input" required />
                
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "5px", display: "block" }}>Choose a preset image for quick local testing:</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "5px" }}>
                  {imagePresets.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        borderRadius: "4px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: image === preset.url ? "var(--brand-primary)" : "#f1f5f9",
                        color: image === preset.url ? "white" : "var(--text-main)",
                        fontWeight: "500"
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" placeholder="Product features and specs..." rows={3} style={{ width: "100%", padding: "10px" }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "10px" }}>
                Add Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "30px", width: "100%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>Edit Product Listing</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-muted)" }}>&times;</button>
            </div>

            {formError && (
              <div style={{ padding: "10px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "15px", fontSize: "0.9rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Product Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div className="form-group">
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Price (₹)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-input" min="0" required />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Stock Qty</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="form-input" min="0" required />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input" style={{ width: "100%", padding: "10px" }}>
                  <option value="Mobiles">Mobiles</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Audio">Audio</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Product Image URL</label>
                <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="form-input" required />
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "5px", display: "block" }}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" rows={3} style={{ width: "100%", padding: "10px" }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "10px" }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
