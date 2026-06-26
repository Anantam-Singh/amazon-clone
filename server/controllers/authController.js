const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token is active for 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate request inputs
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please enter all required fields (name, email, password)" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists with this email address" });
    }

    // Create new user (password hashing is handled in pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "buyer",
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data provided" });
    }
  } catch (error) {
    next(error); // Forward error to centralized handler
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Verify user password
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password credentials" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Social Login / Register (Google/X)
// @route   POST /api/auth/social-login
// @access  Public
const socialLogin = async (req, res, next) => {
  try {
    const { name, email, provider, providerId, role } = req.body;

    if (!email || !provider || !providerId) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, provider, and providerId",
      });
    }

    // Try finding the user by email first
    let user = await User.findOne({ email });

    if (user) {
      // User exists. Update the social provider ID if not set
      if (provider === "google" && !user.googleId) {
        user.googleId = providerId;
        await user.save();
      } else if (provider === "twitter" && !user.twitterId) {
        user.twitterId = providerId;
        await user.save();
      }
    } else {
      // User doesn't exist. Create a new user
      const userData = {
        name: name || email.split("@")[0],
        email,
        role: role || "buyer",
      };

      if (provider === "google") {
        userData.googleId = providerId;
      } else if (provider === "twitter") {
        userData.twitterId = providerId;
      }

      user = await User.create(userData);
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  socialLogin,
};
