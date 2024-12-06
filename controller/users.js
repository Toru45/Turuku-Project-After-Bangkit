// import { where } from "sequelize";
import Users from "../models/userModel.js";
import UserData from "../models/userdataModel.js";
import History from "../models/historyModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../config/Database.js";

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
    res.json({ msg: "Register Berhasil" });
  } catch (error) {
    console.log(error);
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
export const createUserDataAndHistory = async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshToken;

    // Jika refresh token tidak ditemukan akan mengembalikan status 401 Token tidak ditemukans
    if (!refresh_token) {
      return res.status(401).json({ msg: "Token tidak ditemukan" });
    }

    // Cari user berdasarkan refresh token
    const user = await Users.findOne({
      where: {
        refresh_token: refresh_token,
      },
    });

    // console.log(user);

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const { age, gender, chronotype } = req.body;

    // Validasi inputan
    if (!age || !gender) {
      return res.status(400).json({ msg: "Semua field wajib diisi" });
    }

    if (gender !== "Male" && gender !== "Female") {
      return res
        .status(400)
        .json({ msg: "Gender harus berupa 'Male' atau 'Female'" });
    }

    // Create userData kedalam tabel UserData dengan id yang unik
    const id = (await UserData.count()) + 1;
    await UserData.create({
      id: id,
      id_user: user.id,
      refresh_token: refresh_token,
      age: age,
      gender: gender,
      chronotype: chronotype,
      bed_time: null,
      wakeup_time: null,
      physical_activity_level: null,
      daily_steps: null,
    });

    const { bedtime, wakeuptime, sleep_recomendation, physical_activity_level, daily_steps } =
      req.body;

    if (!bedtime || !wakeuptime || !physical_activity_level || !daily_steps) {
      return res.status(400).json({ msg: "Semua field wajib diisi" });
    }
    // const sleep_recomendation = 8; // Sesuaikan dengan  inputan dari ML model

    // Create data baru ke dalam tabel History dengan id yang unik
    const historyId = await History.count() + 1;
    await History.create({
      id: historyId,
      id_user: user.id,
      refresh_token: refresh_token,
      bedtime: bedtime,
      wakeuptime: wakeuptime,
      physical_activity_level: physical_activity_level,
      daily_steps: daily_steps,
      sleep_recomendation: sleep_recomendation,
    });

    // console.log(createHistory);
    res.json({ msg: "Data berhasil disimpan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

//function get user History
export const getUserHistory = async (req, res) => {
  try {
    // Ambil refresh token dari cookie
    const cookie = req.cookies.refreshToken;
    // Jika refresh token tidak ditemukan akan mengembalikan status 401 Token tidak ditemukan
    if (!cookie) {
      return res.status(401).json({ msg: "Token tidak ditemukan" });
    }

    // Ambil table data user berdasarkan refresh token(cookie)
    const user = await Users.findOne({
      where: {
        refresh_token: cookie,
      },
    });

    //  Ambil table data history berdasarkan refresh token
    const userHistory = await History.findAll({
      where: {
        refresh_token: user.refresh_token,
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
      order: [["created_at", "DESC"]], // Order by newest first
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

// /changePassword
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

    // Validasi password baru menggunakan regex
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

//test 4
