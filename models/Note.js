import { Sequelize } from "sequelize";
import db from "../database.js";

const { DataTypes } = Sequelize;

const Note = db.define('notes', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    tag: {
        type: DataTypes.STRING,
        defaultValue: 'normal'
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed'),
        defaultValue: 'pending'
    }
}, {
    freezeTableName: true
});

export default Note;