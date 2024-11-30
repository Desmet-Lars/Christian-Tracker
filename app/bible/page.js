'use client'
import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/FirebaseConfig';
import { addDoc, collection, doc, query, getDocs, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
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
      setError("You must be logged in to save or unsave verses.");
      return;
    }

    if (isVerseSaved(verseNumber)) {
      // If the verse is already saved, unsave it
      handleDeleteVerse(verseNumber);
      return;
    }

    // Otherwise, save the verse
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

  const handleDeleteVerse = async (verseNumber) => {
    if (!user) {
      setError("You must be logged in to delete verses.");
      return;
    }

    try {
      // Find the verse document by matching book, chapter, and verse number
      const verseDoc = savedVerses.find(
        (verse) =>
          verse.book === book &&
          verse.chapter === chapter &&
          verse.verseNumber === verseNumber
      );

      if (!verseDoc) return;

      const userDocRef = doc(db, 'users', user.uid);
      const verseDocRef = doc(userDocRef, 'savedVerses', verseDoc.id);

      await deleteDoc(verseDocRef); // Delete the verse from Firestore
      setSavedVerses((prev) =>
        prev.filter((verse) => verse.id !== verseDoc.id)
      ); // Remove it from local state

      console.log('Verse deleted successfully.');
    } catch (error) {
      console.error('Error deleting verse:', error);
      setError("An error occurred while deleting the verse. Please try again.");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-200">
      <nav className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-center space-x-6">
            <Link href='/home' className='px-6 py-2.5 rounded-xl text-lg font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition-all duration-300'>
              Back
            </Link>
            {['bible', 'other'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-8 py-2.5 rounded-xl text-lg font-medium transition-all duration-300 ${
                  activeSection === section
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200/50 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 hover:bg-blue-500/10'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-7xl">
        {activeSection === 'bible' && (
          <div className="space-y-8">
            <h1 className="text-6xl font-extrabold mb-12 text-center bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
              Read the Bible
            </h1>

            <div className="max-w-2xl mx-auto space-y-4">
              <select
                value={book}
                onChange={(e) => setBook(e.target.value)}
                className="p-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
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
                className="p-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              />

              <button
                onClick={fetchChapter}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                Get Chapter
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                {error}
              </div>
            )}

            {verses.length > 0 && (
              <div className="max-w-4xl mx-auto p-8 bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl backdrop-blur-sm">
                <h2 className="text-4xl font-bold mb-8 text-blue-600 dark:text-blue-400">{`${book} ${chapter}`}</h2>
                {verses.map((verse) => (
                  <div key={verse.verse} className="mb-6 group">
                    <p className="text-lg font-serif leading-relaxed">
                      <span className="text-blue-600 font-bold mr-2">{verse.verse}</span>
                      <span
                        onClick={() => saveVerse(book, chapter, verse.verse, verse.text)}
                        className={`cursor-pointer transition-all duration-300 ${
                          isVerseSaved(verse.verse)
                            ? 'text-green-500 dark:text-green-400'
                            : 'group-hover:text-blue-500'
                        }`}
                      >
                        {verse.text}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'other' && (
          <div className="container mx-auto px-6 py-12">
            <h1 className="text-6xl font-extrabold mb-16 text-center bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
              Saved Verses
            </h1>

            <div className="text-center">
              {savedVerses.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                  {savedVerses.map((verse) => (
                    <div
                      key={verse.id}
                      className="bg-gradient-to-br from-blue-600 to-blue-400 dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-102 hover:shadow-2xl relative group backdrop-blur-sm"
                    >
                      <h2 className="text-2xl font-bold text-white mb-4">
                        {verse.book} {verse.chapter}:{verse.verseNumber}
                      </h2>
                      <p className="text-white/90 dark:text-gray-200 text-lg leading-relaxed">
                        &quot;{verse.verseText}&quot;
                      </p>
                      <p className="text-sm text-white/70 mt-4">
                        {new Date(verse.savedAt.seconds * 1000).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleDeleteVerse(verse.id)}
                        className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 bg-red-500/20 hover:bg-red-500 text-white p-2.5 rounded-xl transition-all duration-300"
                        title="Delete verse"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xl text-gray-500 dark:text-gray-400">
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
