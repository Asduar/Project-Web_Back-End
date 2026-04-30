import express from 'express';
import { createTag, getTags, updateTag, deleteTag } from '../controllers/tagController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createTag);
router.get('/', verifyToken, getTags);
router.put('/:id', verifyToken, updateTag);
router.delete('/:id', verifyToken, deleteTag);

export default router;