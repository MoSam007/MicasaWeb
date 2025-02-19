import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId; 
  uid: string;
  email: string;
  displayName?: string;
  role: 'hunter' | 'owner' | 'mover' | 'admin';
  profileImage?: string;
  phoneNumber?: string;
  wishlist: number[];
  notifications: {
    message: string;
    type: string;
    read: boolean;
    createdAt: Date;
  }[];
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    language: string;
    currency: string;
  };
  activity: {
    action: string;
    details: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: String,
  role: {
    type: String,
    enum: ['hunter', 'owner', 'mover', 'admin'],
    required: true
  },
  profileImage: String,
  phoneNumber: String,
  wishlist: [Number],
  notifications: [{
    message: String,
    type: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' }
  },
  activity: [{
    action: String,
    details: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', userSchema);