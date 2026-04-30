import express from "express";
import noteRoutes from './routes/notesRoutes.js'; //aulia
import folderRoutes from './routes/folderRoutes.js'; //fadil
import collaborationRoutes from "./routes/collaborationRoutes.js"; //kasih
import userRoutes from './routes/userRoutes.js'; //yehezkiel
import db from "./database.js";
import Note from "./models/Note.js";
import User from "./models/User.js";
import tagRoutes from './routes/tagRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import Tag from "./models/Tag.js";
import Activity from "./models/Activity.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { verifyToken } from "./middleware/auth.js";

const app = express();

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);

app.use(express.static(join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/notes', verifyToken, noteRoutes); //aulia
app.use('/api/folders', verifyToken, folderRoutes); //fadil
app.use("/api/collabs", verifyToken, collaborationRoutes); //kasih
app.use('/api/users', userRoutes); //yehezkiel
app.use('/api/tags', tagRoutes); //aulia
app.use('/api/activities', activityRoutes); //aulia

try {
    await db.authenticate();
    console.log("Database MySQL terhubung!");
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

Tag.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Tag, { foreignKey: 'userId' });

Activity.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Activity, { foreignKey: 'userId' });
db.sync({ alter: true })
    .then(() => {
        console.log("Database berhasil disinkronkan!");
        app.listen(3000, () => console.log("Server berjalan di port 3000"));
    })
    .catch((error) => {
        console.error("Gagal sinkronisasi database:", error);
    });