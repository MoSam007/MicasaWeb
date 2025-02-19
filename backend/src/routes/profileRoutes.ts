import express from 'express';
import multer from 'multer';
import {
  updateProfile,
  getActivityLog,
  updatePreferences
} from '../controllers/profileController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put('/update', upload.single('profileImage'), updateProfile);
router.get('/activity', getActivityLog);
router.put('/preferences', updatePreferences);

export default router;