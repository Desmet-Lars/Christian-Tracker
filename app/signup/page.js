'use client';
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";  // Import useRouter for redirection
import Link from "next/link"
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();  // Initialize the router

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Sign up user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        createdAt: new Date(),
      });


      // Redirect to the homepage (or another page as needed)
      router.push("/");

      alert("Welcome to the Christian communaity! ✝️");
    } catch (err) {
      // Handle errors specifically
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already in use. Please try another.");
      } else if (err.code === 'auth/weak-password') {
        setError("Your password is too weak. Please choose a stronger password.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 relative">
      {/* Background cross image */}
      <div className="absolute inset-0 bg-[url('./bg.jpg')] bg-cover bg-center z-[0]"></div>

      {/* Signup form */}
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md transform hover:scale-105 transition-transform duration-300 ease-in-out text-gray-300">
        <h1 className="text-3xl font-extrabold text-center text-gray-100 mb-6 animate-fadeIn">
          ✝️ Join the Christian Community
        </h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300 animate-slideIn"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300 animate-slideIn"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 animate-bounceOnce"
          >
            Sign Up
          </button>
        </form>
        {error && (
          <p className="mt-4 text-center text-red-500 animate-fadeIn">{error}</p>
        )}
        <p className="mt-6 text-center text-gray-400">
          <Link href="/" className="text-blue-400 hover:underline">
            Already have an account? Login
          </Link>
        </p>
      </div>
    </div>
  );
}
