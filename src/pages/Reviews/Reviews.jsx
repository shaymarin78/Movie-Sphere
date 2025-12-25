import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import "./Reviews.css";

const Reviews = () => {
  const { type, id } = useParams();

  const [tmdbReviews, setTmdbReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);

  const [expandedReview, setExpandedReview] = useState(null);
  const [userReview, setUserReview] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH TMDB REVIEWS ----------------
  useEffect(() => {
    const fetchTMDBReviews = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${type}/${id}/reviews?language=en-US&page=1`,
          {
            headers: {
              accept: "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM",
            },
          }
        );
        const data = await res.json();
        setTmdbReviews(data.results || []);
      } catch (err) {
        console.error("TMDB review error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTMDBReviews();
  }, [type, id]);

  // ---------------- FETCH USER REVIEWS ----------------
  const loadUserReviews = async () => {
    const ref = doc(db, "reviews", `${type}_${id}`);
    const snap = await getDoc(ref);
    setUserReviews(snap.exists() ? snap.data().reviews || [] : []);
  };

  useEffect(() => {
    loadUserReviews();
  }, [type, id]);

  // ---------------- SUBMIT REVIEW ----------------
  const handleSubmitReview = async () => {
    if (!auth.currentUser || !userReview.trim()) return;

    const ref = doc(db, "reviews", `${type}_${id}`);
    const snap = await getDoc(ref);

    const newReview = {
      id: `user_${auth.currentUser.uid}_${Date.now()}`,
      author: auth.currentUser.displayName || "User",
      authorId: auth.currentUser.uid,
      content: userReview.trim(),
    };

    if (!snap.exists()) {
      await setDoc(ref, { reviews: [newReview] });
    } else {
      await updateDoc(ref, {
        reviews: [...snap.data().reviews, newReview],
      });
    }

    await loadUserReviews();
    setUserReview("");
    setMessage("Review added!");
    setTimeout(() => setMessage(""), 2000);
  };

  // ---------------- DELETE REVIEW ----------------
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    const ref = doc(db, "reviews", `${type}_${id}`);
    const snap = await getDoc(ref);

    const updated = snap
      .data()
      .reviews.filter((r) => r.id !== reviewId);

    await updateDoc(ref, { reviews: updated });
    setUserReviews(updated);
  };

  // ---------------- EDIT REVIEW ----------------
  const handleEditSave = async (reviewId) => {
    const ref = doc(db, "reviews", `${type}_${id}`);
    const snap = await getDoc(ref);

    const updated = snap.data().reviews.map((r) =>
      r.id === reviewId ? { ...r, content: editingText } : r
    );

    await updateDoc(ref, { reviews: updated });

    setUserReviews(updated);
    setEditingId(null);
    setEditingText("");
  };

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="reviews-page">
      <h2>Reviews</h2>

      {/* ADD REVIEW */}
      {auth.currentUser && (
        <div className="add-review">
          <textarea
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            placeholder="Write your review..."
          />
          <button onClick={handleSubmitReview}>Submit</button>
          {message && <p className="action-message">{message}</p>}
        </div>
      )}

      {[...userReviews, ...tmdbReviews].map((review) => (
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

          {/* EDIT MODE */}
          {editingId === review.id ? (
            <>
              <textarea
                value={editingText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setEditingText(e.target.value)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSave(review.id);
                }}
              >
                Save
              </button>
            </>
          ) : (
            <p>
              {expandedReview === review.id
                ? review.content
                : `${review.content.slice(0, 150)}...`}
            </p>
          )}

          {/* USER ACTIONS */}
          {auth.currentUser?.uid === review.authorId && (
            <div className="review-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(review.id);
                  setEditingText(review.content);
                }}
              >
                ✏️ Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(review.id);
                }}
              >
                🗑 Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Reviews;
