import { DataTypes } from 'sequelize';
import db from '../database.js';

const Tag = db.define('Tag', {
    name: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, defaultValue: '#f39c12' },
    userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'tags',
    timestamps: true
});

export default Tag;