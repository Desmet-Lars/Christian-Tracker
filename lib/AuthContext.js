// lib/AuthContext.js
'use client';
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./FirebaseConfig"; // Firebase Auth import
import { onAuthStateChanged } from "firebase/auth";

// Create Auth Context
const AuthContext = createContext();

// Provide Auth Context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use Auth Context
export const useAuth = () => useContext(AuthContext);
