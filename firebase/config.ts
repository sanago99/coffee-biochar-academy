// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwZ_xYjG00d6r5vwS8AB0QSdzKVWb8V1U",
  authDomain: "coffee-biochar-academy.firebaseapp.com",
  projectId: "coffee-biochar-academy",
  storageBucket: "coffee-biochar-academy.firebasestorage.app",
  messagingSenderId: "84873922045",
  appId: "1:84873922045:web:f13e3523e1060d8079c594"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);