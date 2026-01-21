import { firestore } from "./firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";

const addWord = async (wordData) => {
    try {
        const engVal = wordData.eng.toLocaleUpperCase('tr-TR');
        const trVal = wordData.tr.toLocaleUpperCase('tr-TR');

        // Check for existing word pair
        const q = query(
            collection(firestore, "words"),
            where("eng", "==", engVal),
            where("tr", "==", trVal)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // Found duplicate, return existing ID
            const existingDoc = snapshot.docs[0];
            return { id: existingDoc.id, ...existingDoc.data() };
        }

        // No duplicate, add new
        const docRef = await addDoc(collection(firestore, "words"), {
            eng: engVal,
            tr: trVal,
            eng_categoryId: wordData.eng_categoryId,
            tr_categoryId: wordData.tr_categoryId
        });
        return { id: docRef.id, ...wordData };
    } catch (error) {
        console.error("Error adding word:", error);
        throw error;
    }
};

const getAllWords = async () => {
    try {
        const querySnapshot = await getDocs(collection(firestore, "words"));
        const words = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        return words;
    } catch (error) {
        console.error("Error fetching words:", error);
        throw error;
    }
};

const getWordsByTRCategoryId = async (TRCategoryId) => {
    try {
        const q = query(collection(firestore, "words"), where("tr_categoryId", "==", TRCategoryId));
        const querySnapshot = await getDocs(q);
        const words = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        return words;
    } catch (error) {
        console.error("Error fetching words by category:", error);
        throw error;
    }
};

const getWordsByENGCategoryId = async (ENGCategoryId) => {
    try {
        const q = query(collection(firestore, "words"), where("eng_categoryId", "==", ENGCategoryId));
        const querySnapshot = await getDocs(q);
        const words = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        return words;
    } catch (error) {
        console.error("Error fetching words by category:", error);
        throw error;
    }
};

const getWordById = async (wordId) => {
    try {
        const docRef = doc(firestore, "words", wordId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No such word!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching word:", error);
        throw error;
    }
};

export { addWord, getAllWords, getWordsByTRCategoryId, getWordsByENGCategoryId, getWordById };
