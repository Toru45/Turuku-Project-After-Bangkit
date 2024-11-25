const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

const createJWTToken = (userId) => {
    return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

module.exports = {
    createJWTToken,
    JWT_SECRET
};