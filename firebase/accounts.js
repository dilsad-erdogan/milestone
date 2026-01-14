import { firestore } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const checkAndCreateUser = async (user) => {
    try {
        const userDocRef = doc(firestore, "accounts", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
                userId: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
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
        await updateDoc(userDocRef, {
            myWords: arrayUnion(wordId)
        });
        return true;
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

const updateUserScore = async (userId, newScore) => {
    try {
        const userDocRef = doc(firestore, "accounts", userId);
        await updateDoc(userDocRef, {
            score: newScore
        });
        return true;
    } catch (error) {
        console.error("Error updating user score:", error);
        throw error;
    }
};

export { checkAndCreateUser, getUserWords, addWordToUser, removeWordFromUser, updateUserScore };
