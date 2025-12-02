// src/pages/Reviews/Reviews.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Reviews.css';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM'
  }
};

const Reviews = () => {
  const { type, id } = useParams(); // type = 'movie' or 'tv'
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}/reviews?language=en-US&page=1`, options);
        const data = await res.json();
        setReviews(data.results || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [type, id]);

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="reviews-page">
      <h2>Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews available.</p>
      ) : (
        reviews.map((review) => (
          <Link
            key={review.id}
            to={`/reviewdetails/${type}/${id}/${review.id}`}
            className="review-preview"
          >
            <h4>✍️ {review.author}</h4>
            <p>{review.content.slice(0, 150)}...</p>
          </Link>
        ))
      )}
    </div>
  );
};

export default Reviews;
