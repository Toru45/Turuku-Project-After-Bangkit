const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { db, auth } = require("../firebase");

const router = express.Router();

// Middleware for common responses
const sendResponse = (res, status, message, data = null) => {
    res.status(status).json({ message, data });
};

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return sendResponse(res, 400, "Email and password are required");

    try {
        const user = await auth.getUserByEmail(email);
        const userDoc = await db.collection("users").doc(user.uid).get();

        if (!userDoc.exists) return sendResponse(res, 404, "User not found");

        const userData = userDoc.data();

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
        if (!isPasswordValid) return sendResponse(res, 401, "Invalid credentials");

        sendResponse(res, 200, "Login successful", { uid: user.uid, email: user.email });
    } catch (error) {
        sendResponse(res, 400, error.message);
    }
});

// REGISTER
router.post("/register", async (req, res) => {
    const { email, password, confirmPassword, displayName } = req.body;

    if (!email || !password || !confirmPassword || !displayName)
        return sendResponse(res, 400, "All fields are required");

    // Validate email format
    if (!validator.isEmail(email)) return sendResponse(res, 400, "Invalid email format");

    // Validate password match
    if (password !== confirmPassword) return sendResponse(res, 400, "Passwords do not match");

    // Validate password strength
    if (password.length < 8)
        return sendResponse(res, 400, "Password must be at least 8 characters long");

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user in Firebase Authentication
        const userRecord = await auth.createUser({ email, password, displayName });

        // Store hashed password in Firestore
        await db.collection("users").doc(userRecord.uid).set({
            email,
            displayName,
            passwordHash: hashedPassword,
        });

        sendResponse(res, 201, "User registered successfully", { uid: userRecord.uid });
    } catch (error) {
        sendResponse(res, 400, error.message);
    }
});

// FORGET PASSWORD
router.post("/forget-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return sendResponse(res, 400, "Email is required");

    // Validate email format
    if (!validator.isEmail(email)) return sendResponse(res, 400, "Invalid email format");

    try {
        await auth.generatePasswordResetLink(email);
        sendResponse(res, 200, "Password reset email sent");
    } catch (error) {
        sendResponse(res, 400, error.message);
    }
});

module.exports = router;