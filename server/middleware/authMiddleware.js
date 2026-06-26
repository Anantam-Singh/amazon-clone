const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header: "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database, excluding password field
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ success: false, message: "User not found with this token" });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }
};

const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access denied. Sellers only." });
  }
};

module.exports = { protect, sellerOnly };
