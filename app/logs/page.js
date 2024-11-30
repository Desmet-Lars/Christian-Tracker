'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../lib/FirebaseConfig";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import Link from "next/link";

export default function LogsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sinCounts, setSinCounts] = useState({});
  const [prayerCounts, setPrayerCounts] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/"); // Redirect to login if not authenticated
      } else {
        fetchSinsAndPrayers(user.uid);
      }
    }
  }, [authLoading, user, router, fetchSinsAndPrayers]);

  const fetchSinsAndPrayers = async (userId) => {
    try {
      const [sinsSnapshot, prayersSnapshot] = await Promise.all([
        getDocs(query(collection(db, "users", userId, "sins"))),
        getDocs(query(collection(db, "users", userId, "prayers"))),
      ]);

      const sinsArray = sinsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const prayersArray = prayersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));


      calculateSinCounts(sinsArray);
      calculatePrayerCounts(prayersArray);

    } catch (err) {
      setError("There was an error fetching your data.");
      console.error(err);
    }
  };

  const calculateSinCounts = (sins) => {
    const counts = {};
    sins.forEach((sin) => {
      const sinDate = format(sin.createdAt.seconds * 1000, "yyyy-MM-dd");
      counts[sinDate] = (counts[sinDate] || 0) + 1;
    });
    setSinCounts(counts);
  };

  const calculatePrayerCounts = (prayers) => {
    const counts = {};
    prayers.forEach((prayer) => {
      const prayerDate = format(prayer.createdAt.seconds * 1000, "yyyy-MM-dd");
      counts[prayerDate] = (counts[prayerDate] || 0) + 1;
    });
    setPrayerCounts(counts);
  };

  useEffect(() => {
    if (Object.keys(sinCounts).length > 0 && Object.keys(prayerCounts).length > 0) {
      setLoading(false); // Set loading to false when both sins and prayers are loaded
    }
  }, [sinCounts, prayerCounts]);

  const generateCalendar = () => {
    const today = new Date();
    const startOfMonthDate = startOfMonth(today);
    const endOfMonthDate = endOfMonth(today);
    return eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate });
  };

  const getDayColor = (day) => {
    const sinDayKey = format(day, "yyyy-MM-dd");
    const sinCount = sinCounts[sinDayKey] || 0;
    const intensity = Math.min(sinCount * 40, 255); // Max color intensity
    return `rgb(${intensity}, 0, 0)`; // Gradual red intensity based on sin count
  };

  const getSinLabel = (count) => {
    return count === 1 ? "sin" : "sins";
  };

  const getPrayerLabel = (count) => {
    return count === 1 ? "prayer" : "prayers";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  const calendarDays = generateCalendar();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center">Sins & Prayers Calendar</h1>

      <button
        onClick={() => router.push("/home")}
        className="mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Back to Home
      </button>

      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-4">
        {calendarDays.map((day) => {
          const sinCount = sinCounts[format(day, "yyyy-MM-dd")] || 0;
          const prayerCount = prayerCounts[format(day, "yyyy-MM-dd")] || 0;

          return (
            <div
              key={day.toString()}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg"
              style={{
                backgroundColor: getDayColor(day),
              }}
            >
              <p className="text-xs sm:text-base">{format(day, "d")}</p>

              {/* Display sins count */}
              {sinCount > 0 && (
                <span className="text-xs sm:text-sm text-white">
                  {sinCount} {getSinLabel(sinCount)}
                </span>
              )}

              {/* Display prayers count */}
              {prayerCount > 0 && (
                <span className="text-xs sm:text-sm text-white">
                  {prayerCount} {getPrayerLabel(prayerCount)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-gray-400">
        <Link href="/sins" className="text-blue-400 hover:underline">
          Log more sins
        </Link>
      </p>

      <p className="mt-2 text-center text-gray-400">
        <Link href="/prayers" className="text-blue-400 hover:underline">
          Log more prayers
        </Link>
      </p>
    </div>
  );
}
