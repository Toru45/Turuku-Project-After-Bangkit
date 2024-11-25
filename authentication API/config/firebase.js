const admin = require('firebase-admin');
require('dotenv').config();

const initializeFirebase = () => {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
    });
};

module.exports = {
    initializeFirebase,
    admin
};