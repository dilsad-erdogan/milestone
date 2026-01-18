import { firestore } from "./firebase";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";

// Yeni bir quiz sonucu kaydet
const addQuizResult = async (userId, resultData) => {
    try {
        const docRef = await addDoc(collection(firestore, "quiz_results"), {
            userId,
            score: resultData.score,
            totalQuestions: resultData.totalQuestions,
            correctAnswers: resultData.correctAnswers,
            incorrectAnswers: resultData.incorrectAnswers,
            createdAt: Timestamp.now()
        });
        return { id: docRef.id, ...resultData };
    } catch (error) {
        console.error("Error adding quiz result:", error);
        throw error;
    }
};

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
        const totalScore = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const totalQuestionsSolved = results.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);

        // En yüksek skoru bul
        const bestScore = Math.max(...results.map(r => r.score || 0));

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

export { addQuizResult, getUserQuizStats };
