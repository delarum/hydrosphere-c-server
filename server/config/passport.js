// server/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // Update last active
        await user.updateLastActive();
        return done(null, user);
      }
      
      // Check if email already exists (link accounts)
      const existingEmail = await User.findOne({ email: profile.emails[0].value });
      if (existingEmail) {
        // Link Google account to existing account
        existingEmail.googleId = profile.id;
        existingEmail.googleEmail = profile.emails[0].value;
        existingEmail.isEmailVerified = true;
        await existingEmail.save();
        return done(null, existingEmail);
      }
      
      // Extract name from Google profile
      const firstName = profile.name.givenName || 'Unknown';
      const lastName = profile.name.familyName || 'User';
      
      // Create new user
      user = new User({
        googleId: profile.id,
        googleEmail: profile.emails[0].value,
        email: profile.emails[0].value,
        firstName: firstName,
        lastName: lastName,
        age: 18, // Default for Google users - should prompt for update
        isEmailVerified: true,
        avatar: profile.photos[0]?.value || null
      });
      
      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));