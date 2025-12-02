// src/pages/Movies/Movies.jsx
import React, { useEffect, useState } from 'react';
import './Movies.css';
import { Link } from 'react-router-dom';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM',
  },
};

const Movies = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('https://api.themoviedb.org/3/trending/movie/day?language=en-US', options)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results);
      })
      .catch((err) => console.error('Failed to load movies:', err));
  }, []);

  return (
    <div className="movies-page">
      <h2>Trending Movies</h2>
      <div className="movies-grid">
        {movies.map((movie) => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                  : 'https://via.placeholder.com/300x450?text=No+Image'
              }
              alt={movie.title}
            />
            <div className="movie-title">{movie.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Movies;
