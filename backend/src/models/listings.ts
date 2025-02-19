import mongoose, { Document } from 'mongoose';

const listingSchema = new mongoose.Schema({
  l_id:{
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: String,
    required: true,
  },
  amenities: {
    type: [String],
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  imageUrls: {
    type: [String],
    required: true,
  },
  likes:{
    type: Number,
    required: false,
  }
});

export interface IListing extends Document {
  propertyType: string;
  l_id: number;
  title: string;
  location: string;
  description: string;
  price: string;
  rating: number;
  imageUrls: string[];
  amenities: string[];
  likes: number;
}

const Listing = mongoose.model<IListing>('Listing', listingSchema);

export default Listing;
