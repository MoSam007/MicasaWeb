// userRoutes.ts
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserPreferences,
  getUserNotifications,
  markNotificationAsRead,
  getUserStats,
  updateUserRole,
  getUserWishlist,
  getRecentActivity,
  searchUsers,
  toggleUserStatus
} from '../controllers/userController';
import { AuthenticatedRequest } from '../../types';
import { upload } from '../middleware/multer';

const router = express.Router();

// Remove the duplicate multer configuration
// since we're importing it from middleware/multer

// Public routes
router.post('/register', createUser);

// Protected routes (require authentication)
router.use(authenticateToken);

// Profile routes
router.get('/profile', (req, res) => getUserProfile(req as AuthenticatedRequest, res));
router.put(
  '/profile',
  upload.single('profileImage'),
  (req, res) => updateUser(req as AuthenticatedRequest, res)
);
router.delete('/profile', (req, res) => deleteUser(req as AuthenticatedRequest, res));

// Preferences routes
router.put('/preferences', (req, res) => updateUserPreferences(req as AuthenticatedRequest, res));

// Notifications routes
router.get('/notifications', (req, res) => getUserNotifications(req as AuthenticatedRequest, res));
router.put('/notifications/:notificationId/read', (req, res) => markNotificationAsRead(req as AuthenticatedRequest, res));

// Statistics routes
router.get('/stats', (req, res) => getUserStats(req as AuthenticatedRequest, res));

// Role management (admin only)
router.put('/role/:userId', (req, res) => updateUserRole(req as AuthenticatedRequest, res));

// Wishlist routes
router.get('/wishlist', (req, res) => getUserWishlist(req as AuthenticatedRequest, res));

// Activity routes
router.get('/activity', (req, res) => getRecentActivity(req as AuthenticatedRequest, res));

// Search routes (admin only)
router.get('/search', (req, res) => searchUsers(req as AuthenticatedRequest, res));

// User status routes (admin only)
router.put('/status/:userId', (req, res) => toggleUserStatus(req as AuthenticatedRequest, res));

export default router;