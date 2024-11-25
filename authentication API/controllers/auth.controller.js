const bcrypt = require('bcrypt');
const db = require('../config/database');
const { admin } = require('../config/firebase');
const { createJWTToken } = require('../utils/jwt.utils');

const SALT_ROUNDS = 10;

class AuthController {
    async register(req, res) {
        try {
            const { email, password, confirmPassword, name } = req.body;

            // Input validation
            if (!email || !password || !confirmPassword || !name) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Password validation
            if (password !== confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }

            if (password.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters long' });
            }

            // Check if user exists
            const userRef = db.collection('users');
            const snapshot = await userRef.where('email', '==', email).get();

            if (!snapshot.empty) {
                return res.status(409).json({ error: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Create user in Firebase Auth
            const userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: name
            });

            // Store additional user data in Firestore
            await userRef.doc(userRecord.uid).set({
                email,
                name,
                hashedPassword,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Generate JWT token
            const token = createJWTToken(userRecord.uid);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    name: userRecord.displayName
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Get user from Firestore
            const userRef = db.collection('users');
            const snapshot = await userRef.where('email', '==', email).get();

            if (snapshot.empty) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const userData = snapshot.docs[0].data();
            const userId = snapshot.docs[0].id;

            // Verify password
            const isValidPassword = await bcrypt.compare(password, userData.hashedPassword);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = createJWTToken(userId);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    uid: userId,
                    email: userData.email,
                    name: userData.name
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            // Check if user exists
            const userRef = db.collection('users');
            const snapshot = await userRef.where('email', '==', email).get();

            if (snapshot.empty) {
                // For security reasons, always return success even if email doesn't exist
                return res.status(200).json({ message: 'If an account exists, a password reset link will be sent' });
            }

            // Send password reset email using Firebase
            await admin.auth().generatePasswordResetLink(email);

            res.status(200).json({
                message: 'If an account exists, a password reset link will be sent'
            });

        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ error: 'Failed to process forgot password request' });
        }
    }
}

module.exports = new AuthController();
