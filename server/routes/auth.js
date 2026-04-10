const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // ✅ ADDED
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// @route   POST /api/auth/register
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('age').isInt({ min: 18, max: 120 }).withMessage('You must be at least 18 years old'),
  validate
], async (req, res) => {
  try {
    console.log('📥 Incoming register request:', req.body);

    const { firstName, lastName, email, password, age } = req.body;

    if (!firstName || !lastName || !email || !password || !age) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      age: Number(age)
    });

    console.log('🛠 User before save:', user);

    await user.save();

    console.log('✅ User saved successfully');

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        initials: user.initials,
        fullName: user.fullName,
        points: user.points,
        level: user.level,
        badges: user.badges
      }
    });

  } catch (error) {
    console.error('❌ REGISTER ROUTE ERROR:');
    console.error(error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
});
// @route   POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    await user.updateLastActive();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  initials: user.initials,
  fullName: user.fullName,
  points: user.points,
  level: user.level,
  badges: user.badges,
  totalReports: user.totalReports,
  verifiedReports: user.verifiedReports,
  pendingReports: user.pendingReports,
  totalEarnings: user.totalEarnings,
  impactScore: user.impactScore,
  avatar: user.avatar
}
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @route   GET /api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login` // ✅ FIXED
  }),
  (req, res) => {
    const token = generateToken(req.user._id);

    // Redirect to frontend auth callback page
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  initials: user.initials,
  fullName: user.fullName,
  points: user.points,
  level: user.level,
  badges: user.badges,
  totalReports: user.totalReports,
  verifiedReports: user.verifiedReports,
  pendingReports: user.pendingReports,
  totalEarnings: user.totalEarnings,
  impactScore: user.impactScore,
  avatar: user.avatar,
  createdAt: user.createdAt
}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', protect, async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error logging out'
        });
      }
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
});

// @route   POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const newToken = generateToken(user._id);

    res.json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        initials: user.initials,
        fullName: user.fullName,
        points: user.points,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;