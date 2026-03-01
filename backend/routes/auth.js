const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'your_super_secret_jwt_key_here'; // In production, use environment variables

// Register Route
router.post('/register', async (req, res) => {
    const { username, email, phone, password } = req.body;
    if (!username || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const db = req.db;
        if (!db) {
            return res.status(500).json({ error: 'Database connection problem.' });
        }

        // Check if user exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists with that username or email.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        await db.query(
            'INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)',
            [username, email, phone, hashedPassword]
        );

        res.status(201).json({ message: 'register success' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const db = req.db;
        if (!db) {
            return res.status(500).json({ error: 'Database connection problem.' });
        }

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: false, // Since we are running on localhost HTTP
            sameSite: 'lax',
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json({ message: 'login success', user: { username: user.username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;
