// File: routes/folderRoutes.js
import express from 'express';
import { 
    getAllFolders, 
    createFolder, 
    updateFolder, 
    deleteFolder 
} from '../controllers/folderController.js'; // Import destructuring

const router = express.Router();

// Rute untuk Folder API
router.get('/', getAllFolders);
router.post('/', createFolder);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);

export default router; 