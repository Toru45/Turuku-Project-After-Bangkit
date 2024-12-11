import Users from "../models/userModel.js";
import UserData from "../models/userdataModel.js";
import History from "../models/historyModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../config/Database.js";
import { PubSub } from '@google-cloud/pubsub';
import { sendWelcomeEmail } from './mailgun.js';


const pubSubClient = new PubSub();
const topicName = 'welcome-email';


export const users = async (req, res) => {
  try {
    // Mengambil userId dari request, pastikan userId sudah tersedia
    const userId = req.userId;

    // Mencari user berdasarkan userId
    const user = await Users.findOne({
      attributes: ["name"],
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ msg: "User  tidak ditemukan" });

    // Mengirimkan nama user yang sedang login
    res.json({ name: user.name });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

//function register
export const register = async (req, res) => {
  const { name, email, password, confPassword } = req.body;

  if (!name || !email || !password || !confPassword) {
    return res.status(400).json({ msg: "Semua kolom wajib diisi" });
  } else if (password !== confPassword) {
    return res.status(400).json({
      msg: "Password dan Confirm Password tidak cocok, silakan coba lagi",
    });
  } else if (!email.includes("@")) {
    return res.status(400).json({ msg: "Email harus memiliki simbol '@'" });
  }

  const existingUser = await Users.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ msg: "Email telah terdaftar" });
  }

  //validasi password mnggunakan regex harus memiliki minimal 1 angka,1 huruf, 1 symbol dan minimal 8 huruf
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      msg: "Password harus memiliki minimal 8 karakter dan setidaknya satu angka",
    });
  }

  //jika pass cocok
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  const id = (await Users.count()) + 1;

  try {
    await Users.create({
      id: id,
      name: name,
      email: email,
      password: hashPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });
    //jika users berhasil tersimpan ke dalam db
    await sendWelcomeEmail(email);
    const dataBuffer = Buffer.from(email);
    await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
        console.log(`Message ${email} published to topic ${topicName}`);

        res.json({ msg: "Register Berhasil" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};
//function login
export const login = async (req, res) => {
  try {
    const user = await Users.findAll({
      where: {
        email: req.body.email,
      },
    });
    if (!user || user.length === 0)
      return res.status(404).json({ msg: "Email tidak ditemukan" });

    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) return res.status(400).json({ msg: "Password salah" });

    const userId = user[0].id;
    const name = user[0].name;
    const email = user[0].email;

    const accessToken = jwt.sign({ userId, name, email }, ACCESS_TOKEN_SECRET, {
      expiresIn: "5m",
    });
    const refreshToken = jwt.sign(
      { userId, name, email },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    await Users.update(
      { refresh_token: refreshToken },
      { where: { id: userId } }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set to false for local development
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      accessToken,
      userId: userId, // Include userId in response
      name: name,
      email: email,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

//menambahkan userdata ke db
export const saveUserData = async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshToken;

    if (!refresh_token) {
      return res.status(401).json({ msg: "Token tidak ditemukan" });
    }

    const user = await Users.findOne({
      where: {
        refresh_token: refresh_token,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const { age, gender, chronotype } = req.body;

    if (!age || !gender) {
      return res.status(400).json({ msg: "Semua field wajib diisi" });
    }

    if (gender !== "0" && gender !== "1") {
      return res.status(400).json({
        msg: "Gender harus berupa '0'(perempuan) atau '1'(laki-laki)",
      });
    }

    const existingUserData = await UserData.findOne({
      where: { id_user: user.id },
    });

    if (existingUserData) {
      await UserData.update(
        {
          age: age,
          gender: gender,
          chronotype: chronotype || null,
        },
        {
          where: { id_user: user.id },
        }
      );
    } else {
      await UserData.create({
        id_user: user.id,
        age: age,
        gender: gender,
        chronotype: chronotype || null,
      });
    }

    res.json({ msg: "Data User berhasil disimpan atau diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

//menyimpan history user
export const saveUserHistory = async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshToken;

    if (!refresh_token) {
      return res.status(401).json({ msg: "Token tidak ditemukan" });
    }

    const user = await Users.findOne({
      where: {
        refresh_token: refresh_token,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const {
      bedtime,
      wakeuptime,
      sleep_recomendation,
      physical_activity_level,
      daily_steps,
    } = req.body;

    if (!bedtime || !wakeuptime || !physical_activity_level || !daily_steps) {
      return res.status(400).json({ msg: "Semua field wajib diisi" });
    }

    await History.create({
      id_user: user.id,
      bedtime: bedtime,
      wakeuptime: wakeuptime,
      physical_activity_level: physical_activity_level,
      daily_steps: daily_steps,
      sleep_recomendation: sleep_recomendation,
    });
    res.json({ msg: "Data History berhasil disimpan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};


//function get user History
export const getUserHistory = async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshToken;
    if (!refresh_token) {
      return res.status(401).json({ msg: "Token tidak ditemukan" });
    }

    let userId;
    jwt.verify(refresh_token, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ msg: "Token tidak valid" });
      }
      userId = decoded.userId; 
    });

    const userHistory = await History.findAll({
      where: {
        id_user: userId,
      },
      attributes: [
        "id",
        "id_user",
        "bedtime",
        "wakeuptime",
        "physical_activity_level",
        "daily_steps",
        "sleep_recomendation",
        "created_at",
        "updated_at",
      ],
      order: [["created_at", "DESC"]], 
    });

    if (!userHistory || userHistory.length === 0) {
      return res.status(404).json({ msg: "Data history tidak ditemukan" });
    }

    res.json(userHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confNewPassword) {
      return res.status(400).json({ msg: "Semua kolom input wajib diisi" });
    } else if (newPassword !== confNewPassword) {
      return res.status(400).json({
        msg: "Password baru dan Confirm Password tidak cocok, silakan periksa dan coba lagi",
      });
    }

    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        msg: "Password baru harus memiliki minimal 8 karakter dan setidaknya satu angka",
      });
    }

    const user = await Users.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ msg: "User  tidak ditemukan" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ msg: "Password saat ini salah" });
    const salt = await bcrypt.genSalt();
    const hashNewPassword = await bcrypt.hash(newPassword, salt);

    await Users.update(
      { password: hashNewPassword },
      { where: { id: userId } }
    );

    res.status(200).json({ msg: "Password berhasil diperbarui" });
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
      refresh_token: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await Users.update(
    { refresh_token: null },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};

export const chronotype = async (req, res)  => {
  try {
    const userId = req.userId; 
    const latestHistory = await History.findOne({
      where: { id_user: userId },
      order: [['created_at', 'DESC']],
    });

    if (!latestHistory) {
      return res.status(404).json({ msg: "Data history tidak ditemukan" });
    }


    const wakeupHour = parseInt(latestHistory.wakeuptime.split(':')[0]); 
    const bedtimeHour = parseInt(latestHistory.bedtime.split(':')[0]); 

    // Kirim data ke API Flask
    const response = await axios.post('https://turuku-ml-api-800638181621.asia-southeast2.run.app/chronotype', {
      wakeup_hour: wakeupHour,
      bedtime_hour: bedtimeHour,
    });

    const chronotypeResponse = response.data.chronotype; 

   
    let chronotypeValue;
    switch (chronotypeResponse) {
      case 'Bear':
        chronotypeValue = 0;
        break;
      case 'Dolphin':
        chronotypeValue = 1;
        break;
      case 'Lion':
        chronotypeValue = 2;
        break;
      case 'Wolf':
        chronotypeValue = 3;
        break;
      default:
        return res.status(400).json({ msg: "Chronotype tidak valid" });
    }

    await UserData.update(
      { chronotype: chronotypeValue },
      { where: { id_user: userId } }
    );

    res.json({ msg: "Chronotype berhasil diperbarui", chronotype: chronotypeValue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};


export const sleeprecomenadation = async (req, res) => {
  try {
    const userId = req.userId;
    const latestHistory = await History.findOne({
      where: { id_user: userId },
      order: [['created_at', 'DESC']],
    });

    if (!latestHistory) {
      return res.status(404).json({ msg: "Data history tidak ditemukan" });
    }

    const userData = await UserData.findOne({
      where: { id_user: userId },
    });

    if (!userData) {
      return res.status(404).json({ msg: "Data userdata tidak ditemukan" });
    }

    const dataToSend = {
      daily_steps: parseFloat((latestHistory.daily_steps / 1000).toFixed(3)), 
      physical_activity_level: parseInt(latestHistory.physical_activity_level, 10),
      age: parseInt(userData.age,10),
      gender: parseInt(userData.gender,10),
      chronotype: parseInt(userData.chronotype,10),
    };
    console.log("Data yang akan dikirim ke API Flask:", dataToSend);

    

    // Kirim data ke API Flask
    const response = await axios.post('https://turuku-ml-api-800638181621.asia-southeast2.run.app/sleep', dataToSend);

    const recommendedSleepDuration = response.data.recommended_sleep_duration;


    await History.update(
      { sleep_recomendation: recommendedSleepDuration },
      { where: { id: latestHistory.id } } 
    );

    res.json({ msg: "Data berhasil dikirim dan disimpan", recommended_sleep_duration: recommendedSleepDuration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const getSleepRecommendation = async (req, res) => {
  try {
    const userId = req.userId; 

    const userHistory = await History.findOne({
      where: { id_user: userId },
      order: [['created_at', 'DESC']], 
      attributes: ['sleep_recomendation'], 
    });

    if (!userHistory) {
      return res.status(404).json({ msg: "Data history tidak ditemukan" });
    }


    res.json({ sleep_recommendation: userHistory.sleep_recomendation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};