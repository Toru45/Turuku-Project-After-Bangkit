import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../config/Database.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Mengambil token dari header

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

//Kode lama kalau utak atik secret manager gagal wkkwkwkw

/*
//memverifikasi token jwt
import jwt from 'jsonwebtoken';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export const verifyToken = (req, res, next) => {
  
  //mengambil header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; //mengambil index pertama dari aa yaitu header
  if (token == null) return res.sendStatus(401);
  
  //verifikasi token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.email = decoded.email;
    req.userId = decoded.userId;
    next();
  });
}

*/
