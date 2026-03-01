require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // Local dev
  process.env.FRONTEND_URL, // Vercel deployed frontend variable
  'https://signup-and-signin-4v9r.vercel.app', // Newly created Vercel frontend
  'https://signup-and-signin-sandy.vercel.app' // Old Vercel URL just in case
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database connection pool for serverless environments
const dbPool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

const initializeDB = async () => {
  try {
    const connection = await dbPool.getConnection();
    console.log('Connected to Aiven MySQL Database successfully.');

    // Initialize Database Schema if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table ensured.');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

initializeDB();

// Middleware to inject dbPool into requests
app.use((req, res, next) => {
  req.db = dbPool;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Premium SaaS Backend Running');
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
