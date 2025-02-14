import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAt8hUKw-ejJroo0ASCjHp8KLmG4jBfeE4",
    authDomain: "mahjong-statics.firebaseapp.com",
    projectId: "mahjong-statics",
    storageBucket: "mahjong-statics.firebasestorage.app",
    messagingSenderId: "786520798441",
    appId: "1:786520798441:web:759c6ff79e7e5d870b2c78",
    measurementId: "G-YG69LGC8VM"
    };

// Firebaseを初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
