import { firestore } from "./firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const getAllCategories = async () => {
    try {
        const querySnapshot = await getDocs(collection(firestore, "categories"));
        const categories = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

const getCategoryById = async (id) => {
    try {
        const docRef = doc(firestore, "categories", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No such category!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching category:", error);
        throw error;
    }
};

export { getAllCategories, getCategoryById };
