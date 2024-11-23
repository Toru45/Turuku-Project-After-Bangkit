const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);

// Protected route example
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Protected route', user: req.user });
});

module.exports = router;