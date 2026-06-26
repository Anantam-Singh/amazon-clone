const express = require("express");
const { signup, login, socialLogin } = require("../controllers/authController");
const { passport, generateToken } = require("../config/passport");

const router = express.Router();

// Standard Auth
router.post("/signup", signup);
router.post("/login", login);
router.post("/social-login", socialLogin);

// ── Google OAuth ──────────────────────────────────────────────
// Step 1: Start Google OAuth flow. Accept role query param and save to session.
router.get("/google", (req, res, next) => {
  const role = req.query.role || "buyer";
  req.session.oauthRole = role;
  req.session.save(() => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    })(req, res, next);
  });
});

// Step 2: Google redirects back here after user approves
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    session: true,
  }),
  (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user._id);

      // Send user data & token back to React via URL params
      const params = new URLSearchParams({
        token,
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      });

      res.redirect(`${process.env.CLIENT_URL}/oauth-callback?${params.toString()}`);
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }
  }
);

module.exports = router;
