import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = "RAHASIA_MEMOORA_2026"; // Ganti dengan secret key kamu

// 1. [CREATE] - Registrasi User Baru
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Email sudah terdaftar!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ 
            success: true, 
            message: "Registrasi berhasil!",
            data: { id: newUser.id, username: newUser.username }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. [READ] - Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password salah!" });
        }

        // Generate Token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ 
            success: true, 
            message: "Login berhasil!",
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. [UPDATE] - Perbarui Profil atau Password
router.put('/profile', async (req, res) => {
    try {
        const { id, username, email, password } = req.body;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        let updatedData = { username, email };

        // Jika ingin ganti password, hash password baru
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updatedData.password = await bcrypt.hash(password, salt);
        }

        await user.update(updatedData);

        res.json({ 
            success: true, 
            message: "Profil berhasil diperbarui!",
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. [DELETE] - Hapus Akun Permanen
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        await user.destroy();
        res.json({ success: true, message: "Akun dan data terkait telah dihapus." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;