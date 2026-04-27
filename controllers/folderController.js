import Folder from '../models/Folder.js'; // Gunakan import dan wajib tambah .js

// 1. READ: Mengambil semua folder
const getAllFolders = async (req, res) => {
    try {
        const folders = await Folder.findAll();
        res.status(200).json({ success: true, data: folders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil folder", error: error.message });
    }
};

// 2. CREATE: Membuat folder baru
const createFolder = async (req, res) => {
    try {
        const { name } = req.body;
        const newFolder = await Folder.create({ name });
        res.status(201).json({ success: true, message: "Folder berhasil dibuat", data: newFolder });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal membuat folder", error: error.message });
    }
};

// 3. UPDATE: Mengubah nama folder
const updateFolder = async (req, res) => {
    try {
        const folderId = req.params.id;
        const { name } = req.body;

        const folder = await Folder.findByPk(folderId);
        if (!folder) return res.status(404).json({ success: false, message: "Folder tidak ditemukan" });

        folder.name = name;
        await folder.save();

        res.status(200).json({ success: true, message: "Folder berhasil diubah", data: folder });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengubah folder", error: error.message });
    }
};

// 4. DELETE: Menghapus folder
const deleteFolder = async (req, res) => {
    try {
        const folderId = req.params.id;
        const folder = await Folder.findByPk(folderId);
        
        if (!folder) return res.status(404).json({ success: false, message: "Folder tidak ditemukan" });

        await folder.destroy();
        res.status(200).json({ success: true, message: "Folder berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal menghapus folder", error: error.message });
    }
};

// ==========================================
// DIEKSPOR SEKALIGUS MENGGUNAKAN ES MODULES
// ==========================================
export {
    getAllFolders,
    createFolder,
    updateFolder,
    deleteFolder
};