const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Agar bisa menerima format JSON
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis (HTML, CSS, JS front-end) dari folder public
app.use(express.static('public'));

// Contoh rute dasar untuk testing API
app.get('/api/status', (req, res) => {
    res.json({ message: "Server API To-Do List berjalan dengan baik!" });
});

// Nanti teman-teman Anda akan mengimpor rute mereka di sini
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});