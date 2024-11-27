'use client';
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, updateEmail, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../../lib/FirebaseConfig";
import { useRouter } from "next/navigation";
import { FiLogOut, FiActivity, FiSettings } from 'react-icons/fi';
import { FaChurch, FaPrayingHands, FaBible } from 'react-icons/fa';
import { MdClose } from "react-icons/md";

import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from "next/link"
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error logging out:", error);
      setLoading(false);
    }
  };

  return { user, loading, logout };
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
      <div className="spinner-border animate-spin border-4 border-t-4 border-white rounded-full w-16 h-16"></div>
      <p className="text-lg ml-4">Loading...</p>
    </div>
  );
}

function NotLoggedIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
      <p className="text-lg">You need to <a href="/" style={{textDecoration:"underline"}}>Login</a> in to access this page.</p>
    </div>
  );
}

function SettingsOverlay({ onClose, user }) {
  const db = getFirestore();
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Fetch username from Firestore (if exists)
    const fetchUserDetails = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setNewUsername(userDoc.data().username || "");
      }
    };

    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  const handleChangeEmail = async () => {
    try {
      await updateEmail(user, newEmail);
      setSuccess("Email updated successfully!");
    } catch (error) {
      setError("Error updating email.");
      console.error(error);
    }
  };

  const handleChangeUsername = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { username: newUsername });
      setSuccess("Username updated successfully!");
    } catch (error) {
      setError("Error updating username.");
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
        onClose(); // Close overlay and go to home after deletion
      } catch (error) {
        setError("Error deleting account.");
        console.error(error);
      }
    }
  };

  const reauthenticate = async (password) => {
    const credential = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      setError("Reauthentication failed.");
      console.error(error);
      return false;
    }
  };

  const handlePasswordChange = async () => {
    const password = prompt("Please enter your current password to continue.");
    if (password) {
      const isReauthenticated = await reauthenticate(password);
      if (isReauthenticated) {
        await handleChangePassword();
      }
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white p-8 w-full sm:w-96 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition duration-300"
        >
          <MdClose className="text-xl" />
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
            className="w-full p-3 bg-gray-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter new username"
          />
          <button
            onClick={handleChangeUsername}
            className="mt-4 w-full p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
          >
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
            onClick={handlePasswordChange}
            className="mt-4 w-full p-3 bg-yellow-600 text-white rounded-lg shadow-lg hover:bg-yellow-700 transition duration-300"
          >
            Save Password
          </button>
        </div>

        {/* Delete Account */}
        <div className="w-full mt-8">
          <button
            onClick={handleDeleteAccount}
            className="w-full p-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition duration-300"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedPage() {
  const { user, loading, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <NotLoggedIn />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[url('./bgHome.png')] bg-cover bg-center z-[0] text-white p-4 relative">
      {/* Logout and Account Settings Buttons close to each other */}
      <div className="absolute top-4 right-4 flex space-x-4">
        {/* Logout Button */}
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-300 transform hover:scale-110 ease-in-out"
        >
          <FiLogOut className="text-lg" />
        </button>

        {/* Account Settings Link */}
        <button
          onClick={toggleSettings}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-110 ease-in-out"
        >
          <FiSettings className="text-lg" />
        </button>
      </div>

      <h1 className="text-5xl font-extrabold mb-8 animate-fadeIn text-center tracking-wide text-white" style={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)' }}>
  Christian Log Tracker
</h1>

      <nav className="space-y-6 w-full max-w-lg sm:w-full">
        <Link 
          href="/sins" 
          className="block bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 ease-in-out text-center flex items-center justify-center space-x-3"
        >
          <FiActivity className="text-xl" />
          <span>Log Sins</span>
        </Link>
        <Link 
          href="/prayers" 
          className="block bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 ease-in-out text-center flex items-center justify-center space-x-3"
        >
          <FaPrayingHands className="text-xl" />
          <span>Log Prayers</span>
        </Link>
        <Link 
          href="/visits" 
          className="block bg-yellow-600 text-white px-6 py-4 rounded-lg hover:bg-yellow-700 transition duration-300 transform hover:scale-105 ease-in-out text-center flex items-center justify-center space-x-3"
        >
          <FaChurch className="text-xl" />
          <span>Log Church Visits</span>
        </Link>
        <Link 
          href="/logs" 
          className="block bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105 ease-in-out text-center flex items-center justify-center space-x-3"
        >
          <FiActivity className="text-xl" />
          <span>View Logs</span>
        </Link>
        <Link 
          href="/bible" 
          className="block bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 ease-in-out text-center flex items-center justify-center space-x-3"
        >
          <FaBible className="text-xl" />
          <span>Read the bible</span>
        </Link>
      </nav>

      {/* Settings Overlay */}
      {settingsOpen && <SettingsOverlay onClose={toggleSettings} user={user} />}
    </div>
  );
}
