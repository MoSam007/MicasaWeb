import { User } from "firebase/auth";
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends Request {
    user?: DecodedIdToken;
}

export type UserRole = 'hunter' | 'owner' | 'mover' | 'admin';

export interface UserWithRole extends User {
  role?: UserRole;
}