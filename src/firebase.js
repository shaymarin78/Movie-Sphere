// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  increment,
  onSnapshot

} from "firebase/firestore";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";

// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyBOcOsWmubtjPsjnbkQmmrSAzFkpqrRu_E",
  authDomain: "movie-sphere-46c9b.firebaseapp.com",
  projectId: "movie-sphere-46c9b",
  storageBucket: "movie-sphere-46c9b.appspot.com",
  messagingSenderId: "823047093662",
  appId: "1:823047093662:web:d61164d3556e2fcc772a8f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ---------------- CREATE USER DOC IF MISSING ----------------
async function createUserDocIfMissing(uid, userData = {}) {
  if (!uid) return;

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid,
      name: userData.name || "User",
      email: userData.email || "",
      profilePic: "",
      planToWatch: [],
      watched: [],
      ...userData
    });
  } else {
    // Ensure all planToWatch items have `viewed` field
    const data = snap.data();
    const updatedPlan = (data.planToWatch || []).map(item => ({
      ...item,
      viewed: item.viewed ?? false
    }));
    if (JSON.stringify(updatedPlan) !== JSON.stringify(data.planToWatch)) {
      await updateDoc(userRef, { planToWatch: updatedPlan });
    }
  }
}

// ---------------- SIGNUP ----------------
const signup = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await updateProfile(user, { displayName: name });
    await createUserDocIfMissing(user.uid, { name, email });

    return user;
  } catch (error) {
    console.error("Signup error:", error);
    toast.error(
      error.code ? error.code.split("/")[1].replaceAll("-", " ") : "Signup failed"
    );
  }
};

// ---------------- LOGIN ----------------
const login = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await createUserDocIfMissing(user.uid, { name: user.displayName, email: user.email });

    return user;
  } catch (error) {
    console.error("Login error:", error);
    toast.error(
      error.code ? error.code.split("/")[1].replaceAll("-", " ") : "Login failed"
    );
  }
};

// ---------------- LOGOUT ----------------
const logout = () => signOut(auth);

// ---------------- UPDATE WATCHLIST ----------------
const updateWatchlist = async (uid, updatedFields) => {
  try {
    await createUserDocIfMissing(uid);
    const userRef = doc(db, "users", uid);

    // Ensure planToWatch items have viewed field
    if (updatedFields.planToWatch) {
      updatedFields.planToWatch = updatedFields.planToWatch.map(item => ({
        ...item,
        viewed: item.viewed ?? false
      }));
    }

    // Mark watched items as viewed
    if (updatedFields.watched) {
      updatedFields.watched = updatedFields.watched.map(item => ({
        ...item,
        viewed: true
      }));
    }

    await updateDoc(userRef, updatedFields);
  } catch (err) {
    console.error("Failed to update watchlist in Firestore:", err);
    throw err;
  }
};

// Upload profile picture
const uploadProfilePicture = async (uid, file) => {
  if (!file) return null;
  try {
    const storageRef = ref(storage, `profilePictures/${uid}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.error("Failed to upload profile picture:", err);
    throw err;
  }
};

// Update user profile
const updateUserProfile = async (uid, updateFields) => {
  try {
    await createUserDocIfMissing(uid);
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, updateFields);
  } catch (err) {
    console.error("Failed to update user profile:", err);
    throw err;
  }
};

// ---------------- MOVIE SPHERE RATINGS ----------------

// Rate a movie (or update rating)
const rateItem = async (uid, itemId, type, rating) => {
  const ratingRef = doc(db, "ratings", `${type}_${itemId}`);
  const snap = await getDoc(ratingRef);

  if (!snap.exists()) {
    // First rating
    await setDoc(ratingRef, {
      itemId,
      type,
      average: rating,
      totalRatings: 1,
      users: {
        [uid]: rating
      }
    });
    return;
  }

  const data = snap.data();
  const users = data.users || {};
  const oldRating = users[uid];

  let newTotal = data.totalRatings;
  let newAverage = data.average;

  if (oldRating) {
    // Update existing rating
    newAverage =
      (data.average * data.totalRatings - oldRating + rating) /
      data.totalRatings;
  } else {
    // New user rating
    newAverage =
      (data.average * data.totalRatings + rating) /
      (data.totalRatings + 1);
    newTotal += 1;
  }

  await updateDoc(ratingRef, {
    average: Number(newAverage.toFixed(2)),
    totalRatings: newTotal,
    [`users.${uid}`]: rating
  });
};

// Listen to rating (real-time)
const listenToRating = (itemId, type, callback) => {
  const ratingRef = doc(db, "ratings", `${type}_${itemId}`);
  return onSnapshot(ratingRef, (snap) => {
    if (snap.exists()) callback(snap.data());
    else callback(null);
  });
};


export {
  auth,
  db,
  storage,
  signup,
  login,
  logout,
  updateWatchlist,
  updateUserProfile,
  uploadProfilePicture,
  createUserDocIfMissing,
  getDoc,
  rateItem,
  listenToRating,
  doc
};
