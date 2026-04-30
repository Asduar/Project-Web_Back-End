import Collaboration from "../models/Collaboration.js";
import User from "../models/User.js";

export const addCollaborator = async (req, res) => {
    try {
        const { email, role } = req.body;

        const targetUser = await User.findOne({ where: { email: email } });
        
        if (!targetUser) {
            return res.status(404).json({ 
                success: false, 
                message: "Email tidak ditemukan. Pastikan temanmu sudah daftar Memoora!" 
            });
        }

        const existingCollab = await Collaboration.findOne({ where: { email: email } });
        
        if (existingCollab) {
            return res.status(400).json({ 
                success: false, 
                message: "Email ini sudah ada di daftar kolaborator." 
            });
        }

        const newCollab = await Collaboration.create({ email, role });
        
        res.status(201).json({ success: true, data: newCollab });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCollaborators = async (req, res) => {
    try {
        const collabs = await Collaboration.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({ success: true, data: collabs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeCollaborator = async (req, res) => {
    try {
        const { id } = req.params;
        await Collaboration.destroy({ where: { id } });
        res.status(200).json({ success: true, message: "Collaborator removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};