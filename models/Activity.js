import { DataTypes } from 'sequelize';
import db from '../database.js';

const Activity = db.define('Activity', {
    action: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'activities',
    timestamps: true
});

export default Activity;