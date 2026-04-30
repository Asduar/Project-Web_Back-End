import jwt from "jsonwebtoken";

const JWT_SECRET = "RAHASIA_MEMOORA_2026"; 

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Akses ditolak. Silakan login kembali." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Token tidak valid atau kadaluarsa." });
        }
        
        req.user = user; 
        next();
    });
};