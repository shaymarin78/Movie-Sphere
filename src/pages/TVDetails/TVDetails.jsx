import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth } from '../../firebase'; // 👈 Add this line
import './TVDetails.css';
import { Link } from 'react-router-dom';
import Reviews from '../Reviews/Reviews';
import ReviewDetails from '../ReviewDetails/ReviewDetails';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM'
  }
};

const TVDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [show, setShow] = useState(null);
  const [planToWatch, setPlanToWatch] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTVDetails = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?language=en-US`, options);
        const data = await res.json();
        setShow(data);
      } catch (error) {
        console.error('Failed to load TV show details:', error);
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

    fetchTVDetails();
  }, [id]);

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

  const handleAddToPlanToWatch = () => {
    if (!user || !show) return;

    const updatedWatched = watched.filter(item => item.id !== show.id);
    const updatedPlanToWatch = [...planToWatch, show];

    updateStorage(updatedPlanToWatch, updatedWatched);
    setMessage('✅ Added to Plan to Watch');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleMarkAsWatched = () => {
    if (!user || !show) return;

    const updatedPlanToWatch = planToWatch.filter(item => item.id !== show.id);
    const updatedWatched = [...watched, show];

    updateStorage(updatedPlanToWatch, updatedWatched);
    setMessage('🎉 Marked as Watched');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemoveFromWatched = () => {
    if (!user || !show) return;

    const updatedWatched = watched.filter(item => item.id !== show.id);
    const updatedPlanToWatch = [...planToWatch, show];

    updateStorage(updatedPlanToWatch, updatedWatched);
    setMessage('🔄 Moved back to Plan to Watch');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <p>Loading details...</p>;
  if (!show) return <p>TV show not found.</p>;

  return (
    <div className="tv-details">
      <div className="tv-image">
        <img
          src={
            show.poster_path
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Image'
          }
          alt={show.name}
        />
      </div>

      <div className="tv-info">
        <h1 className="tv-title">{show.name}</h1>
        <div className="tv-meta">
          <span>{show.first_air_date}</span> • <span>{show.vote_average} ⭐</span>
        </div>

        <div className="tv-genres">
          {show.genres.map((genre) => (
            <span key={genre.id} className="tv-genre">{genre.name}</span>
          ))}
        </div>

        <div className="tv-overview">
          {show.overview || 'No overview available.'}
        </div>

        <div className="watchlist-buttons">
          {planToWatch.some(item => item.id === show.id) ? (
            <button className="added-to-watchlist">Already in Plan to Watch</button>
          ) : (
            <button onClick={handleAddToPlanToWatch} className="add-to-watchlist">
              ➕ Add to Plan to Watch
            </button>
          )}

          {watched.some(item => item.id === show.id) ? (
            <button className="added-to-watched">Already Watched</button>
          ) : (
            <button onClick={handleMarkAsWatched} className="add-to-watched">
              ✅ Mark as Watched
            </button>
          )}
        </div>
        <Link to={`/reviews/tv/${show.id}`} className="review-link">
            📖 Read Reviews
        </Link>
            <Link to={`/player/${show.id}`} className="player-link">
            🎬 Watch Trailer
        </Link>

        {message && <div className="action-message">{message}</div>}
      </div>
    </div>
  );
};

export default TVDetails;
