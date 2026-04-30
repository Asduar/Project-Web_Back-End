import express from "express";
import {
    addCollaborator,
    getCollaborators,
    removeCollaborator,
} from "../controllers/collaborationController.js";

const router = express.Router();

router.post("/", addCollaborator);

router.get("/", getCollaborators);

router.delete("/:id", removeCollaborator);

export default router;