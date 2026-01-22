import { firestore } from "./firebase";
import { collection, doc, getDoc, setDoc, getDocs, query, where } from "firebase/firestore";
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
