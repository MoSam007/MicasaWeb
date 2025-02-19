import { Request, Response } from 'express';
import User from '../models/user';
import { uploadToStorage } from '../utils/storage';
import { AppError } from '../utils/ErrorHandler';
import { DecodedIdToken } from 'firebase-admin/auth';


interface AuthenticatedRequest extends Request {
    user: DecodedIdToken;
  }

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const userId = req.user.uid;
    const updates = req.body;
    
    if (req.file) {
      const imageUrl = await uploadToStorage(req.file);
      updates.profileImage = imageUrl;
    }

    const user = await User.findOneAndUpdate(
      { uid: userId },
      { $set: updates },
      { new: true }
    );

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error updating profile' });
    }
  }
};

export const getActivityLog = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.uid;
    const user = await User.findOne({ uid: userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity log' });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.uid;
    const { preferences } = req.body;

    const user = await User.findOneAndUpdate(
      { uid: userId },
      { $set: { preferences } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences' });
  }
};