import { Sequelize } from "sequelize";
import db from "../database.js";
import Note from "./Note.js";
import Folder from "./Folder.js";

const { DataTypes } = Sequelize;

const User = db.define('users', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Agar satu email hanya bisa digunakan untuk satu akun
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    freezeTableName: true // Memastikan nama tabel tetap 'users', tidak berubah jadi jamak otomatis
});

User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
Note.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Folder, { foreignKey: 'userId', as: 'folders' });
Folder.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default User;