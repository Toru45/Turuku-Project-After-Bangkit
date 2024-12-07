import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const History = db.define(
  "history",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
    },
    bedtime: {
      type: DataTypes.TIME,
    },
    wakeuptime: {
      type: DataTypes.TIME,
    },
    physical_activity_level: {
      type: DataTypes.INTEGER,
    },
    daily_steps: {
      type: DataTypes.INTEGER,
    },
    sleep_recomendation: {
      type: DataTypes.STRING,
    },
    // chronotypes: {
    //   type: DataTypes.STRING,
    // },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default History;
