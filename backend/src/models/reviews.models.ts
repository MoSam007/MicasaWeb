import mongoose, { Document } from "mongoose";

const reviewSchema = new mongoose.Schema({
  l_id: {
    type: Number,
    required: true,
    ref: "Listing",
  },
  userEmail: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export interface IReview extends Document {
  l_id: number;
  userEmail: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
