// controllers/collaborationController.js
import Collaboration from "../models/Collaboration.js";
<<<<<<< HEAD
=======
// import user dari tabel user
import User from "../models/User.js";
>>>>>>> c73987a078e3ec2ffa312d3f81ba1352dbda5bf3

// CREATE - Undang user
export const addCollaborator = async (req, res) => {
    try {
        const { email, role } = req.body;

<<<<<<< HEAD
        const newCollab = await Collaboration.create({ email, role });
        
        // Sesuaikan dengan format yang ditunggu app.js
=======
        // 1. CEK KE DATABASE USER: Apakah email terdaftar?
        const targetUser = await User.findOne({ where: { email: email } });
        
        if (!targetUser) {
            return res.status(404).json({ 
                success: false, 
                message: "Email tidak ditemukan. Pastikan temanmu sudah daftar Memoora!" 
            });
        }

        // 2. CEK DUPLIKASI: Apakah sudah jadi kolaborator?
        const existingCollab = await Collaboration.findOne({ where: { email: email } });
        
        if (existingCollab) {
            return res.status(400).json({ 
                success: false, 
                message: "Email ini sudah ada di daftar kolaborator." 
            });
        }

        // 3. JIKA LOLOS SEMUA CEK, BARU SIMPAN (Kode Asli Kasih)
        const newCollab = await Collaboration.create({ email, role });
        
>>>>>>> c73987a078e3ec2ffa312d3f81ba1352dbda5bf3
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