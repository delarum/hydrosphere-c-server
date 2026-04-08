// server/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Report = require('../models/Report');
const Innovation = require('../models/Innovation');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

// Register
router.post('/register', [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('age').isInt({ min: 18, max: 120 }),
  validate
], async (req, res) => {
  try {
    const { firstName, lastName, email, password, age } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });
    
    const user = await User.create({ firstName, lastName, email, password, age });
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        initials: user.initials,
        fullName: user.fullName,
        points: user.points,
        totalEarnings: user.totalEarnings,
        impactScore: user.impactScore,
        level: user.level,
        verifiedReports: user.verifiedReports,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        initials: user.initials,
        fullName: user.fullName,
        points: user.points,
        totalEarnings: user.totalEarnings,
        impactScore: user.impactScore,
        level: user.level,
        verifiedReports: user.verifiedReports,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Me (with full stats)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    // Get recent reports
    const recentReports = await Report.find({ user: user._id })
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('incidentType status rewardAmount submittedAt');
    
    // Get innovations
    const innovations = await Innovation.find({ user: user._id })
      .sort({ submittedAt: -1 })
      .select('title status submittedAt');
    
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
        totalEarnings: user.totalEarnings,
        impactScore: user.impactScore,
        level: user.level,
        verifiedReports: user.verifiedReports,
        pendingReports: user.pendingReports,
        totalReports: user.totalReports,
        badges: user.badges,
        rewardsHistory: user.rewardsHistory.slice(0, 10),
        recentReports,
        innovations
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Submit Report
router.post('/report', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const report = await Report.create({
      user: decoded.id,
      ...req.body
    });
    
    // Update user stats
    await User.findByIdAndUpdate(decoded.id, { $inc: { totalReports: 1, pendingReports: 1 } });
    
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit Innovation
router.post('/innovation', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const innovation = await Innovation.create({
      user: decoded.id,
      ...req.body
    });
    
    res.status(201).json({ success: true, innovation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Opportunities
router.get('/opportunities', async (req, res) => {
  try {
    const opportunities = [
      {
        id: 1,
        tag: 'SPRING 2025',
        title: 'Youth Water Innovation',
        description: 'Grants up to $10,000 for innovators under 30',
        deadline: 'Mar 30',
        applications: 142,
        color: 'blue'
      },
      {
        id: 2,
        tag: 'ROLLING',
        title: 'Community Solutions',
        description: 'Micro-grants for local water cleanup tech',
        range: '$500 - $2,000',
        status: 'Open',
        color: 'green'
      },
      {
        id: 3,
        tag: 'SUMMER 2025',
        title: 'Research Scholarship',
        description: 'Full funding for MSc/PhD water research',
        deadline: 'May 1',
        type: 'Academic partnership',
        color: 'purple'
      }
    ];
    
    res.json({ success: true, opportunities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;