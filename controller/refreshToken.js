import Users from "../models/userModel.js";
import jwt from "jsonwebtoken"
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/Database.js';

//function refresh token
export const refreshToken = async (req,res) => {
  try {
    //mengambil value dari token cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = await Users.findAll({
      //bandingkan token dari db dengan token yang dikirim
      where: {
        refresh_token: refreshToken
      }
    });
    if (!user[0]) return res.sendStatus(403);
    // eslint-disable-next-line no-unused-vars
    jwt.verify(refreshToken,REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      const userId = user[0].id;
      const name = user[0].name;
      const email = user[0].email;

      //buat akses token baru
      const accessToken = jwt.sign({userId, name, email},ACCESS_TOKEN_SECRET, {
        expiresIn: '5m'
      });
      res.json({accessToken});
    })
    
  } catch (error) {
    console.log(error);
  }
}