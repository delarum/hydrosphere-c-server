// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();

// ============================
// BASIC MIDDLEWARE
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// ============================
// TEMP SESSION (NO MONGOSTORE YET)
// ============================
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // keep false for localhost
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000
  }
}));

// ============================
// PASSPORT
// ============================
app.use(passport.initialize());
app.use(passport.session());
require('./server/config/passport');

// ============================
// DB STATUS LOGS
// ============================
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected');
});

mongoose.connection.on('error', (err) => {
  console.log('🔴 Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected');
});

// ============================
// ROUTES
// ============================
const authRoutes = require('./server/routes/auth');
const userRoutes = require('./server/routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// ============================
// HEALTH CHECK
// ============================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    dbState: mongoose.connection.readyState
  });
});

// ============================
// TEST DB ROUTE
// ============================
app.get('/api/test-db', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({
      success: true,
      message: 'Database connected',
      collections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// ERROR HANDLER
// ============================
app.use((err, req, res, next) => {
  console.error('🔥 SERVER ERROR:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================
// CONNECT TO DB + START SERVER
// ============================
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const startServer = async () => {
  try {
    console.log('📦 Attempting MongoDB connection...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB Connected Successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Client URL: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

startServer();