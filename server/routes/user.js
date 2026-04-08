// server/routes/user.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/user/points
// @desc    Get user points and stats
// @access  Private
router.get('/points', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      points: user.points,
      totalPointsEarned: user.totalPointsEarned,
      level: user.level,
      badges: user.badges,
      nextLevelPoints: user.level * 1000,
      progress: ((user.totalPointsEarned % 1000) / 1000) * 100
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching points'
    });
  }
});

// @route   POST /api/user/points/add
// @desc    Add points to user (called when report is verified)
// @access  Private
router.post('/points/add', protect, async (req, res) => {
  try {
    const { points, reason } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points value'
      });
    }
    
    const user = await User.findById(req.user.id);
    await user.addPoints(points, reason);
    
    res.json({
      success: true,
      message: `${points} points added`,
      newTotal: user.points,
      level: user.level,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding points'
    });
  }
});

// @route   GET /api/user/leaderboard
// @desc    Get top users by points
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({ isActive: true })
      .select('firstName lastName points level badges reportsVerified')
      .sort({ points: -1 })
      .limit(10);
    
    res.json({
      success: true,
      leaderboard: topUsers.map(user => ({
        id: user._id,
        initials: user.initials,
        fullName: user.fullName,
        points: user.points,
        level: user.level,
        badges: user.badges,
        reportsVerified: user.reportsVerified
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard'
    });
  }
});

module.exports = router;