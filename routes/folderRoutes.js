import express from 'express';
import { 
    getAllFolders, 
    createFolder, 
    updateFolder, 
    deleteFolder 
} from '../controllers/folderController.js';

const router = express.Router();

router.get('/', getAllFolders);
router.post('/', createFolder);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);

export default router; 