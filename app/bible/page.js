'use client'
import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/FirebaseConfig';
import { addDoc, collection, doc, query, getDocs, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaBookmark } from 'react-icons/fa';
import Link from "next/link"

const Bible = () => {
  const [activeSection, setActiveSection] = useState('bible'); // Track active section
  const [book, setBook] = useState('Genesis');
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [error, setError] = useState(null);
  const [bookList, setBookList] = useState([]);
  const [user, setUser] = useState(null);
  const [savedVerses, setSavedVerses] = useState([]);

  useEffect(() => {
    const books = [
      "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
      "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings",
      "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
      "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
      "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea",
      "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
      "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark",
      "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
      "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
      "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
      "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
      "Jude", "Revelation"
    ];
    setBookList(books);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchSavedVerses(currentUser.uid);
      } else {
        setUser(null);
        setSavedVerses([]);
      }
    });

    return () => unsubscribe();
  }, []); // No dependencies as `auth` and `fetchSavedVerses` are stable


  const fetchSavedVerses = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const savedVersesCollection = collection(userDocRef, 'savedVerses');
      const q = query(savedVersesCollection);
      const querySnapshot = await getDocs(q);
      const versesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedVerses(versesList);
    } catch (error) {
      console.error('Error fetching saved verses:', error);
    }
  };

  const fetchChapter = async () => {
    try {
      const res = await fetch(`https://bible-api.com/${book}+${chapter}`);
      const data = await res.json();
      if (data.verses) {
        setVerses(data.verses);
        setError(null);
      } else {
        throw new Error('No verses found');
      }
    } catch (err) {
      setError('Failed to fetch chapter. Please check the book and chapter number.');
      console.error(err)
      setVerses([]);
    }
  };

  const saveVerse = async (book, chapter, verseNumber, verseText) => {
    if (!user) {
      setError("You must be logged in to save verses.");
      return;
    }

    if (isVerseSaved(verseNumber)) {
      console.log("This verse is already saved.");
      return; // Prevent saving duplicates
    }

    const data = {
      book,
      chapter,
      verseNumber,
      verseText,
      savedAt: new Date(), // Add current timestamp
    };

    try {
      const userDocRef = doc(db, 'users', user.uid); // Reference to the user's document
      const savedVersesCollection = collection(userDocRef, 'savedVerses'); // Subcollection for saved verses
      const docRef = await addDoc(savedVersesCollection, data); // Add the new verse to Firestore

      console.log('Verse saved successfully with ID:', docRef.id);

      // Update local state to include the newly saved verse
      setSavedVerses((prev) => [...prev, { id: docRef.id, ...data }]);

      // Optional: Provide success feedback
      setError(null);
    } catch (error) {
      console.error('Error saving verse:', error);
      setError("An error occurred while saving the verse. Please try again.");
    }
  };

  const handleDeleteVerse = async (verseId) => {
    if (!user) {
      setError("You must be logged in to delete verses.");
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const verseDocRef = doc(userDocRef, 'savedVerses', verseId);

      await deleteDoc(verseDocRef); // Delete the verse from Firestore
      setSavedVerses((prev) => prev.filter((verse) => verse.id !== verseId)); // Remove it from local state
      console.log('Verse deleted successfully.');
    } catch (error) {
      console.error('Error deleting verse:', error);
    }
  };


  const isVerseSaved = (verseNumber) => {
    return savedVerses.some(
      (savedVerse) =>
        savedVerse.book === book &&
        savedVerse.chapter === chapter &&
        savedVerse.verseNumber === verseNumber
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-center space-x-8">
            <Link href='/home' className='px-6 py-2 rounded-full text-lg font-semibold bg-gray-700 text-gray-300 '>
              Back
            </Link>
            <button
              onClick={() => setActiveSection('bible')}
              className={`px-6 py-2 rounded-full text-lg font-semibold transition ${activeSection === 'bible'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white'
                }`}
            >
              Bible
            </button>
            <button
              onClick={() => setActiveSection('other')}
              className={`px-6 py-2 rounded-full text-lg font-semibold transition ${activeSection === 'other'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white'
                }`}
            >
              Other
            </button>
          </div>
        </div>
      </nav>


      <div className="container mx-auto p-6">
        {activeSection === 'bible' && (
          <div>
            <h1 className="text-5xl font-extrabold mb-8 text-center text-blue-600">Read the Bible</h1>
            <div className="mb-6 space-y-4">
              <select
                value={book}
                onChange={(e) => setBook(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              >
                {bookList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="150"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              />
              <button
                onClick={fetchChapter}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200 shadow-lg transform hover:scale-105"
              >
                Get Chapter
              </button>
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            {verses.length > 0 && (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-semibold mb-4 text-blue-500">{`${book} ${chapter}`}</h2>
                {verses.map((verse) => (
  <div key={verse.verse} className="mb-6">
    <p className="text-l font-serif leading-4">
      <strong className="text-blue-700">{`${verse.verse}: `}</strong>
      <span>{verse.text}</span>
    </p>
    <FaBookmark
      className={`mt-2 cursor-pointer hover:text-blue-600 ${
        isVerseSaved(verse.verse) ? 'text-gray-400' : 'text-blue-500'
      }`}
      onClick={() => saveVerse(book, chapter, verse.verse, verse.text)}
      title={
        isVerseSaved(verse.verse) ? 'Verse already saved' : 'Save this verse'
      }
    />
  </div>
))}

              </div>
            )}
          </div>
        )}

        {activeSection === 'other' && (
          <div className="container mx-auto px-6 py-12">
            <h1 className="text-5xl font-extrabold mb-16 text-center text-blue-600 dark:text-blue-400 tracking-tight">
              Saved Verses
            </h1>
            <div className="text-center text-lg">
              {savedVerses.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                  {savedVerses.map((verse) => (
                    <div
                      key={verse.id}
                      className="bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-gray-700 dark:to-gray-800 p-6 rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden"
                    >
                      <h2 className="text-2xl font-bold text-white mb-4">
                        {verse.book} {verse.chapter}:{verse.verseNumber}
                      </h2>
                      <p className="text-white dark:text-gray-300 italic text-base leading-relaxed">
                        "{verse.verseText}"
                      </p>
                      <p className="text-sm text-white dark:text-gray-400 mt-4">
                        Saved on: {new Date(verse.savedAt.seconds * 1000).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleDeleteVerse(verse.id)}
                        className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all"
                        title="Delete verse"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  You haven't saved any verses yet. Save some verses from the Bible section!
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Bible;
