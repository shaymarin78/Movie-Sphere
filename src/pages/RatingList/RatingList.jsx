import React, { useEffect, useState } from 'react';
import './RatingList.css';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM'
  }
};

const RatingList = () => {
  const [movies, setMovies] = useState([]);
  const [sortedMovies, setSortedMovies] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Make multiple API calls concurrently
        const [topRatedRes, popularRes] = await Promise.all([
            fetch('https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1', options),
            fetch('https://api.themoviedb.org/3/movie/popular?language=en-US', options),
          ]);

        // Convert responses to JSON
        const topRatedData = await topRatedRes.json();
        const popularData = await popularRes.json();
        // Combine all movie lists into one array
        const allMovies = [
          ...topRatedData.results,
          ...popularData.results,
        ];

        // Update state with combined movie data
        setMovies(allMovies);
        setSortedMovies(allMovies);
      } catch (err) {
        console.error('Error fetching movies:', err);
      }
    };

    fetchMovies();
  }, []);

  // Sort movies based on rating
  const handleRatingFilter = (rating) => {
    setSelectedRating(rating);
    const filteredMovies = movies.filter((movie) => movie.vote_average >= rating);
    setSortedMovies(filteredMovies);
  };

  // Sort movies by rating (Descending)
  const sortByRating = () => {
    const sorted = [...movies].sort((a, b) => b.vote_average - a.vote_average);
    setSortedMovies(sorted);
  };

  useEffect(() => {
    sortByRating();
  }, [movies]);

  return (
    <div className="rating-list">
      <h2>Movies Sorted by Rating</h2>

      {/* Rating Filter */}
      <div className="rating-filter">
        <button onClick={() => handleRatingFilter(9)} className={selectedRating === 9 ? 'active' : ''}>
          9+
        </button>
        <button onClick={() => handleRatingFilter(8)} className={selectedRating === 8 ? 'active' : ''}>
          8+
        </button>
        <button onClick={() => handleRatingFilter(7)} className={selectedRating === 7 ? 'active' : ''}>
          7+
        </button>
        <button onClick={() => handleRatingFilter(6)} className={selectedRating === 6 ? 'active' : ''}>
          6+
        </button>
        <button onClick={() => handleRatingFilter(5)} className={selectedRating === 5 ? 'active' : ''}>
          5+
        </button>
        <button onClick={() => setSortedMovies(movies)} className={selectedRating === null ? 'active' : ''}>
          All
        </button>
      </div>

      {/* Movie List */}
      <div className="movie-list">
        {sortedMovies.length === 0 ? (
          <p>No movies found for this rating.</p>
        ) : (
          sortedMovies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'https://via.placeholder.com/200x300'}
                alt={movie.title}
              />
              <div className="movie-info">
                <h4>{movie.title}</h4>
                <p>Rating: {movie.vote_average}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingList;
