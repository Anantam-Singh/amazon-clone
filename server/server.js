
const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();
const path = require("path");

const connectDB = require("./config/db");
const { passport } = require("./config/passport");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

// Initialize Database Connection & Seed Products
const seedProducts = require("./config/productSeeder");
connectDB().then(() => {
  seedProducts();
});

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json()); // Body parser for JSON payloads
app.use(express.static(path.join(__dirname, "public")));

// Session middleware (required for Passport OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "amazeon_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// API Base Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Server Status Check Endpoint
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Amaze on backend server is running successfully..." });
});

// Centralized 404 Route NotFound Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Requested endpoint not found" });
});

// Centralized Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error Stack:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Centralized Server Error",
  });
});

// Port configuration and startup listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

