// src/pages/UserProfile/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { auth, db, updateUserProfile, updateWatchlist } from "../../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import "./UserProfile.css";
import avatar1 from "../../assets/avatar1.jpg";
import avatar2 from "../../assets/avatar2.jpg";
import avatar3 from "../../assets/avatar3.jpg";
import avatar4 from "../../assets/avatar4.jpg";
import avatar5 from "../../assets/avatar5.jpg";
import avatar6 from "../../assets/avatar6.jpg";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6];

  // Load user data
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) {
        const defaultDoc = {
          uid: currentUser.uid,
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          profilePic: avatars[0],
          planToWatch: [],
          watched: [],
        };
        await setDoc(userRef, defaultDoc);
        setUserData(defaultDoc);
        setNameInput(defaultDoc.name);
        setProfilePreview(defaultDoc.profilePic);
      } else {
        const data = snap.data();
        setUserData(data);
        setNameInput(data.name || "");
        setProfilePreview(data.profilePic || avatars[0]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save profile updates
  const handleSaveProfile = async () => {
    if (!userData) return;
    setLoadingSave(true);

    try {
      const updates = {};
      if (nameInput && nameInput !== userData.name) updates.name = nameInput;
      if (profilePreview && profilePreview !== userData.profilePic) updates.profilePic = profilePreview;

      if (Object.keys(updates).length > 0) {
        await updateUserProfile(userData.uid, updates);
        setActionMsg("Profile updated ✅");
        setTimeout(() => setActionMsg(""), 2500);
      }

      setEditing(false);
    } catch (err) {
      console.error("Save profile failed:", err);
      setActionMsg("Failed to save profile ❌");
      setTimeout(() => setActionMsg(""), 3000);
    } finally {
      setLoadingSave(false);
    }
  };

  // Watchlist actions
  const handleRemoveFromList = async (id) => {
    if (!userData) return;
    try {
      const updated = {
        planToWatch: userData.planToWatch.filter((i) => i.id !== id),
        watched: userData.watched.filter((i) => i.id !== id),
      };
      await updateWatchlist(userData.uid, updated);
    } catch (err) {
      console.error("Remove item error:", err);
    }
  };

  const handleMoveToWatched = async (item) => {
    if (!userData) return;

    const newPlan = userData.planToWatch.filter((i) => i.id !== item.id);
    const newWatched = userData.watched.some((i) => i.id === item.id)
      ? userData.watched
      : [...userData.watched, { ...item, viewed: true }];

    await updateWatchlist(userData.uid, {
      planToWatch: newPlan,
      watched: newWatched,
    });
  };

  const handleMoveToPlan = async (item) => {
    if (!userData) return;

    const newWatched = userData.watched.filter((i) => i.id !== item.id);
    const newPlan = userData.planToWatch.some((i) => i.id === item.id)
      ? userData.planToWatch
      : [...userData.planToWatch, { ...item, viewed: false }];

    await updateWatchlist(userData.uid, {
      planToWatch: newPlan,
      watched: newWatched,
    });
  };

  if (!userData) return <p>Loading profile...</p>;

  const getPosterUrl = (item) =>
    item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "/default-poster.png";
  const getYear = (item) => (item.release_date || item.first_air_date || "").split("-")[0];

  return (
    <div className="user-profile">
      <h2>User Profile</h2>

      <div className="profile-top">
        <div className="profile-picture">
          <img src={profilePreview || avatars[0]} alt="profile" className="profile-img" />
        </div>

        <div className="profile-info">
          {!editing ? (
            <>
              <h3>{userData.name || "No name"}</h3>
              <p>{userData.email}</p>
              <button onClick={() => setEditing(true)}>Edit Profile</button>
            </>
          ) : (
            <>
              <label>
                Name:
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
              </label>

              <label>
                Choose Avatar:
                <div className="avatar-options">
                  {avatars.map((icon, idx) => (
                    <img
                      key={idx}
                      src={icon}
                      alt={`avatar ${idx + 1}`}
                      className={`avatar-choice ${profilePreview === icon ? "selected" : ""}`}
                      onClick={() => setProfilePreview(icon)}
                    />
                  ))}
                </div>
              </label>

              <div style={{ marginTop: 8 }}>
                <button onClick={handleSaveProfile} disabled={loadingSave}>
                  {loadingSave ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setProfilePreview(userData.profilePic || avatars[0]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {actionMsg && <p className="action-msg">{actionMsg}</p>}
        </div>
      </div>

      {/* WATCHLISTS */}
      <div className="watchlist-section">
        <h3>Plan to Watch</h3>
        {userData.planToWatch.length === 0 ? (
          <p>No movies or shows yet.</p>
        ) : (
          <div className="watchlist-grid">
            {userData.planToWatch.map((item) => (
              <div key={item.id} className="watchlist-card">
                {/* Link to Details Page */}
                <Link
                  to={item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`}
                  className="watchlist-poster-link"
                >
                  <img src={getPosterUrl(item)} alt={item.title || item.name} className="watchlist-poster" />
                </Link>

                <div className="watchlist-title">{item.title || item.name}</div>
                <div className="watchlist-year">{getYear(item)}</div>

                <div className="watchlist-actions">
                  <button onClick={() => handleMoveToWatched(item)}>Mark as Watched</button>
                  <button onClick={() => handleRemoveFromList(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3>Watched</h3>
        {userData.watched.length === 0 ? (
          <p>No watched items yet.</p>
        ) : (
          <div className="watchlist-grid">
            {userData.watched.map((item) => (
              <div key={item.id} className="watchlist-card">
                <Link
                  to={item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`}
                  className="watchlist-poster-link"
                >
                  <img src={getPosterUrl(item)} alt={item.title || item.name} className="watchlist-poster" />
                </Link>

                <div className="watchlist-title">{item.title || item.name}</div>
                <div className="watchlist-year">{getYear(item)}</div>

                <div className="watchlist-actions">
                  <button onClick={() => handleMoveToPlan(item)}>Move to Plan</button>
                  <button onClick={() => handleRemoveFromList(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
