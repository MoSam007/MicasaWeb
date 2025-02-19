import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from './config/serviceAccount.json';

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount)
    });
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
}

export const firebaseAdmin = admin.auth();

// Optional: Add some helper functions
export const verifyToken = async (token: string) => {
    try {
        const decodedToken = await firebaseAdmin.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying token:', error);
        throw error;
    }
};

export const getUserByEmail = async (email: string) => {
    try {
        const userRecord = await firebaseAdmin.getUserByEmail(email);
        return userRecord;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};
// In firebaseAdmin.ts
export const createUser = async (userData: {
  email: string;
  password: string;
  displayName?: string;
}) => {
  try {
      const userRecord = await firebaseAdmin.createUser(userData);
      return userRecord;
  } catch (error) {
      console.error('Error creating user:', error);
      throw error;
  }
};

export const deleteUser = async (uid: string) => {
  try {
      await firebaseAdmin.deleteUser(uid);
      return true;
  } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
  }
};

export const updateUser = async (
  uid: string,
  updateData: {
      email?: string;
      displayName?: string;
      disabled?: boolean;
  }
) => {
  try {
      const userRecord = await firebaseAdmin.updateUser(uid, updateData);
      return userRecord;
  } catch (error) {
      console.error('Error updating user:', error);
      throw error;
  }
};
