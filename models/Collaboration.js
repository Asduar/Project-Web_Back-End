import { Sequelize } from "sequelize";
import db from "../database.js";

const { DataTypes } = Sequelize;

const Collaboration = db.define("Collaboration", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // Ganti userId menjadi email agar sesuai dengan input Frontend
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Samakan nama ENUM dengan opsi dropdown di Frontend
    role: {
        type: DataTypes.ENUM("viewer", "editor"),
        defaultValue: "viewer",
    },
}, {
    tableName: 'collaboration',
    timestamps: true
});

export default Collaboration;