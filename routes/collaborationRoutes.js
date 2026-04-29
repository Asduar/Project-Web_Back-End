// routes/collaborationRoutes.js
import express from "express";
import {
    addCollaborator,
    getCollaborators,
    updateRole,
    removeCollaborator,
} from "../controllers/collaborationController.js";

const router = express.Router();

// POST
router.post("/", addCollaborator);

// GET
router.get("/:noteId", getCollaborators);

// PUT
router.put("/:id", updateRole);

// DELETE
router.delete("/:id", removeCollaborator);

export default router;