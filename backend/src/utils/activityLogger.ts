import { Types } from 'mongoose';
import User from '../models/user';

export type ActivityType = 
  | 'ACCOUNT_CREATED'
  | 'PROFILE_UPDATED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'WISHLIST_UPDATED'
  | 'PREFERENCES_UPDATED'
  | 'NOTIFICATION_READ';

export const createActivityLog = async (
  userId: Types.ObjectId,
  action: ActivityType,
  details: string
) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        activity: {
          action,
          details,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw error;
  }
};