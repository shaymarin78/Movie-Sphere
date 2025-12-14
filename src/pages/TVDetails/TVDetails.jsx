import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { auth, db, updateWatchlist } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import "./TVDetails.css";

const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTI0NjY1ZGY4YzI5NWU3YzFlZDg1YjQwMDQ2MTg1YyIsIm5iZiI6MTc0NjA0NTgzMC4xMDYsInN1YiI6IjY4MTI4Yjg2MTE1YjkyYTczMmEwZWJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iuBlFIRD2TRTPWN1BF7MiJopk3IaAe51zo6mX8q52oM";

const TVDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [user, setUser] = useState(null);
  const [planToWatch, setPlanToWatch] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [avgRating, setAvgRating] = useState(null);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const fetchTV = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?language=en-US`,
          {
            method: "GET",
            headers: { accept: "application/json", Authorization: `Bearer ${BEARER_TOKEN}` },
          }
        );
        const data = await res.json();
        setShow(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const loadUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      setUser(currentUser);

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
    };

    const loadRating = async () => {
      try {
        const ratingRef = doc(db, "ratings", `tv_${id}`);
        const snap = await getDoc(ratingRef);
        if (snap.exists()) {
          const data = snap.data();
          setAvgRating((data.total / data.count).toFixed(1));
          if (auth.currentUser && data.users?.[auth.currentUser.uid]) {
            setUserRating(data.users[auth.currentUser.uid]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTV();
    loadUserData();
    loadRating();
  }, [id]);

  const persistWatchlist = async (newPlan, newWatched) => {
    if (!user) {
      setMessage("Please login to save watchlist.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    await updateWatchlist(user.uid, { planToWatch: newPlan, watched: newWatched });
    setPlanToWatch(newPlan);
    setWatched(newWatched);
  };

  const handleAddToPlan = () => {
    if (!show) return;
    if (watched.some((i) => i.id === show.id)) {
      setMessage("This show is already in Watched.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    const updatedPlan = planToWatch.some((i) => i.id === show.id)
      ? planToWatch
      : [...planToWatch, show];
    const updatedWatched = watched.filter((i) => i.id !== show.id);
    persistWatchlist(updatedPlan, updatedWatched);
    setMessage("✅ Added to Plan to Watch");
    setTimeout(() => setMessage(""), 2500);
  };

  const handleMarkWatched = () => {
    if (!show) return;
    const updatedWatched = watched.some((i) => i.id === show.id)
      ? watched
      : [...watched, show];
    const updatedPlan = planToWatch.filter((i) => i.id !== show.id);
    persistWatchlist(updatedPlan, updatedWatched);
    setMessage("🎉 Marked as Watched");
    setTimeout(() => setMessage(""), 2500);
  };

  const handleRateTV = async () => {
    if (!user || !userRating) {
      setMessage("Please login and select a rating.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    try {
      const ratingRef = doc(db, "ratings", `tv_${id}`);
      const snap = await getDoc(ratingRef);

      if (!snap.exists()) {
        await setDoc(ratingRef, { total: userRating, count: 1, users: { [user.uid]: userRating } });
        setAvgRating(userRating.toFixed(1));
        setMessage("✅ Rated Successfully");
        setTimeout(() => setMessage(""), 2500);
        return;
      }

      const data = snap.data();
      const previous = data.users?.[user.uid] || 0;
      await updateDoc(ratingRef, {
        total: data.total - previous + userRating,
        count: previous ? data.count : data.count + 1,
        [`users.${user.uid}`]: userRating,
      });
      setAvgRating(((data.total - previous + userRating) / (previous ? data.count : data.count + 1)).toFixed(1));
      setMessage("✅ Rated Successfully");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!show) return <p>Show not found.</p>;

  const alreadyInPlan = planToWatch.some((i) => i.id === show.id);
  const alreadyWatched = watched.some((i) => i.id === show.id);

  return (
    <div className="tv-details">
      {/* POSTER */}
      <div className="tv-image">
        <img
          src={
            show.poster_path
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : "https://via.placeholder.com/500x750?text=No+Image"
          }
          alt={show.name}
          className="tv-poster"
        />
      </div>

      {/* INFO */}
      <div className="tv-info">
        <h1 className="tv-title">{show.name}</h1>
        <div className="tv-meta">
          <span>{show.first_air_date || "Unknown date"}</span> •{" "}
          <span>{show.vote_average} ⭐ TMDB</span> •{" "}
          <span>{avgRating ? `${avgRating} ⭐ MovieSphere` : "No user rating"}</span>
        </div>

        <div className="tv-genres">
          {show.genres?.map((g) => (
            <span key={g.id} className="tv-genre">
              {g.name}
            </span>
          ))}
        </div>

        <p className="tv-overview">{show.overview}</p>

        <div className="user-rating">
          <select
            value={userRating}
            onChange={(e) => setUserRating(Number(e.target.value))}
            className="rating-dropdown"
          >
            <option value={0}>Select</option>
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v} ⭐
              </option>
            ))}
          </select>
          <button onClick={handleRateTV} className="rate-button">
            ⭐ Rate
          </button>
        </div>

        <div className="watchlist-buttons">
          {!alreadyInPlan ? (
            <button onClick={handleAddToPlan} className="add-to-watchlist">
              ➕ Add to Plan to Watch
            </button>
          ) : (
            <button className="added-to-watchlist">Already in Plan</button>
          )}

          {!alreadyWatched ? (
            <button onClick={handleMarkWatched} className="add-to-watched">
              ✅ Mark as Watched
            </button>
          ) : (
            <button className="added-to-watched">Already Watched</button>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <Link to={`/reviews/tv/${show.id}`} className="review-link">
            📖 Read Reviews
          </Link>
          <Link to={`/player/${show.id}`} className="player-link">
            🎬 Watch Trailer
          </Link>
        </div>

        {message && <div className="action-message">{message}</div>}
      </div>
    </div>
  );
};

export default TVDetails;
