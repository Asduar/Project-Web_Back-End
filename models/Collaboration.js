import { Sequelize } from "sequelize";
import db from "../database.js";

const { DataTypes } = Sequelize;

const Collaboration = db.define("Collaboration", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("viewer", "editor"),
        defaultValue: "viewer",
    },
}, {
    tableName: 'collaboration',
    timestamps: true
});

export default Collaboration;