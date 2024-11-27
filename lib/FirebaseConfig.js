import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // Firestore
import { getStorage } from "firebase/storage";     // Firebase Storage
import { getAuth } from "firebase/auth";           // Firebase Authentication

const firebaseConfig = {
  apiKey: "AIzaSyAYxn3AbXrLTcIQdg90dHnwm26OjBgVRhs",
  authDomain: "christian-33a71.firebaseapp.com",
  projectId: "christian-33a71",
  storageBucket: "christian-33a71.firebasestorage.app",
  messagingSenderId: "752200567864",
  appId: "1:752200567864:web:76bebfc5b38fb453f86acd",
  measurementId: "G-6V47BC9SEF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Initialize Firestore
const storage = getStorage(app); // Initialize Firebase Storage
const auth = getAuth(app);    // Initialize Firebase Authentication

export { app, db, storage, auth };
