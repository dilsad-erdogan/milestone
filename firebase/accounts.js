import { firestore } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const checkAndCreateUser = async (user) => {
    try {
        const userDocRef = doc(firestore, "accounts", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
                userId: user.uid,
                email: user.email || null,
                displayName: user.displayName || null,
                photoURL: user.photoURL || null,
                myWords: [],
                score: 0,
                quizs: [],
                createdAt: new Date().toISOString()
            });
            console.log("New user created in accounts collection");
        }
    } catch (error) {
        console.error("Error creating user in accounts:", error);
    }
};

const getUserWords = async (userId) => {
    try {
        const userDocRef = doc(firestore, "accounts", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            return userDocSnap.data().myWords || [];
        } else {
            console.log("User not found!");
            return [];
        }
    } catch (error) {
        console.error("Error fetching user words:", error);
        throw error;
    }
};

const addWordToUser = async (userId, wordId) => {
    try {
        const userDocRef = doc(firestore, "accounts", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const myWords = userData.myWords || [];

            if (myWords.includes(wordId)) {
                return { success: false, alreadyExists: true };
            }
        }

        await updateDoc(userDocRef, {
            myWords: arrayUnion(wordId)
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding word to user:", error);
        throw error;
    }
};

const removeWordFromUser = async (userId, wordId) => {
    try {
        const userDocRef = doc(firestore, "accounts", userId);
        await updateDoc(userDocRef, {
            myWords: arrayRemove(wordId)
        });
        return true;
    } catch (error) {
        console.error("Error removing word from user:", error);
        throw error;
    }
};

const updateUserScore = async (userId, scoreToAdd) => {
    try {
        console.log(`[Diagnostic] Updating score for user ${userId}. Adding: ${scoreToAdd}`);
        const userDocRef = doc(firestore, "accounts", userId);
        const userDocSnap = await getDoc(userDocRef);
        const currentScore = userDocSnap.exists() ? (userDocSnap.data().score || 0) : 0;

        await updateDoc(userDocRef, {
            score: currentScore + scoreToAdd
        });
        console.log(`[Diagnostic] Score updated successfully. New total: ${currentScore + scoreToAdd}`);
        return true;
    } catch (error) {
        console.error("[Diagnostic] Error updating user score:", error);
        throw error;
    }
};

const addQuizToUser = async (userId, quizId) => {
    try {
        const userDocRef = doc(firestore, "accounts", userId);
        await updateDoc(userDocRef, {
            quizs: arrayUnion(quizId)
        });
        return true;
    } catch (error) {
        console.error("Error adding quiz to user:", error);
        throw error;
    }
};

const getUserAccount = async (userId) => {
    try {
        const userDocRef = doc(firestore, "accounts", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            return userDocSnap.data();
        } else {
            console.log("User account not found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user account:", error);
        throw error;
    }
};

const getGeneralLeaderboard = async () => {
    try {
        // Fetch all users to include those who might rely on default score (missing field)
        // Note: For large datasets (>1000 users), this should be paginated or indexed properly with a backfill script.
        const snapshot = await getDocs(collection(firestore, "accounts"));

        const allUsers = snapshot.docs.map(doc => ({
            id: doc.id,
            displayName: doc.data().displayName || "Unknown User",
            score: doc.data().score || 0, // Default to 0 if missing
            photoURL: doc.data().photoURL
        }));

        // Sort by score descending
        allUsers.sort((a, b) => b.score - a.score);

        // Return top 50
        return allUsers.slice(0, 50);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
};

export { checkAndCreateUser, getUserWords, addWordToUser, removeWordFromUser, updateUserScore, addQuizToUser, getUserAccount, getGeneralLeaderboard };
