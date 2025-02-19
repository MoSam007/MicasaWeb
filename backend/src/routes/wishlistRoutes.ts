import express from 'express';
import { toggleWishlist, getWishlist, checkWishlistStatus } from '../controllers/wishlistController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/:listingId', authenticateToken, toggleWishlist);
router.get('/', authenticateToken, getWishlist);
router.get('/check/:listingId', authenticateToken, checkWishlistStatus);

export default router;