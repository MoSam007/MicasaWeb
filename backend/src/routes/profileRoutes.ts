import express from 'express';
import multer from 'multer';
import {
  updateProfile,
  getActivityLog,
  updatePreferences
} from '../controllers/profileController';
import { AuthenticatedRequest } from '../../types';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put('/update', upload.single('profileImage'), (req, res, next) => {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  updateProfile(req as AuthenticatedRequest, res).catch(next);
});
router.get('/activity', getActivityLog);
router.put('/preferences', updatePreferences);

export default router;