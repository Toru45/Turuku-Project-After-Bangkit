import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const UserData = db.define('userdata', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    age: {
        type: DataTypes.INTEGER
    },
    gender: {
        type: DataTypes.STRING

    },
    bedTime: {
        type: DataTypes.TIME
    },
    wakeupTime: {
        type: DataTypes.TIME
    },

}, {
    freezeTableName: true
})

export default UserData;
