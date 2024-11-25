//memverifikasi token jwt
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  
  //mengambil header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; //mengambil index pertama dari aa yaitu header
  if (token == null) return res.sendStatus(401);
  
  //verifikasi token
  // eslint-disable-next-line no-undef
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.email = decoded.email;
    next();
  });
}
