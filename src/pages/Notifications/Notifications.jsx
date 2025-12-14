// src/pages/Notifications/Notifications.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [fullPlan, setFullPlan] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);

      unsubscribeFirestore = onSnapshot(userRef, async (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();
        const plan = data.planToWatch || [];
        const now = new Date();

        setFullPlan(plan);

        const unviewed = [];

        for (const item of plan) {
          if (item.viewed) continue;

          const releaseDate = item.release_date
            ? new Date(item.release_date)
            : now;

          const status =
            releaseDate > now ? "Upcoming" : "Recently Released";

          const type = item.title ? "movie" : "tv";

          unviewed.push({ ...item, status, type });

          // 🔔 SHOW TOAST ONLY ONCE PER ITEM
          if (!item.notified) {
            toast.info(
              `🎬 ${item.title || item.name} added to Watchlist`,
              { autoClose: 3000 }
            );

            // Mark as notified in Firestore
            const updatedPlan = plan.map((p) =>
              p.id === item.id ? { ...p, notified: true } : p
            );

            await updateDoc(userRef, { planToWatch: updatedPlan });
          }
        }

        setNotifications(unviewed);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // Mark notification as viewed
  const handleViewNotification = async (item) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    const updatedPlan = fullPlan.map((m) =>
      m.id === item.id ? { ...m, viewed: true } : m
    );

    await updateDoc(userRef, { planToWatch: updatedPlan });
  };

  return (
    <div className="notification-wrapper">
      <div className="notification-icon" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {notifications.length > 0 && (
          <span className="notification-badge">
            {notifications.length}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="notification-panel">
          <h3>Watchlist Notifications</h3>

          {notifications.length === 0 ? (
            <p className="empty-msg">No notifications</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className="notification-item"
                  onClick={() => handleViewNotification(item)}
                >
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                        : "/default-poster.png"
                    }
                    className="notif-poster"
                    alt={item.title || item.name}
                  />

                  <div className="notif-info">
                    <div className="notif-header">
                      <h4>{item.title || item.name}</h4>
                      <span className={`type-badge ${item.type}`}>
                        {item.type === "movie" ? "Movie" : "TV"}
                      </span>
                    </div>

                    <p>Release: {item.release_date || "Unknown"}</p>
                    <p>Status: {item.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
