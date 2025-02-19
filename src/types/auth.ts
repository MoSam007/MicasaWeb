import { User } from "firebase/auth";

export type UserRole = 'hunter' | 'owner' | 'mover' | 'admin';

export interface UserWithRole extends User {
  role?: UserRole;
}