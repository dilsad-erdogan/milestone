import { firestore } from "./firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const addWord = async (wordData) => {
    try {
        const docRef = await addDoc(collection(firestore, "words"), {
            eng: wordData.eng,
            tr: wordData.tr,
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

export { addWord, getAllWords, getWordsByTRCategoryId, getWordsByENGCategoryId };
