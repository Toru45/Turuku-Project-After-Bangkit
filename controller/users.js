import Users from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll();
    res.json(users);
  } catch (error) {
    console.log(error.message);
  }
}

//function register
export const register = async (req, res) => {
  const {  
    name, 
    email, 
    password, 
    confPassword 
  } = req.body;

  if (password !== confPassword) 
    return res.status(400).json({msg: "Password dan Confirm Password tidak cocok, silakan coba lagi"});
  
  if (!email.includes("@")) {
    return res.status(400).json({ msg: "Email harus memiliki simbol '@'" });
  }
  
  //validasi password mnggunakan regex harus memiliki minimal 1 angka,1 huruf, 1 symbol dan minimal 8 huruf
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ msg: "Password harus memiliki minimal 8 karakter dan setidaknya satu angka" });
  }

  //jika pass cocok
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    await Users.create({
      name: name,
      email: email,
      password: hashPassword
    });
    //jika users berhasil tersimpan ke dalam db
    res.json({msg: "Register Berhasil"});
  } catch (error) {
    console.log(error);
  }
} 

//function login
export const login = async (req, res) => {
  try {
    const user = await Users.findAll({
      where: {
        email: req.body.email
      }
    }); 
    //jika user pada email ditemukan maka akan membandingkan password dari client ke dalam database
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) return res.status(400).json({msg: "Password salah"});

    //jika pass cocok
    const userId = user[0].id;
    const name = user[0].name;
    const email = user[0].email;

    //membuat akses token
    const accessToken = jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '20s'
    });

    //membuat refresh token
    const refreshToken = jwt.sign({userId, name, email}, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d'
    });

    //simpan access token ke dalam db
    await Users.update({refresh_token: refreshToken},{
      where:{
        id: userId
      }
    })

  } catch (error) {
    res.status(404).json({msg: "Email tidak ditemukan"});
  }
}
