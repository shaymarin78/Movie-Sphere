import React, { useEffect, useState } from 'react';
import { auth } from '../../firebase';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [watchList, setWatchList] = useState({
    planToWatch: [],
    watched: []
  });
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Bearer token for API requests
  const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM'; // Make sure to use the correct token

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);

      const savedWatchList = JSON.parse(localStorage.getItem(currentUser.uid)) || {
        planToWatch: [],
        watched: []
      };
      setWatchList(savedWatchList);
    }
  }, []);

  // Handle add to Plan to Watch or Watched
  const handleAddToWatchList = (type, media) => {
    if (type === 'planToWatch' && !watchList.watched.some(item => item.id === media.id)) {
      const updatedList = { ...watchList };
      updatedList.planToWatch.push(media); // Add to Plan to Watch
      setWatchList(updatedList);
      localStorage.setItem(user.uid, JSON.stringify(updatedList));
    } else if (type === 'watched' && !watchList.planToWatch.some(item => item.id === media.id)) {
      const updatedList = { ...watchList };
      updatedList.watched.push(media); // Add to Watched
      setWatchList(updatedList);
      localStorage.setItem(user.uid, JSON.stringify(updatedList));
    }
  };

  // Handle fetching details for Movie or TV Show when clicked
  const fetchDetails = async (id, type) => {
    setLoadingDetails(true);

    try {
      const endpoint = type === 'movie' 
        ? `https://api.themoviedb.org/3/movie/${id}?language=en-US`
        : `https://api.themoviedb.org/3/tv/${id}?language=en-US`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${BEARER_TOKEN}`
        }
      });
      const data = await res.json();
      setSelectedItemDetails(data);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!user) return <p>Loading user profile...</p>;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <p><strong>Name:</strong> {user.displayName || "N/A"}</p>
      <p><strong>Email:</strong> {user.email}</p>

      {/* Watchlist - Plan to Watch and Watched */}
      <div className="watchlist-section">
        <h3>Plan to Watch</h3>
        <ul>
          {watchList.planToWatch.length === 0
            ? <li>No movies or shows yet.</li>
            : watchList.planToWatch.map((item, index) => (
              <li key={index}>
                <button onClick={() => fetchDetails(item.id, item.media_type || 'movie')}>{item.title || item.name}</button>
              </li>
            ))}
        </ul>

        <h3>Watched</h3>
        <ul>
          {watchList.watched.length === 0
            ? <li>No movies or shows watched yet.</li>
            : watchList.watched.map((item, index) => (
              <li key={index}>
                <button onClick={() => fetchDetails(item.id, item.media_type || 'movie')}>{item.title || item.name}</button>
              </li>
            ))}
        </ul>
      </div>

      {/* Movie or TV Show Details */}
      {loadingDetails ? (
        <p>Loading details...</p>
      ) : selectedItemDetails ? (
        <div className="media-details">
          <h3>{selectedItemDetails.title || selectedItemDetails.name}</h3>
          <p>{selectedItemDetails.overview}</p>
          <button
            className="add-to-watchlist"
            onClick={() => handleAddToWatchList('planToWatch', selectedItemDetails)}
          >
            Add to Plan to Watch
          </button>
          <button
            className="add-to-watched"
            onClick={() => handleAddToWatchList('watched', selectedItemDetails)}
          >
            Mark as Watched
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default UserProfile;