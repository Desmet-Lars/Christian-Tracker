'use client';
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/FirebaseConfig";
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { doc, setDoc, getDoc } from "firebase/firestore"; // Firestore methods
import { db } from "../lib/FirebaseConfig"; // Import Firestore

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State to manage loading
  const router = useRouter(); // Initialize the router for redirection

  const handleGoogleSignIn = async () => {
    setLoading(true); // Start loading
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Get the signed-in user

      // Check if the user exists in Firestore
      const userDocRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore
      const userDocSnap = await getDoc(userDocRef);

      // If the user doesn't exist, create the user's document in Firestore
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          createdAt: new Date(),
        });
      }

      // Redirect after successful login
      router.push("/home");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect after successful login
      router.push("/home");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 relative">
      {/* Background cross image */}

      <div className="absolute inset-0 bg-[url('./bg.jpg')] bg-cover bg-center z-[0]"></div>

      {/* Login form */}
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md transform hover:scale-105 transition-transform duration-300 ease-in-out text-gray-300">
        <h1 className="text-3xl font-extrabold text-center text-gray-100 mb-6 animate-fadeIn">
          ✝️ Christian Website Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            disabled={loading} // Disable button when loading
          >
            {loading ? "Logging in..." : "Login"} {/* Show loading text */}
          </button>
        </form>

        {/* Google sign-in button */}
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300"
            disabled={loading} // Disable button when loading
          >
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-red-500 animate-fadeIn">{error}</p>
        )}
        <p className="mt-6 text-center text-gray-400">
          <a href="/signup" className="text-blue-400 hover:underline">
            Don&apos;t have an account? Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
