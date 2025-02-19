import { Request, Response } from 'express';
import { Types } from 'mongoose';
import User from '../models/user';
import { uploadToStorage } from '../utils/storage';
import { createActivityLog } from '../utils/activityLogger';
import { AppError } from '../utils/ErrorHandler';
import { DecodedIdToken } from 'firebase-admin/auth';


interface AuthenticatedRequest extends Request {
    user: DecodedIdToken;
  }


export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, role, uid } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError(400, 'User already exists');
    }

    const user = await User.create({
      email,
      role,
      uid,
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        language: 'en',
        currency: 'KES'
      }
    });

    await createActivityLog(
      Types.ObjectId.createFromHexString(user._id.toString()),
      'ACCOUNT_CREATED',
      'User account created'
    );

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error creating user' });
    }
  }
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await User.findOne({ uid: req.user.uid })
      .select('-__v');
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const updates = req.body;
    
    if (req.file) {
      const imageUrl = await uploadToStorage(req.file);
      updates.profileImage = imageUrl;
    }

    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: updates },
      { new: true }
    );

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await createActivityLog(
      Types.ObjectId.createFromHexString(user._id.toString()),
      'ACCOUNT_CREATED',
      'User account created'
    );
    
    res.json(user);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error updating user' });
    }
  }
};

// Delete user
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOneAndDelete({ uid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

// Update user preferences
export const updateUserPreferences = async (req: AuthenticatedRequest, res: Response)=> {
  try {
    const { preferences } = req.body;
    
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: { preferences } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error });
  }
};

// Get user notifications
export const getUserNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ uid: req.user.uid })
      .select('notifications');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    const user = await User.findOneAndUpdate(
      { 
        uid: req.user.uid,
        'notifications._id': notificationId 
      },
      { 
        $set: { 'notifications.$.read': true } 
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error });
  }
};

// Get user statistics
export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = {
      wishlistCount: user.wishlist.length,
      notificationCount: user.notifications.filter(n => !n.read).length,
      activityCount: user.activity.length,
      // Add more stats as needed
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Check if requester is admin
    const requester = await User.findOne({ uid: req.user.uid });
    if (requester?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error });
  }
};

// Get user wishlist
export const getUserWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ uid: req.user.uid })
      .select('wishlist');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error });
  }
};

// Get recent activity
export const getRecentActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ uid: req.user.uid })
      .select('activity')
      .sort({ 'activity.timestamp': -1 })
      .limit(10);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity', error });
  }
};

// Search users (admin only)
export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query } = req.query;
    
    // Check if requester is admin
    const requester = await User.findOne({ uid: req.user.uid });
    if (requester?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const users = await User.find({
      $or: [
        { email: new RegExp(query as string, 'i') },
        { displayName: new RegExp(query as string, 'i') }
      ]
    }).select('-__v');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error });
  }
};

// Toggle user status (admin only)
export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Check if requester is admin
    const requester = await User.findOne({ uid: req.user.uid });
    if (requester?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling user status', error });
  }
};