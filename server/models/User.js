// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  age: { type: Number, required: true, min: 18, max: 120 },
  googleId: { type: String, unique: true, sparse: true },
  
  // Gamification
  points: { type: Number, default: 0, min: 0 },
  totalPointsEarned: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1, min: 1 },
  badges: [{ type: String }],
  
  // Earnings & Impact
  totalEarnings: { type: Number, default: 0, min: 0 },
  impactScore: { type: Number, default: 0, min: 0 },
  verifiedReports: { type: Number, default: 0 },
  pendingReports: { type: Number, default: 0 },
  totalReports: { type: Number, default: 0 },
  
  // Rewards History
  rewardsHistory: [{
    type: { type: String, enum: ['report', 'innovation', 'referral', 'bonus'] },
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'verified', 'paid'], default: 'pending' }
  }],
  
  // Innovation Lab
  innovations: [{
    title: String,
    category: String,
    status: { type: String, enum: ['submitted', 'under_review', 'approved', 'funded', 'rejected'], default: 'submitted' },
    fundingAmount: Number,
    submittedAt: { type: Date, default: Date.now }
  }],
  
  // Activity
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  
  // Profile
  avatar: { type: String, default: null },
  
  // Preferences
  notifications: {
    email: { type: Boolean, default: true },
    rewards: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Virtuals
userSchema.virtual('initials').get(function() {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Methods
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addReward = async function(amount, type, description) {
  this.totalEarnings += amount;
  this.points += Math.floor(amount / 10);
  this.impactScore += Math.floor(amount / 5);
  this.rewardsHistory.push({ type, amount, description, status: 'verified' });
  await this.save();
  return this;
};

const User = mongoose.model('User', userSchema);
module.exports = User;