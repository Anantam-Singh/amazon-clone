const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId",
      "title price image description category stock"
    );

    // If cart doesn't exist, create an empty one for the user
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qtyToAdd = Number(quantity) || 1;

    // Validate productId input
    if (!productId) {
      return res.status(400).json({ success: false, message: "Please provide a product ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    // Verify product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if user has an active cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if product is already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Item exists, check total stock limits
      const newQty = cart.items[itemIndex].quantity + qtyToAdd;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Only ${product.stock} units are in stock.`,
        });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      // New item, check stock
      if (qtyToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add items. Only ${product.stock} units are in stock.`,
        });
      }
      cart.items.push({ productId, quantity: qtyToAdd });
    }

    await cart.save();
    
    // Return populated cart
    const populatedCart = await cart.populate(
      "items.productId",
      "title price image description category stock"
    );

    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: "Please provide a product ID and quantity" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const qty = Number(quantity);

    // Get user cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found for this user" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in your cart" });
    }

    // If quantity is 0 or less, remove item from cart
    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Verify product stock limits
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units are available in stock.`,
        });
      }

      cart.items[itemIndex].quantity = qty;
    }

    await cart.save();

    const populatedCart = await cart.populate(
      "items.productId",
      "title price image description category stock"
    );

    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const productId = req.body.productId || req.query.productId;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Please provide a product ID to remove" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found for this user" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in your cart" });
    }

    // Remove item from array
    cart.items.splice(itemIndex, 1);

    await cart.save();

    const populatedCart = await cart.populate(
      "items.productId",
      "title price image description category stock"
    );

    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};
