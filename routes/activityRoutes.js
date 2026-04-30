import express from 'express';
import { createActivity, getActivities, deleteActivity } from '../controllers/activityController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createActivity);
router.get('/', verifyToken, getActivities);
router.delete('/:id', verifyToken, deleteActivity);

export default router;