import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth } from '../../firebase'; // 👈 Import Firebase auth
import './MovieDetails.css';
import Reviews from '../Reviews/Reviews';
import ReviewDetails from '../ReviewDetails/ReviewDetails';
import { Link } from 'react-router-dom';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM'
  }
};

const MovieDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [movie, setMovie] = useState(null);
  const [planToWatch, setPlanToWatch] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch movie and watchlist data
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options);
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      const saved = JSON.parse(localStorage.getItem(currentUser.uid)) || {
        planToWatch: [],
        watched: []
      };
      setPlanToWatch(saved.planToWatch);
      setWatched(saved.watched);
    }

    fetchMovieDetails();
  }, [id]);

  // Save updated watchlist to localStorage
  const updateStorage = (newPlanToWatch, newWatched) => {
    if (!user) return;
    const updated = {
      planToWatch: newPlanToWatch,
      watched: newWatched
    };
    localStorage.setItem(user.uid, JSON.stringify(updated));
    setPlanToWatch(newPlanToWatch);
    setWatched(newWatched);
  };

  // Add to Plan to Watch
  const handleAddToPlanToWatch = () => {
    if (!user || !movie) return;

    const updatedWatched = watched.filter((item) => item.id !== movie.id);
    const updatedPlanToWatch = [...planToWatch, movie];

    updateStorage(updatedPlanToWatch, updatedWatched);
    setMessage('✅ Added to Plan to Watch');
    setTimeout(() => setMessage(''), 3000);
  };

  // Mark as Watched
  const handleMarkAsWatched = () => {
    if (!user || !movie) return;

    const updatedPlanToWatch = planToWatch.filter((item) => item.id !== movie.id);
    const updatedWatched = [...watched, movie];

    updateStorage(updatedPlanToWatch, updatedWatched);
    setMessage('🎉 Marked as Watched');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <p>Loading details...</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div className="movie-details">
      <div className="movie-image">
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Image'
          }
          alt={movie.title}
        />
      </div>

      <div className="movie-info">
        <h1 className="movie-title">{movie.title}</h1>
        <div className="movie-meta">
          <span>{movie.release_date}</span> • <span>{movie.vote_average} ⭐</span>
        </div>

        <div className="movie-genres">
          {movie.genres.map((genre) => (
            <span key={genre.id} className="movie-genre">
              {genre.name}
            </span>
          ))}
        </div>

        <div className="movie-overview">
          {movie.overview || 'No overview available.'}
        </div>

        <div className="watchlist-buttons">
          {planToWatch.some((item) => item.id === movie.id) ? (
            <button className="added-to-watchlist">Already in Plan to Watch</button>
          ) : (
            <button onClick={handleAddToPlanToWatch} className="add-to-watchlist">
              ➕ Add to Plan to Watch
            </button>
          )}

          {watched.some((item) => item.id === movie.id) ? (
            <button className="added-to-watched">Already Watched</button>
          ) : (
            <button onClick={handleMarkAsWatched} className="add-to-watched">
              ✅ Mark as Watched
            </button>
          )}
        </div>
        <Link to={`/reviews/movie/${movie.id}`} className="review-link">
          📖 Read Reviews
        </Link>
        <Link to={`/player/${movie.id}`} className="player-link">
          🎬 Watch Trailer
        </Link>

        {message && <div className="action-message">{message}</div>}
      </div>
    </div>
  );
};

export default MovieDetails;
