import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyBOcOsWmubtjPsjnbkQmmrSAzFkpqrRu_E",
  authDomain: "movie-sphere-46c9b.firebaseapp.com",
  projectId: "movie-sphere-46c9b",
  storageBucket: "movie-sphere-46c9b.appspot.com", // ✅ Corrected this to standard Firebase bucket domain
  messagingSenderId: "823047093662",
  appId: "1:823047093662:web:d61164d3556e2fcc772a8f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Updated signup to include displayName
const signup = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Set user's display name in Firebase Auth
    await updateProfile(user, {
      displayName: name
    });

    // Store user info in Firestore
    await addDoc(collection(db, "user"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });

  } catch (error) {
    console.log(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
};

const logout = () => {
  signOut(auth);
};

export { auth, db, login, signup, logout };
