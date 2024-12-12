import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = process.env.DB_NAME;
const SQL_HOST = process.env.SQL_HOST;
const SQL_USER = process.env.SQL_USER;
const SQL_PASSWORD = process.env.SQL_PASSWORD;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const db = new Sequelize(DB_NAME, SQL_USER, SQL_PASSWORD, {
  host: SQL_HOST,
  dialect: "mysql"
});

export default db;
export { 
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};