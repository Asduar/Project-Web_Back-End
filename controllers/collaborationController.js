// controllers/collaborationController.js
import Collaboration from "../models/Collaboration.js";

// CREATE - Undang user
export const addCollaborator = async (req, res) => {
    try {
        const { email, role } = req.body;

        const newCollab = await Collaboration.create({ email, role });
        
        // Sesuaikan dengan format yang ditunggu app.js
        res.status(201).json({ success: true, data: newCollab });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// READ - Ambil semua collaborator (Hapus filter noteId agar muncul di Global Tab)
export const getCollaborators = async (req, res) => {
    try {
        const collabs = await Collaboration.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        // Sesuaikan dengan format yang ditunggu app.js
        res.status(200).json({ success: true, data: collabs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE - Hapus akses
export const removeCollaborator = async (req, res) => {
    try {
        const { id } = req.params;
        await Collaboration.destroy({ where: { id } });
        res.status(200).json({ success: true, message: "Collaborator removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};