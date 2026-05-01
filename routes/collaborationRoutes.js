import express from "express";
import {
    addCollaborator,
    getCollaborators,
    removeCollaborator,
    updateCollab,
} from "../controllers/collaborationController.js";

import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.post("/", addCollaborator);
router.get("/", getCollaborators);
router.delete("/:id", removeCollaborator);
router.put('/:id', verifyToken, updateCollab);

export default router;