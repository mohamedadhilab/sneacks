const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        // ✅ 1. Find using googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // ✅ 2. If not found, check email
        const email = profile.emails[0].value;

        user = await User.findOne({ email });

        // ✅ 3. If email exists → link Google
        if (user) {
          user.googleId = profile.id;
          user.isVerified = true;
          await user.save();

          return done(null, user);
        }

        // ✅ 4. Create new user
        user = await User.create({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          isVerified: true
        });

        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});