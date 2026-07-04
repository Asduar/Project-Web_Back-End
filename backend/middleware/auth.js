import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Akses ditolak. Silakan login kembali." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Token tidak valid atau kadaluarsa." });
        }
        
        req.user = user; 
        next();
    });
};

export const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        return res.status(403).json({ 
            success: false, 
            message: "Akses ditolak. Tindakan ini membutuhkan hak akses Admin." 
        });
    }
};