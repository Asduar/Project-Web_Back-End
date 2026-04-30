// utils/AppError.js

// Menerapkan konsep Class dan Inheritance (Pewarisan dari class Error bawaan Node.js)
class AppError extends Error {
    constructor(message, statusCode) {
        super(message); // Memanggil constructor dari class induk (Error)
        
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Menandai bahwa ini error yang kita prediksi, bukan server crash

        // Menangkap jejak tumpukan error (stack trace)
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;