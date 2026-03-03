// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZxiKwP86VY0KWAbfYbII2goDroinyRAo",
  authDomain: "final-project-49d84.firebaseapp.com",
  projectId: "final-project-49d84",
  storageBucket: "final-project-49d84.firebasestorage.app",
  messagingSenderId: "901270500520",
  appId: "1:901270500520:web:2998ef341536db64213e9d",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
