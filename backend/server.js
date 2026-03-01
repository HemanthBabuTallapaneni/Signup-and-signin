require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Vite default port
app.use(express.json());
app.use(cookieParser());

// Database connection parameters
const dbConfig = {
  uri: process.env.DATABASE_URL
};

let dbConnection;

const connectDB = async () => {
  try {
    dbConnection = await mysql.createConnection(dbConfig.uri);
    console.log('Connected to Aiven MySQL Database successfully.');

    // Initialize Database Schema if not exists
    await dbConnection.query(`
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
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

connectDB();

// Middleware to inject dbConnection into requests
app.use((req, res, next) => {
  req.db = dbConnection;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Premium SaaS Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
