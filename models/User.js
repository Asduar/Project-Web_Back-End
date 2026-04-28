import { Sequelize } from "sequelize";
import db from "../database.js"; // Memanggil koneksi database yang ada di folder luar

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

export default User;