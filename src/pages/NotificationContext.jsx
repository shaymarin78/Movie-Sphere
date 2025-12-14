// src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const now = new Date();
          const notifs = (data.planToWatch || [])
            .filter((item) => !item.viewed)
            .map((item) => {
              const releaseDate = new Date(item.release_date);
              const status = releaseDate > now ? "Upcoming" : "Recently Released";
              return { ...item, status };
            });
          setNotifications(notifs);
        }
      },
      (err) => console.error("Firestore error:", err)
    );

    return () => unsubscribe();
  }, []);

  const markAsViewed = async (movieId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const updatedPlan = notifications.map((item) =>
      item.id === movieId ? { ...item, viewed: true } : item
    );

    try {
      await updateDoc(userRef, { planToWatch: updatedPlan });
    } catch (err) {
      console.error("Error marking notification viewed:", err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsViewed }}>
      {children}
    </NotificationContext.Provider>
  );
};
