import { Sequelize } from "sequelize";
import db from "../database.js";

const { DataTypes } = Sequelize;

const Folder = db.define('Folder', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'folders',
    timestamps: true
});

export default Folder;