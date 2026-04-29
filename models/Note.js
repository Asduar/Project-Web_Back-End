import { DataTypes } from 'sequelize';
import db from '../database.js';
import Folder from './Folder.js';

const Note = db.define('Note', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    dueDate: { type: DataTypes.DATEONLY },
    tag: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    folderId: {
        type: DataTypes.INTEGER,
        references: {
            model: Folder,
            key: 'id'
        },
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false // Catatan wajib punya pemilik
    }
}, {
    tableName: 'notes',
    timestamps: true
});

Note.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });
Folder.hasMany(Note, { foreignKey: 'folderId', as: 'notes' });

export default Note;