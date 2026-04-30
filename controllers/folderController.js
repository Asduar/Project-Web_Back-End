import Folder from '../models/Folder.js'; 

const getAllFolders = async (req, res) => {
    try {
        const folders = await Folder.findAll({ where: { userId: req.user.id } });
        res.status(200).json({ success: true, data: folders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil folder", error: error.message });
    }
};

const createFolder = async (req, res) => {
    try {
        const { name } = req.body;
        const newFolder = await Folder.create({ name, userId: req.user.id });
        res.status(201).json({ success: true, message: "Folder berhasil dibuat", data: newFolder });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal membuat folder", error: error.message });
    }
};

const updateFolder = async (req, res) => {
    try {
        const folderId = req.params.id;
        const { name } = req.body;
        const folder = await Folder.findOne({ where: { id: folderId, userId: req.user.id } });
        if (!folder) return res.status(404).json({ success: false, message: "Folder tidak ditemukan atau bukan milik Anda" });

        folder.name = name;
        await folder.save();

        res.status(200).json({ success: true, message: "Folder berhasil diubah", data: folder });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengubah folder", error: error.message });
    }
};

const deleteFolder = async (req, res) => {
    try {
        const folderId = req.params.id;
        const folder = await Folder.findOne({ where: { id: folderId, userId: req.user.id } });
        
        if (!folder) return res.status(404).json({ success: false, message: "Folder tidak ditemukan atau bukan milik Anda" });

        await folder.destroy();
        res.status(200).json({ success: true, message: "Folder berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal menghapus folder", error: error.message });
    }
};

export {
    getAllFolders,
    createFolder,
    updateFolder,
    deleteFolder
};