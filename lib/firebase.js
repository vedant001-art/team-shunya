import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbnRkTFTs1kK9cD-2RR0kkpshtNiw1uK0",
  authDomain: "roassss.firebaseapp.com",
  projectId: "roassss",
  storageBucket: "roassss.firebasestorage.app",
  messagingSenderId: "342715789282",
  appId: "1:342715789282:web:1101b3611f4048cd9213bb",
  measurementId: "G-Z74YY1TDKG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
