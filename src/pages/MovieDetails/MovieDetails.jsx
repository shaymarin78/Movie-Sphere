// src/components/MovieDetails/MovieDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { auth, db, updateWatchlist, rateItem, listenToRating } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./MovieDetails.css";

const BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM";

const MovieDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [movie, setMovie] = useState(null);
  const [planToWatch, setPlanToWatch] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // MovieSphere rating states
  const [avgRating, setAvgRating] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  /* -------------------------------------------------
     Fetch Movie Details and User Watchlist
  ------------------------------------------------- */
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${BEARER_TOKEN}`,
            },
          }
        );
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadUserWatchlist = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setUser(currentUser);

      try {
        const userRef = doc(db, "users", currentUser.uid);
        let snap = await getDoc(userRef);

        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            name: currentUser.displayName || "User",
            email: currentUser.email || "",
            profilePic: "",
            planToWatch: [],
            watched: [],
          });
          snap = await getDoc(userRef);
        }

        const data = snap.data();
        setPlanToWatch(data.planToWatch || []);
        setWatched(data.watched || []);
      } catch (err) {
        console.error("Failed to load watchlist:", err);
      }
    };

    const subscribeRating = () => {
      listenToRating(id, "movie", (data) => {
        if (!data) {
          setAvgRating(null);
          setUserRating(0);
        } else {
          setAvgRating(data.average);
          if (auth.currentUser && data.users?.[auth.currentUser.uid]) {
            setUserRating(data.users[auth.currentUser.uid]);
            setSelectedRating(data.users[auth.currentUser.uid]);
          }
        }
      });
    };

    fetchMovieDetails();
    loadUserWatchlist();
    subscribeRating();
  }, [id]);

  /* -------------------------------------------------
     Watchlist Button Handlers
  ------------------------------------------------- */
  const handleAddToPlanToWatch = () => {
    if (!movie) return;

    if (watched.some((item) => item.id === movie.id)) {
      setMessage("This movie is already in Watched.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    const updatedPlan = planToWatch.some((i) => i.id === movie.id)
      ? planToWatch
      : [...planToWatch, movie];

    const updatedWatched = watched.filter((i) => i.id !== movie.id);

    updateWatchlist(user.uid, { planToWatch: updatedPlan, watched: updatedWatched });
    setPlanToWatch(updatedPlan);
    setWatched(updatedWatched);
    setMessage("✅ Added to Plan to Watch");
    setTimeout(() => setMessage(""), 2500);
  };

  const handleMarkAsWatched = () => {
    if (!movie) return;

    const updatedPlan = planToWatch.filter((i) => i.id !== movie.id);
    const updatedWatched = watched.some((i) => i.id === movie.id)
      ? watched
      : [...watched, movie];

    updateWatchlist(user.uid, { planToWatch: updatedPlan, watched: updatedWatched });
    setPlanToWatch(updatedPlan);
    setWatched(updatedWatched);
    setMessage("🎉 Marked as Watched");
    setTimeout(() => setMessage(""), 2500);
  };

  /* -------------------------------------------------
     Handle Rate Button
  ------------------------------------------------- */
  const handleRateButton = async () => {
    if (!user) {
      setMessage("Please login to rate this movie.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    if (selectedRating === 0) {
      setMessage("Select a rating first.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    try {
      await rateItem(user.uid, id, "movie", selectedRating);
      setMessage("⭐ Rating submitted!");
      setUserRating(selectedRating);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("Failed to rate movie:", err);
      setMessage("❌ Failed to submit rating.");
      setTimeout(() => setMessage(""), 2500);
    }
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
              : "https://via.placeholder.com/500x750?text=No+Image"
          }
          alt={movie.title}
        />
      </div>

      <div className="movie-info">
        <h1 className="movie-title">{movie.title}</h1>

        <div className="movie-meta">
          <span>{movie.release_date}</span> •
          <span>{movie.vote_average} ⭐ TMDB</span> •
          <span>
            {avgRating ? `${avgRating} ⭐ MovieSphere` : "No user rating"}
          </span>
        </div>

        <div className="movie-genres">
          {movie.genres?.map((genre) => (
            <span key={genre.id} className="movie-genre">
              {genre.name}
            </span>
          ))}
        </div>

        <div className="movie-overview">
          {movie.overview || "No overview available."}
        </div>

        {/* User Rating Dropdown + Rate Button */}
        <div className="user-rating">
          <p>Your Rating:</p>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(Number(e.target.value))}
            className="rating-dropdown"
          >
            <option value={0}>Select</option>
            {[1, 2, 3, 4, 5].map((val) => (
              <option key={val} value={val}>
                {val} ⭐
              </option>
            ))}
          </select>
          <button
            onClick={handleRateButton}
            className="add-to-watchlist"
            style={{ marginLeft: "10px" }}
          >
            Rate
          </button>
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

        <div style={{ marginTop: 12 }}>
          <Link to={`/reviews/movie/${movie.id}`} className="review-link">
            📖 Read Reviews
          </Link>
          <Link
            to={`/player/${movie.id}`}
            className="player-link"
            style={{ marginLeft: 8 }}
          >
            🎬 Watch Trailer
          </Link>
        </div>

        {message && <div className="action-message">{message}</div>}
      </div>
    </div>
  );
};

export default MovieDetails;
