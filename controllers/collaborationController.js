// controllers/collaborationController.js
import Collaboration from "../models/Collaboration.js";

// CREATE - Undang user
export const addCollaborator = async (req, res) => {
    try {
        const { noteId, userId, role } = req.body;

        const newCollab = await Collaboration.create({
            noteId,
            userId,
            role,
        });

        res.status(201).json(newCollab);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ - Ambil semua collaborator di note
export const getCollaborators = async (req, res) => {
    try {
        const { noteId } = req.params;

        const collabs = await Collaboration.findAll({
            where: { noteId },
        });

        res.json(collabs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE - Ubah role
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        await Collaboration.update(
            { role },
            { where: { id } }
        );

        res.json({ message: "Role updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE - Hapus akses
export const removeCollaborator = async (req, res) => {
    try {
        const { id } = req.params;

        await Collaboration.destroy({
            where: { id },
        });

        res.json({ message: "Collaborator removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};