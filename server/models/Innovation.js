// server/models/Innovation.js
const mongoose = require('mongoose');

const innovationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Project Details
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['water_treatment', 'waste_management', 'monitoring_tech', 'ecosystem_restoration', 'other']
  },
  developmentStage: {
    type: String,
    required: true,
    enum: ['concept', 'prototype', 'pilot', 'scaling']
  },
  description: { type: String, required: true },
  
  // Support Needed
  supportRequired: [{
    type: String,
    enum: ['funding', 'mentorship', 'lab_access', 'pilot_site']
  }],
  
  // Student Scholarship
  isStudentApplication: { type: Boolean, default: false },
  institution: String,
  course: String,
  
  // Status
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'shortlisted', 'approved', 'funded', 'rejected'],
    default: 'submitted'
  },
  
  // Funding
  requestedAmount: Number,
  grantedAmount: Number,
  
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewerNotes: String
});

module.exports = mongoose.model('Innovation', innovationSchema);