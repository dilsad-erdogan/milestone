import { firestore } from "./firebase";
import { collection, addDoc, getDocs, query, where, Timestamp, doc, getDoc } from "firebase/firestore";
import { addQuizToUser, updateUserScore } from "./accounts";


// Kullanıcının tüm quiz sonuçlarını getir ve istatistikleri hesapla
const getUserQuizStats = async (userId) => {
    try {
        const q = query(collection(firestore, "quiz_results"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const results = querySnapshot.docs.map(doc => doc.data());

        if (results.length === 0) {
            return {
                totalQuizzes: 0,
                averageScore: 0,
                bestScore: 0,
                totalQuestionsSolved: 0
            };
        }

        const totalQuizzes = results.length;
        const totalScore = results.reduce((acc, curr) => acc + (curr.finalScore || curr.score || 0), 0);
        const totalQuestionsSolved = results.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);

        // En yüksek skoru bul
        const bestScore = Math.max(...results.map(r => r.finalScore || r.score || 0), 0);

        // Ortalamayı hesapla (tam sayıya yuvarla)
        const averageScore = Math.round(totalScore / totalQuizzes);

        return {
            totalQuizzes,
            averageScore,
            bestScore,
            totalQuestionsSolved
        };

    } catch (error) {
        console.error("Error fetching user quiz stats:", error);
        throw error;
    }
};

// Detaylı quiz sonucu kaydet
const saveQuizResult = async (userId, quizData) => {
    try {
        const quizResult = {
            userId,
            direction: quizData.direction,
            finalScore: quizData.finalScore,
            correctAnswers: quizData.correctCount,
            wrongAnswers: quizData.wrongCount,
            emptyAnswers: quizData.emptyCount,
            timeBonus: quizData.timeBonus,
            answers: quizData.answers,
            totalQuestions: quizData.totalQuestions,
            completedAt: Timestamp.now(),
            timeTaken: quizData.timeTaken,
            status: 'completed',
            // Leaderboard fields
            displayName: quizData.displayName || "Anonymous",
            photoURL: quizData.photoURL || null,
            type: quizData.type || 'normal', // 'daily' or 'normal'
            quizDate: quizData.quizDate || null
        };

        const docRef = await addDoc(collection(firestore, "quiz_results"), quizResult);

        // Kullanıcı dökümanını da güncelle (redundancy & score)
        try {
            await Promise.all([
                addQuizToUser(userId, docRef.id),
                updateUserScore(userId, quizData.finalScore)
            ]);
        } catch (syncError) {
            console.error("Error syncing quiz to user account:", syncError);
        }

        return { id: docRef.id, ...quizResult };
    } catch (error) {
        console.error("Error saving quiz result:", error);
        throw error;
    }
};
// Tek bir quiz sonucunu getir
const getQuizResultById = async (resultId) => {
    try {
        const docRef = doc(firestore, "quiz_results", resultId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No such quiz result!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching quiz result:", error);
        throw error;
    }
};
// Kullanıcının tüm quiz sonuçlarını detaylı liste olarak getir
const getUserQuizResults = async (userId) => {
    try {
        const q = query(
            collection(firestore, "quiz_results"),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Tarihe göre sırala (en yeni en üstte)
        return results.sort((a, b) => {
            const dateA = a.completedAt?.toDate() || 0;
            const dateB = b.completedAt?.toDate() || 0;
            return dateB - dateA;
        });
    } catch (error) {
        console.error("Error fetching user quiz results:", error);
        throw error;
    }
};

export { getUserQuizStats, saveQuizResult, getQuizResultById, getUserQuizResults };
