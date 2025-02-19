import express from "express";
import { getAllReviews, getReviews, addReview } from "../controllers/reviews.controllers";

const router = express.Router();

router.get("/", getAllReviews); // Fetch all reviews
router.get("/:l_id", getReviews); // Fetch reviews for a specific listing
router.post("/:l_id", addReview); // Add a new review

export default router;
