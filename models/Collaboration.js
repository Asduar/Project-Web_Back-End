import { Sequelize } from "sequelize";
import db from "../database.js";

const { DataTypes } = Sequelize;

const Collaboration = db.define("Collaboration", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    noteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("view", "edit"),
        defaultValue: "view",
    },
},
    {
        tableName: 'collaboration',
        timestamps: true
    });

export default Collaboration;