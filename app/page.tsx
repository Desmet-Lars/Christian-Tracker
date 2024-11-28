'use client';
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
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
    console.log("Google sign in clicked");
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      // First try popup
      try {
        const result = await signInWithPopup(auth, provider);
        console.log("Popup sign in successful:", result);
        router.push("/home");
        return;
      } catch (popupError: any) {
        console.log("Popup failed, trying redirect...", popupError);

        // If popup fails, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message.includes('Cross-Origin-Opener-Policy')) {
          console.log("Switching to redirect method");
          await signInWithRedirect(auth, provider);
          return;
        }

        // If it's another type of error, throw it
        throw popupError;
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.code === 'auth/cancelled-popup-request') {
        setError("Please try again");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
      {/* Modernized background with subtle gradient overlay */}
      <div className="absolute inset-0 bg-[url('./bg.jpg')] bg-cover bg-center opacity-30 z-[0]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/50 z-[1]"></div>

      {/* Login form - updated styling */}
      <div className="relative z-[2] bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 w-full max-w-md transform hover:scale-[1.02] transition-all duration-300 ease-out text-gray-100 border border-gray-800/50">
        <h1 className="text-3xl font-extrabold text-center text-gray-100 mb-8 animate-fadeIn">
          ✝️ Christian Website
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-gray-100 transition-all duration-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-gray-100 transition-all duration-300"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:hover:translate-y-0"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900/80 text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* Updated Google sign-in button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:translate-y-[-2px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-500 animate-fadeIn">
            {error}
          </div>
        )}

        <p className="mt-8 text-center text-gray-400">
          <a href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300">
            Don&apos;t have an account? Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
