import { Request, Response } from "express";
import Review from "../models/reviews.models";
import Listing from "../models/listings";
import crypto from "crypto";

// Get all reviews
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ message: "Error fetching all reviews", error });
  }
};

// Get reviews for a specific listing
export const getReviews = async (req: Request, res: Response) => {
  const l_id = parseInt(req.params.l_id, 10);

  try {
    const reviews = await Review.find({ l_id }).sort({ createdAt: -1 });
    const totalReviews = reviews.length;

    const averageRating = totalReviews
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.status(200).json({
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};

// Post a new review
export const addReview = async (req: Request, res: Response) => {
  const { l_id } = req.params; // Listing ID from params
  const { userEmail, rating, comment } = req.body; // Extracted from request body

  // Validate required fields
  if (!l_id) {
    return res.status(400).json({ message: "Listing ID is required" });
  }
  if (!userEmail || !rating || !comment) {
    return res.status(400).json({ message: "All fields (userEmail, rating, comment) are required" });
  }

  try {
    // Generate Gravatar URL for userImage
    const emailHash = crypto.createHash("md5").update(userEmail.trim().toLowerCase()).digest("hex");
    const userImage = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;

    // Create and save the review
    const review = new Review({
      l_id: Number(l_id),
      userEmail,
      userImage,
      rating,
      comment,
    });
    await review.save();

    // Fetch all reviews for this listing
    const reviews = await Review.find({ l_id: Number(l_id) });

    // Calculate the average rating
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Update the listing's average rating
    await Listing.updateOne(
      { l_id: Number(l_id) },
      { rating: parseFloat(averageRating.toFixed(1)) }
    );

    // Respond with updated reviews and average rating
    res.status(201).json({
      message: "Review added successfully",
      reviews,
      averageRating,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Error adding review", error });
  }
};

// Delete reviews for a specific listing
export const deleteReviewsByListing = async (l_id: number) => {
  try {
    await Review.deleteMany({ l_id });
    console.log(`Deleted reviews for listing with l_id: ${l_id}`);
  } catch (error) {
    console.error("Error deleting reviews:", error);
  }
};