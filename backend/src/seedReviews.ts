import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "./models/reviews.models";
import Listing from "./models/listings";
import dummyReviews from "./data/dummyReviews.json";

dotenv.config();

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    console.log("Database connected successfully!");

    // Clear existing reviews
    await Review.deleteMany();
    console.log("Reviews cleared.");

    // Insert dummy reviews and update corresponding listing ratings
    for (const reviewData of dummyReviews) {
      const review = new Review(reviewData);
      await review.save();

      // Update the average rating for the listing
      const reviews = await Review.find({ l_id: reviewData.l_id });
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await Listing.updateOne(
        { l_id: reviewData.l_id },
        { rating: parseFloat(averageRating.toFixed(1)) }
      );
    }

    console.log("Dummy reviews seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
};

seedReviews();
