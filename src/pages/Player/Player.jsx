import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import back_arrow_icon from '../../assets/back_arrow_icon.png';
import './Player.css';

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videoKey, setVideoKey] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM'
        }
      };

      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options);
        const data = await res.json();
        const trailer = data.results.find((vid) => vid.type === 'Trailer' || vid.type === 'Teaser');
        if (trailer) setVideoKey(trailer.key);
      } catch (err) {
        console.error('Error fetching video:', err);
      }
    };

    fetchVideo();
  }, [id]);

  return (
    <div className="player">
      <img
        src={back_arrow_icon}
        alt="Back"
        onClick={() => {
          navigate(-1);
        }}
      />
      {videoKey && (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoKey}`}
          title="Trailer"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
};

export default Player;
