import React, { useState, useEffect } from "react";
import axios from "axios";

interface Review {
  email: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string; // URL for user's avatar
}

interface NewReview {
  email: string;
  rating: number;
  comment: string;
}

interface ReviewsSectionProps {
  l_id: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ l_id }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<NewReview>({
    email: "",
    rating: 0,
    comment: "",
  });
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ reviews: Review[]; averageRating: number }>(
          `http://localhost:5000/api/reviews/${l_id}`
        );
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [l_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newReview.email && newReview.rating > 0 && newReview.comment) {
      try {
        setLoading(true);

        // Prepare review data (userImage is handled by the backend)
        const reviewData = {
          userEmail: newReview.email,
          rating: newReview.rating,
          comment: newReview.comment,
        };

        // Send the POST request to the backend
        const response = await axios.post(
          `http://localhost:5000/api/reviews/${l_id}`,
          reviewData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        // Update reviews and reset the form
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
        setNewReview({ email: "", rating: 0, comment: "" });
      } catch (error: any) {
        console.error("Error submitting review:", error?.response?.data || error.message);
        alert(
          error?.response?.data?.message || "Failed to submit the review. Please try again."
        );
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please fill out all fields and provide a valid rating.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const extractNameFromEmail = (email: string | undefined): string => {
    if (!email) return "Anonymous"; // Provide a fallback name if the email is undefined
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1); // Capitalize the first letter
  };


  if (!reviews || reviews.length === 0) return <div>No reviews available.</div>;

  return (
    <div className="reviews-section">
      <h2>Reviews</h2>
      <p>
        Rating: {averageRating.toFixed(1)} ⭐ | Total Reviews: {reviews.length}
      </p>

      {loading && <div className="loading">Loading...</div>}
      <div className="reviews-list">
        {reviews.map((review, index) => (
          <div key={index} className="review-card">
            <img
              src={review.avatar || "/default-avatar.jpeg"} // Provide a default avatar if none is present
              alt="User Avatar"
              className="review-avatar"
            />
            
            <div className="review-header">
              <span className="review-name">{extractNameFromEmail(review.email)}</span>
              <span className="review-date">
                {review.date ? new Date(review.date).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="review-rating">{"⭐".repeat(review.rating)}</div>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))}
      </div>

      <div className="add-review-form">
        <h3>Add a Review</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={newReview.email}
            onChange={(e) => handleInputChange(e)}
            required
          />
          <div className="rating-input">
            <label>Rating:</label>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${newReview.rating >= star ? "selected" : ""}`}
                onClick={() => handleRatingChange(star)}
              >
                ⭐
              </span>
            ))}
          </div>
          <textarea
            name="comment"
            placeholder="Write your review"
            value={newReview.comment}
            onChange={(e) => handleInputChange(e)}
            required
          ></textarea>
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewsSection;