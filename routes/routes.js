require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountContent);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
}

// Hash a password securely using bcrypt
const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};

// Create a route to handle user creation
router.post('/users', async (req, res) => {
  try {
    console.log("Received user data:", req.body);

    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, role, and createdAt are required' });
    }

    const hashedPassword = await hashPassword(password);
    console.log("Hashed password:", hashedPassword);

    const newUserRef = admin.database().ref('users').push();
    const userId = newUserRef.key;
    const createdAt = req.body.createdAt || Date.now();

    await newUserRef.set({
      username,
      password: hashedPassword,
      role,
      createdAt,
      id: userId
    });

    console.log("User created successfully with ID:", userId); // Log successful creation with ID

    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});
  
module.exports = router;
