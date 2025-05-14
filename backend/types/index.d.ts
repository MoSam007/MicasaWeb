// types/index.d.ts
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken; // Note: removed optional (?) as this will be required
}