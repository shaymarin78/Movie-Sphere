import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import "./Reviews.css";

const Reviews = () => {
  const { type, id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState(null);
  const [userReview, setUserReview] = useState(""); // text area value
  const [message, setMessage] = useState("");

  // Fetch TMDB reviews
  useEffect(() => {
    const fetchTMDBReviews = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${type}/${id}/reviews?language=en-US&page=1`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: "Bearer YOUR_BEARER_TOKEN",
            },
          }
        );
        const data = await res.json();
        setReviews(data.results || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTMDBReviews();
  }, [type, id]);

  // Fetch your website reviews from Firebase
  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const docRef = doc(db, "reviews", `${type}_${id}`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.reviews) {
            // prepend user reviews so they appear first
            setReviews((prev) => [...data.reviews, ...prev]);
          }
        }
      } catch (err) {
        console.error("Error fetching user reviews:", err);
      }
    };

    fetchUserReviews();
  }, [type, id]);

  // ---------------- Submit Review ----------------
  const handleSubmitReview = async () => {
    if (!auth.currentUser) {
      setMessage("Please login to submit a review.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    if (!userReview.trim()) return;

    try {
      const docRef = doc(db, "reviews", `${type}_${id}`);
      const snap = await getDoc(docRef);

      const newReview = {
        id: `user_${auth.currentUser.uid}_${Date.now()}`,
        author: auth.currentUser.displayName || "User",
        authorId: auth.currentUser.uid,
        content: userReview.trim(),
      };

      if (!snap.exists()) {
        await setDoc(docRef, { reviews: [newReview] });
      } else {
        await updateDoc(docRef, {
          reviews: [...snap.data().reviews, newReview],
        });
      }

      setReviews((prev) => [newReview, ...prev]); // show at top
      setUserReview("");
      setMessage("Review submitted successfully!");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("Error submitting review:", err);
      setMessage("Failed to submit review.");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  // ---------------- Delete Review ----------------
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const docRef = doc(db, "reviews", `${type}_${id}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const filteredReviews = snap
          .data()
          .reviews.filter((r) => r.id !== reviewId);

        await updateDoc(docRef, { reviews: filteredReviews });
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setMessage("Review deleted successfully!");
        setTimeout(() => setMessage(""), 2500);
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
      setMessage("Failed to delete review.");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="reviews-page">
      <h2>Reviews</h2>

      {/* Add Your Review */}
      {auth.currentUser && (
        <div className="add-review">
          <textarea
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            placeholder="Write your review..."
          />
          <button onClick={handleSubmitReview}>Submit Review</button>
          {message && <div className="action-message">{message}</div>}
        </div>
      )}

      {reviews.length === 0 ? (
        <p>No reviews available.</p>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            className={`review-preview ${
              expandedReview === review.id ? "expanded" : ""
            }`}
            onClick={() =>
              setExpandedReview(
                expandedReview === review.id ? null : review.id
              )
            }
          >
            <h4>✍️ {review.author}</h4>
            <p>
              {expandedReview === review.id
                ? review.content
                : `${review.content.slice(0, 150)}...`}
            </p>

            {/* Delete button for user's own reviews */}
            {auth.currentUser?.uid === review.authorId && (
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation(); // prevent expand toggle
                  handleDeleteReview(review.id);
                }}
              >
                🗑 Delete
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};
export default Reviews;
