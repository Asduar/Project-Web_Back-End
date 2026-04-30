import Tag from "../models/Tag.js";

export const createTag = async (req, res) => {
    try {
        const tagData = { ...req.body, userId: req.user.id };
        const newTag = await Tag.create(tagData);
        res.status(201).json({ success: true, message: "Tag berhasil dibuat", data: newTag });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTags = async (req, res) => {
    try {
        const tags = await Tag.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
        res.status(200).json({ success: true, data: tags });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Tag.update(req.body, { where: { id: id, userId: req.user.id } });
        if (updated[0] === 0) return res.status(404).json({ success: false, message: "Tag tidak ditemukan" });
        res.status(200).json({ success: true, message: "Tag berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Tag.destroy({ where: { id: id, userId: req.user.id } });
        if (!deleted) return res.status(404).json({ success: false, message: "Tag tidak ditemukan" });
        res.status(200).json({ success: true, message: "Tag berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};