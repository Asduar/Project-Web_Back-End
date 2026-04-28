import express from "express";
import noteRoutes from './routes/notesRoutes.js'; //aulia
import userRoutes from './routes/userRoutes.js'; //yehezkiel
import folderRoutes from './routes/folderRoutes.js'; //fadil
import db from "./database.js";
import Note from "./models/Note.js";
import User from "./models/User.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);

app.use(express.static(join(__dirname, "public")));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/api/notes', noteRoutes); //aulia
app.use('/api/users', userRoutes); //yehezkiel
app.use('/api/folders', folderRoutes); //fadil

try {
    await db.authenticate();
    console.log("Database MySQL terhubung!");
    await db.sync();
} catch (error) {
    console.error("Gagal menghubungkan database:", error);
}

app.get("/", (req, res) => {
  const index = join(__dirname, "public", "index.html");
  res.sendFile(index);
});

app.get('/api/status', (req, res) => {
    res.json({ message: "Server API To-Do List berjalan dengan baik!" });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});