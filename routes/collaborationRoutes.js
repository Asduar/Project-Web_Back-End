// routes/collaborationRoutes.js
import express from "express";
import {
    addCollaborator,
    getCollaborators,
    removeCollaborator,
} from "../controllers/collaborationController.js";

const router = express.Router();

// POST
router.post("/", addCollaborator);

// GET (Hapus /:noteId menjadi / saja)
router.get("/", getCollaborators);

// DELETE
router.delete("/:id", removeCollaborator);

export default router;