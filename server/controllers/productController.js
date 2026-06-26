const mongoose = require("mongoose");
const Product = require("../models/Product");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, seller, search } = req.query;
    const filter = {};

    // Support optional filtering by category
    if (category) {
      filter.category = category;
    }

    // Support optional filtering by seller
    if (seller) {
      filter.seller = seller;
    }

    // Support optional filtering by keyword search (title or description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Public (Can be protected as admin in full production)
const createProduct = async (req, res, next) => {
  try {
    const { title, price, image, description, category, stock } = req.body;

    // Basic input validations
    if (!title || price === undefined || !image || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide required fields (title, price, image, category)",
      });
    }

    const product = await Product.create({
      title,
      price,
      image,
      description,
      category,
      stock: stock || 0,
      seller: req.user._id, // Associate product with listing seller
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product by ID
// @route   PUT /api/products/:id
// @access  Private (Seller only)
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Verify ownership: only allow if user is the listing seller
    if (product.seller && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this product listing" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true, // Return updated document
      runValidators: true, // Run model schemas validation checks
    });

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product by ID
// @route   DELETE /api/products/:id
// @access  Private (Seller only)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Verify ownership: only allow if user is the listing seller
    if (product.seller && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this product listing" });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Product successfully deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Purchase products (decrease stock)
// @route   POST /api/products/purchase
// @access  Public
const purchaseProducts = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided" });
    }

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.id)) continue;
      
      const product = await Product.findById(item.id);
      if (product && product.stock >= item.quantity) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    res.status(200).json({ success: true, message: "Stock updated successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  purchaseProducts,
};
