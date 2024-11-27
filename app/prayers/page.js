'use client';
import { useState, useEffect } from "react";
import { db } from "../../lib/FirebaseConfig"; // Firebase Firestore import
import { collection, addDoc } from "firebase/firestore"; // Firestore functions
import { auth } from "../../lib/FirebaseConfig"; // Firebase Auth import
import { useRouter } from "next/navigation"; // For page navigation
import Link from "next/link";

export default function PrayersPage() {
  const [prayerTitle, setPrayerTitle] = useState("");
  const [prayerDetails, setPrayerDetails] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  console.log('user: ', user);

  // Automatically set the current date
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      router.push('/'); // Redirect to login if not authenticated
    }
    setAuthLoading(false);
  }, [router]);

  const handleLogPrayer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!user) {
        setError("You must be logged in to log your prayers.");
        return;
      }

      const prayerData = {
        userId: user.uid, 
        title: prayerTitle,
        details: prayerDetails,
        date: currentDate, // Automatically use the current date
        createdAt: new Date(),
      };

      const prayersRef = collection(db, "users", user.uid, "prayers");

      await addDoc(prayersRef, prayerData);

      setSuccess("Prayer logged successfully.");
      setPrayerTitle("");
      setPrayerDetails("");
    } catch (err) {
      setError("There was an error logging your prayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4 relative">
      <h1 className="text-4xl font-extrabold mb-8 animate-fadeIn text-center">Log Your Prayer</h1>

      <form onSubmit={handleLogPrayer} className="bg-gray-700 shadow-lg rounded-lg p-8 w-full max-w-md transform hover:scale-105 transition-transform duration-300 ease-in-out text-gray-300">
        {/* Prayer Title */}
        <input
          type="text"
          value={prayerTitle}
          onChange={(e) => setPrayerTitle(e.target.value)}
          placeholder="Prayer Title"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300 mb-4"
        />

        {/* Prayer Details */}
        <textarea
          value={prayerDetails}
          onChange={(e) => setPrayerDetails(e.target.value)}
          placeholder="Describe your prayer..."
          rows="5"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300 mb-4"
        ></textarea>

        {/* Error or success messages */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 ${loading && 'opacity-50 cursor-not-allowed'}`}
        >
          {loading ? "Logging..." : "Log Prayer"}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 flex justify-between w-full max-w-md">
        <Link href="/logs" className="text-blue-400 hover:underline">
          View Logged Prayers
        </Link>
        <Link href="/home" className="text-blue-400 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
