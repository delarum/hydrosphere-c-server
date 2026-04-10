const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('📦 Testing MongoDB connection...');
console.log('📍 URI:', MONGODB_URI?.replace(/\/\/(.*):(.*)@/, '//***:***@'));

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB FAILED to connect');
  console.error('❌ Error:', err.message);
  process.exit(1);
});