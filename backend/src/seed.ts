import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/listings';
import listings from './data/listing.json';

dotenv.config({ path: './.env' });

const seedData = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected');

    // Clear existing listings
    await Listing.deleteMany();
    console.log('Old listings removed');

    // Insert new listings
    await Listing.insertMany(listings);
    console.log('Listings added');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Seed the data
seedData();
