const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;

        // Role passed via state param (decoded from session)
        const role = req.session.oauthRole || "buyer";

        // Find existing user by googleId or email
        let user = await User.findOne({
          $or: [{ googleId }, { email }],
        });

        if (user) {
          // Update googleId if not set
          if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
          }
        } else {
          // Create new user via Google
          user = await User.create({
            name,
            email,
            googleId,
            role,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = { passport, generateToken };
