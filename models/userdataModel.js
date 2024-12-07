import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const UserData = db.define(
  "userdata",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    gender: {
      type: DataTypes.STRING,
    },
    chronotype: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default UserData;
