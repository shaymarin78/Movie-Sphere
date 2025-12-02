// src/pages/ReviewDetails/ReviewDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ReviewDetails.css';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM'
  }
};

const ReviewDetails = () => {
  const { type, id, reviewId } = useParams();
  const [review, setReview] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}/reviews?language=en-US&page=1`, options);
        const data = await res.json();
        const foundReview = data.results.find((r) => r.id === reviewId);
        setReview(foundReview || null);
      } catch (err) {
        console.error('Error fetching review details:', err);
      }
    };

    fetchReviews();
  }, [type, id, reviewId]);

  if (!review) return <p>Review not found.</p>;

  return (
    <div className="review-details-page">
      <h2>Review by {review.author}</h2>
      <p>{review.content}</p>
    </div>
  );
};

export default ReviewDetails;
