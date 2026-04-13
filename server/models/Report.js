
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Incident Details
  incidentType: { 
    type: String, 
    required: true,
    enum: ['toxic_spillage', 'industrial_dumping', 'oil_hydrocarbon', 'garbage_plastic', 'other']
  },
  waterBody: { type: String, required: true },
  specificLocation: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  description: { type: String, required: true },
  
  // Media
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video'] }
  }],
  
  // Responsible Party
  knowsResponsible: { type: Boolean, default: false },
  responsibleParty: { type: String },
  
  // Status & Rewards
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'verified', 'rejected'], 
    default: 'submitted' 
  },
  rewardAmount: { type: Number, default: 0 },
  rewardPaid: { type: Boolean, default: false },
  
  // Anonymous
  isAnonymous: { type: Boolean, default: true },
  
  // Metadata
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Report', reportSchema);