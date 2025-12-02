// src/pages/Genre/Genre.jsx
import React, { useEffect, useState } from 'react';
import './Genre.css';
import { useNavigate } from 'react-router-dom';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM'
  }
};

const Genre = () => {
  const [genres, setGenres] = useState([]);
  const [content, setContent] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options),
          fetch('https://api.themoviedb.org/3/genre/tv/list?language=en', options)
        ]);

        const movieData = await movieRes.json();
        const tvData = await tvRes.json();

        const movieGenres = movieData.genres.map(g => ({ ...g, mediaType: 'movie' }));
        const tvGenres = tvData.genres.map(g => ({ ...g, mediaType: 'tv' }));

        setGenres([...movieGenres, ...tvGenres]);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/${genre.mediaType}?with_genres=${genre.id}&language=en-US`,
        options
      );
      const data = await res.json();
      setContent(data.results);
    } catch (err) {
      console.error('Error fetching content:', err);
    }
  };

  const handleCardClick = (item) => {
    if (item.media_type === 'tv' || selectedGenre?.mediaType === 'tv') {
      navigate(`/tv/${item.id}`); // ✅ Navigate to TVDetails
    } else {
      navigate(`/movie/${item.id}`);
    }
  };

  return (
    <div className="genre-page">
      <h2>Select Genre</h2>
      <div className="genre-list">
        {genres.map((genre) => (
          <button
            key={`${genre.mediaType}-${genre.id}`}
            className="genre-button"
            onClick={() => handleGenreClick(genre)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {selectedGenre && (
        <>
          <h3 className="genre-title">{selectedGenre.name} ({selectedGenre.mediaType})</h3>
          <div className="genre-results">
            {content.map((item) => (
              <div
                key={item.id}
                className="genre-card"
                onClick={() => handleCardClick(item)}
              >
                <img
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                      : 'https://via.placeholder.com/200x300?text=No+Image'
                  }
                  alt={item.title || item.name}
                />
                <p>{item.title || item.name}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Genre;
