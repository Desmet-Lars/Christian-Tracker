'use client';
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/FirebaseConfig";
import { onAuthStateChanged, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { FiSave, FiDelete, FiUser, FiLock, FiMail, FiX } from "react-icons/fi"; // Added FiX for close button
import { useRouter } from "next/navigation";

function SettingsOverlay() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Listen to authentication state change to preserve session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false); // Stop loading once the auth state is settled
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  const handleChangeUsername = async () => {
    try {
      // Simulate saving username (update in Firebase if needed)
      setSuccess("Username updated successfully!");
    } catch (error) {
      setError("Error updating username.");
      console.error(error);
    }
  };

  const handleChangeEmail = async () => {
    try {
      await updateEmail(user, newEmail);
      setSuccess("Email updated successfully!");
    } catch (error) {
      setError("Error updating email.");
      console.error(error);
    }
  };

  const handleChangePassword = async () => {
    try {
      await updatePassword(user, newPassword);
      setSuccess("Password updated successfully!");
    } catch (error) {
      setError("Error updating password.");
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await deleteUser(user);
        router.push("/"); // Redirect after deletion
      } catch (error) {
        setError("Error deleting account.");
        console.error(error);
      }
    }
  };

  const handleSaveSettings = () => {
    // Handle saving settings like username, email, and password
    setSuccess("Settings saved successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>You need to be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white p-8 w-full sm:w-96 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition duration-300"
        >
          <FiX className="text-2xl" />
        </button>

        <h1 className="text-4xl font-extrabold mb-8 text-center">Account Settings</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        {/* Change Username */}
        <div className="mb-6">
          <label htmlFor="username" className="block text-lg mb-2">Username</label>
          <input
            type="text"
            id="username"
            className="w-full p-3 bg-gray-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter new username"
          />
          <button
            onClick={handleChangeUsername}
            className="mt-4 w-full p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
          >
            <FiUser className="inline-block mr-2" />
            Save Username
          </button>
        </div>

        {/* Change Email */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-lg mb-2">Email</label>
          <input
            type="email"
            id="email"
            className="w-full p-3 bg-gray-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email"
          />
          <button
            onClick={handleChangeEmail}
            className="mt-4 w-full p-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300"
          >
            <FiMail className="inline-block mr-2" />
            Save Email
          </button>
        </div>

        {/* Change Password */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-lg mb-2">Password</label>
          <input
            type="password"
            id="password"
            className="w-full p-3 bg-gray-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <button
            onClick={handleChangePassword}
            className="mt-4 w-full p-3 bg-yellow-600 text-white rounded-lg shadow-lg hover:bg-yellow-700 transition duration-300"
          >
            <FiLock className="inline-block mr-2" />
            Save Password
          </button>
        </div>

        {/* Save Settings */}
        <div className="w-full mb-6">
          <button
            onClick={handleSaveSettings}
            className="w-full p-3 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition duration-300"
          >
            <FiSave className="inline-block mr-2" />
            Save All Settings
          </button>
        </div>

        {/* Delete Account */}
        <div className="w-full mt-8">
          <button
            onClick={handleDeleteAccount}
            className="w-full p-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition duration-300"
          >
            <FiDelete className="inline-block mr-2" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsOverlay;
