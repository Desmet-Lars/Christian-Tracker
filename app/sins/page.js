'use client';
import { useState, useEffect } from "react";
import { db } from "../../lib/FirebaseConfig"; // Firebase Firestore import
import { collection, addDoc } from "firebase/firestore"; // Firestore functions
import { auth } from "../../lib/FirebaseConfig"; // Firebase Auth import
import { useRouter } from "next/navigation"; // For page navigation
import Link from "next/link";

export default function LogSinsPage() {
  const [sinDescription, setSinDescription] = useState("");
  const [selectedSin, setSelectedSin] = useState(""); // To store selected major sin
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  console.log('user: ',user)

  const majorSins = [
    "Pride",
    "Lust",
    "Greed",
    "Envy",
    "Gluttony",
    "Wrath",
    "Sloth"
  ];

  useEffect(() => {
    const currentUser = auth.currentUser;
    console.log(currentUser)
    if (currentUser) {
      setUser(currentUser);
    } else {
      console.log('To Login')
      router.push('/'); // Redirect to login if not authenticated
    }
    setAuthLoading(false);
  }, [router]);

  const handleLogSin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Ensure user is logged in
      if (!user) {
        console.log("Not logged in")
        setError("You must be logged in to log your sins.");
        return;
      }

      // Create an object to store the sin
      const sinData = {
        userId: user.uid, // Store only the user's UID
        sinDescription: sinDescription || selectedSin,
        createdAt: new Date(),
      };

      // Get a reference to the user's 'sins' subcollection
      const sinsRef = collection(db, "users", user.uid, "sins");

      // Add a new document to the 'sins' subcollection
      await addDoc(sinsRef, sinData);

      setSuccess("Sin logged successfully.");
      setSinDescription(""); // Reset the input field
      setSelectedSin(""); // Reset the selected sin
    } catch (err) {
      setError("There was an error logging your sin.");
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
      <h1 className="text-4xl font-extrabold mb-8 animate-fadeIn text-center">Log Your Sins</h1>

      {/* Sin logging form */}
      <form onSubmit={handleLogSin} className="bg-gray-700 shadow-lg rounded-lg p-8 w-full max-w-md transform hover:scale-105 transition-transform duration-300 ease-in-out text-gray-300">
        {/* Dropdown for major sins */}
        <select
          value={selectedSin}
          onChange={(e) => setSelectedSin(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300 mb-4"
        >
          <option value="">Select a Major Sin</option>
          {majorSins.map((sin, index) => (
            <option key={index} value={sin}>{sin}</option>
          ))}
        </select>

        {/* Custom sin description input */}
        <textarea
          value={sinDescription}
          onChange={(e) => setSinDescription(e.target.value)}
          placeholder="Describe your sin..."
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
          {loading ? "Logging..." : "Log Sin"}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 flex justify-between w-full max-w-md">
        <Link href="/logs" className="text-blue-400 hover:underline">
          View Logged Sins
        </Link>
        <Link href="/home" className="text-blue-400 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
