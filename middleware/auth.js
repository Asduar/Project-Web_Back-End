import jwt from "jsonwebtoken";

const JWT_SECRET = "RAHASIA_MEMOORA_2026"; // Harus sama dengan yang di userRoutes.js

export const verifyToken = (req, res, next) => {
    // Ambil token dari header request
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ success: false, message: "Akses ditolak. Silakan login kembali." });
    }

    // Verifikasi token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Token tidak valid atau kadaluarsa." });
        }
        
        // Simpan data user (id, username) ke dalam request untuk dipakai di Controller nanti
        req.user = user; 
        next(); // Lanjut ke proses berikutnya
    });
};