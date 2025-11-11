// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhmszGd6hBJDsxY4pXji-Q-pl-uagfhL0",
  authDomain: "modular-3b8ac.firebaseapp.com",
  projectId: "modular-3b8ac",
  storageBucket: "modular-3b8ac.firebasestorage.app",
  messagingSenderId: "914640814625",
  appId: "1:914640814625:web:21121f3392a779e3d6d960",
  measurementId: "G-CS4JRBMK9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
