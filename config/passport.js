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

        // =========================
        // GET PROFILE DATA
        // =========================
        const email = profile.emails[0].value.toLowerCase();

        const name = profile.displayName;

        // =========================
        // FIND BY GOOGLE ID
        // =========================
        let user = await User.findOne({
          googleId: profile.id
        });

        // USER FOUND
        if (user) {
          return done(null, user);
        }

        // =========================
        // FIND BY EMAIL
        // =========================
        user = await User.findOne({
          email: email
        });

        // =========================
        // LINK GOOGLE ACCOUNT
        // =========================
        if (user) {

          // BLOCKED USER CHECK
          if (user.isBlocked) {
            return done(null, false, {
              message: 'User is blocked'
            });
          }

          user.googleId = profile.id;

          user.isVerified = true;

          await user.save();

          return done(null, user);
        }

        // =========================
        // CREATE NEW USER
        // =========================
        user = await User.create({

          name: name,

          email: email,

          googleId: profile.id,

          isVerified: true
        });

        return done(null, user);

      } catch (error) {

        console.log(error);

        return done(error, null);
      }
    }
  )
);


// =========================
// SERIALIZE USER
// =========================
passport.serializeUser((user, done) => {

  done(null, user.id);
});


// =========================
// DESERIALIZE USER
// =========================
passport.deserializeUser(async (id, done) => {

  try {

    const user = await User.findById(id);

    done(null, user);

  } catch (error) {

    done(error, null);
  }
});