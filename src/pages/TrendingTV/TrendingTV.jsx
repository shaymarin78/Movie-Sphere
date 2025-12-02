import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './TrendingTV.css';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM'
  }
};

const TrendingTV = () => {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        const res = await fetch('https://api.themoviedb.org/3/trending/tv/day?language=en-US', options);
        const data = await res.json();
        setShows(data.results || []);
      } catch (error) {
        console.error('Failed to fetch trending TV shows:', error);
      }
    };

    fetchTVShows();
  }, []);

  return (
    <div className="tv-container">
      <h2>Trending TV Shows</h2>
      <div className="tv-grid">
        {shows.map((show) => (
          <Link key={show.id} to={`/tv/${show.id}`} className="tv-card">
            <img
              src={
                show.poster_path
                  ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                  : 'https://via.placeholder.com/500x750?text=No+Image'
              }
              alt={show.name}
            />
            <h3>{show.name}</h3>
            <p>{show.first_air_date}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingTV;
