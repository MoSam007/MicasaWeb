import { Request } from 'express';
import { User } from '@clerk/clerk-sdk-node';

export interface AuthenticatedRequest extends Request {
    user?: User;
}

export type UserRole = 'hunter' | 'owner' | 'mover' | 'admin';

export interface UserWithRole {
  id: string;
  email?: string;
  role?: UserRole;
}