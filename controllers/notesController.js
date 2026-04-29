import { Op } from "sequelize"; 
import Note from "../models/Note.js"; 

export const getAllNotes = async (req, res) => {
  try {
    const status = req.query.status;
    const search = req.query.search;
    
    // Hanya ambil catatan milik user yang sedang login
    let condition = { userId: req.user.id }; 

    if (status && status !== 'all') {
      condition.status = status;
    }

    if (search) {
      condition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const data = await Note.findAll({ 
        where: condition,
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, message: "Catatan berhasil diambil", data: data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const id = req.params.id;
    // Pastikan ID catatan cocok dan milik user tersebut
    const data = await Note.findOne({ where: { id: id, userId: req.user.id }});

    if (!data) return res.status(404).json({ success: false, message: `Catatan tidak ditemukan atau bukan milik Anda` });

    res.status(200).json({ success: true, message: "Catatan berhasil diambil", data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createNote = async (req, res) => {
  try {
    // Sisipkan ID user yang sedang login sebelum disimpan ke database
    const noteData = { ...req.body, userId: req.user.id };
    const newNote = await Note.create(noteData); 

    res.status(201).json({ success: true, message: "Catatan berhasil disimpan", data: newNote });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const id = req.params.id;
    
    const updated = await Note.update(req.body, {
        where: { id: id, userId: req.user.id }
    });

    if (updated[0] === 0) return res.status(404).json({ success: false, message: "Catatan tidak ditemukan atau bukan milik Anda" });

    res.status(200).json({ success: true, message: "Catatan berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Note.destroy({ where: { id: id, userId: req.user.id } });

    if (!deleted) return res.status(404).json({ success: false, message: "Catatan tidak ditemukan atau bukan milik Anda" });

    res.status(200).json({ success: true, message: `Catatan berhasil dihapus permanen` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};