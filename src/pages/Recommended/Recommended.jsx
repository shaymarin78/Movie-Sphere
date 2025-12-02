// src/pages/Recommended/Recommended.jsx
import React, { useEffect, useState } from 'react';
import './Recommended.css';
import { useNavigate } from 'react-router-dom';

const Recommended = () => {
  const [recommended, setRecommended] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          'https://api.themoviedb.org/3/movie/693134/recommendations?language=en-US&page=1',
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM',
            },
          }
        );
        const data = await response.json();
        setRecommended(data.results);
      } catch (err) {
        console.error('Error fetching recommended movies:', err);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="recommended">
      <h2>Recommended for You</h2>
      <div className="movie-list">
        {recommended.map((movie) => (
          <div
            className="movie-card"
            key={movie.id}
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
            />
            <h3>{movie.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommended;
