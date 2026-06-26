const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, sellerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes for fetching products
router.get("/", getProducts);
router.get("/:id", getProductById);

// Seller protected routes
router.post("/", protect, sellerOnly, createProduct);
router.put("/:id", protect, sellerOnly, updateProduct);
router.delete("/:id", protect, sellerOnly, deleteProduct);

module.exports = router;
