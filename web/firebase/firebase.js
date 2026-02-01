import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC59Bfd7uSr_-uHW-fZoK7LOPDB3CPVnR8",
    authDomain: "milestone-4ada7.firebaseapp.com",
    projectId: "milestone-4ada7",
    storageBucket: "milestone-4ada7.firebasestorage.app",
    messagingSenderId: "975726194011",
    appId: "1:975726194011:web:9e0e58f50b7e0ab2627e7e",
    measurementId: "G-LN175H97TP"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth();

export { app, firestore, auth };