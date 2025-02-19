import { Request, Response } from 'express';
import User from '../models/user';
import Listing from '../models/listings'; 
import { JwtPayload } from 'jsonwebtoken';

export const toggleWishlist = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user === 'string') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = (req.user as JwtPayload)._id;
    const listingId = parseInt(req.params.listingId, 10);

    // Find user and listing
    const [user, listing] = await Promise.all([
      User.findById(userId),
      Listing.findOne({ l_id: listingId })
    ]);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // Toggle wishlist
    const isInWishlist = user.wishlist.includes(listingId);
    
    if (isInWishlist) {
      user.wishlist = user.wishlist.filter(id => id !== listingId);
      listing.likes = Math.max(0, listing.likes - 1);
    } else {
      user.wishlist.push(listingId);
      listing.likes = (listing.likes || 0) + 1;
    }

    // Save both documents
    await Promise.all([user.save(), listing.save()]);

    res.json({
      wishlist: user.wishlist,
      likes: listing.likes,
      isInWishlist: !isInWishlist
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkWishlistStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user === 'string') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = (req.user as JwtPayload)._id;
    const listingId = parseInt(req.params.listingId, 10);

    const [user, listing] = await Promise.all([
      User.findById(userId),
      Listing.findOne({ l_id: listingId })
    ]);

    if (!user || !listing) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({
      isInWishlist: user.wishlist.includes(listingId),
      likes: listing.likes || 0
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getWishlist = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user === 'string') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = (req.user as JwtPayload)._id;
    const user = await User.findById(userId).populate('wishlist');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};