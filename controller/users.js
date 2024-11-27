/* eslint-disable no-undef */
import { where } from "sequelize";
import Users from "../models/userModel.js";
import UserData from "../models/userdataModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ['id', 'name', 'email']
    });
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
    return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok, silakan coba lagi" });

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
    res.json({ msg: "Register Berhasil" });
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
    if (!match) return res.status(400).json({ msg: "Password salah" });

    //jika pass cocok
    const userId = user[0].id;
    const name = user[0].name;
    const email = user[0].email;

    //membuat akses token
    const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '5m'
    });

    //membuat refresh token
    const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d'
    });

    //simpan access token ke dalam db
    await Users.update({ refresh_token: refreshToken }, {
      where: {
        id: userId
      }
    })
    //membuat http only cookie ke client
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 //expired dalam 1 hari
    });

    //mengirimkan respon ke client access token
    res.json({ accessToken });

  } catch (error) {
    res.status(404).json({ msg: "Email tidak ditemukan" });
  }
}

//menambahkan userdata ke db
export const userdata = async (req, res) => {
  try {
    const { userId, age, gender, bedTime, wakeupTime } = req.body;

    // Validasi input
    if (!userId || !age || !gender || !bedTime || !wakeupTime) {
      return res.status(400).json({ msg: "Semua field wajib diisi" });
    }
    console.log(gender)

    const userdata = await UserData.findAll(
      {
        where: {
          id: userId
        }
      },
    )
    if (userdata.length > 0){
      await UserData.update(
        { age, gender, bedTime, wakeupTime },
        {
          where: {
            id: userId
          },
        }
      );
    }else {
      await UserData.create({
        id: userId,
        age: age,
        gender: gender,
        bedTime: bedTime,
        wakeupTime: wakeupTime
      })  
    }
   

    // Mengirimkan respons sukses
    res.status(200).json({ msg: "Data user berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};


//logout
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  const user = await Users.findAll({
    //bandingkan token dari db dengan token yang dikirim
    where: {
      refresh_token: refreshToken
    }
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await Users.update({ refresh_token: null }, {
    where: {
      id: userId
    }
  });
  res.clearCookie('refreshToken');
  return res.sendStatus(200);

}
