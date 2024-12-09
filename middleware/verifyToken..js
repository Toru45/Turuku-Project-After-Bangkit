import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../config/Database.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Mengambil token dari header

  if (!token) return res.sendStatus(401); 

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET); 
    req.email = decoded.email; 
    req.userId = decoded.userId;
    next(); 
  } catch (error) {
    console.log(error.message);
    return res.sendStatus(403);
  }
};
