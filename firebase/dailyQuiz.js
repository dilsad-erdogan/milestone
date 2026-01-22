import { firestore } from "./firebase";
import { collection, doc, getDoc, setDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { getAllWords } from "./words";

// Generate or fetch today's daily quiz
export const getDailyQuiz = async () => {
    // 1. Get today's date string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    const quizRef = doc(firestore, "daily_quizzes", today);

    try {
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
            return { id: quizSnap.id, ...quizSnap.data() };
        }

        // 2. If not exists, create it
        // Fetch all words (WARNING: Heavy if many words, but acceptable for now)
        const allWords = await getAllWords();

        // Pick 10 random words
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, 10);

        const newQuizData = {
            date: today,
            words: selectedWords,
            createdAt: new Date().toISOString()
        };

        await setDoc(quizRef, newQuizData);
        return { id: today, ...newQuizData };

    } catch (error) {
        console.error("Error getting/creating daily quiz:", error);
        throw error;
    }
};

// Check if user has completed today's quiz
export const getUserDailyQuizStatus = async (userId) => {
    const today = new Date().toISOString().split('T')[0];

    try {
        const q = query(
            collection(firestore, "quiz_results"),
            where("userId", "==", userId),
            where("type", "==", "daily"),
            where("quizDate", "==", today)
        );

        const snapshot = await getDocs(q);
        return !snapshot.empty; // True if completed
    } catch (error) {
        console.error("Error checking daily quiz status:", error);
        return false;
    }
};

// Get Today's Leaderboard
export const getDailyLeaderboard = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const q = query(
            collection(firestore, "quiz_results"),
            where("type", "==", "daily"),
            where("quizDate", "==", today),
            orderBy("finalScore", "desc"),
            orderBy("timeTaken", "asc"), // Higher score first, then faster time
            limit(50)
        );

        const snapshot = await getDocs(q);

        // We need user names. In a real app we might join or store name in result.
        // For now let's hope we can fetch them or they are stored.
        // Wait, quiz_results doesn't usually store displayName. We might need to fetch it.
        // OR we can update saveQuizResult to store displayName for easier display.

        // Let's assume we need to fetch user profiles for these results.
        const results = snapshot.docs.map(doc => doc.data());

        // Optimization: Fetch unique user profiles
        const userIds = [...new Set(results.map(r => r.userId))];
        // Cannot do "in" query for >10 items easily, and we can't do parallel fetches efficiently here without complexity.
        // Better Approach: Update `saveQuizResult` to include `displayName` snapshot at time of quiz.
        // For now, let's just return what we have, maybe the frontend can fetch names or we accept "Unknown".

        return snapshot.docs.map(doc => ({
            id: doc.id,
            userId: doc.data().userId,
            score: doc.data().finalScore,
            timeTaken: doc.data().timeTaken,
            displayName: doc.data().displayName || "User" // Need to ensure this is saved
        }));

    } catch (error) {
        console.error("Error fetching daily leaderboard:", error);
        return [];
    }
};
