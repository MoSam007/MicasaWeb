import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../firebaseAdmin';

// Rename authenticateFirebase to authenticateToken for consistency
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decodedToken = await firebaseAdmin.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};