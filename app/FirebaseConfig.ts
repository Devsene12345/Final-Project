// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDZxiKwP86VY0KWAbfYbII2goDroinyRAo",
  authDomain: "final-project-49d84.firebaseapp.com",
  projectId: "final-project-49d84",
  storageBucket: "final-project-49d84.firebasestorage.app",
  messagingSenderId: "901270500520",
  appId: "1:901270500520:web:2998ef341536db64213e9d",
  databaseURL: "https://final-project-49d84-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const rtdb = getDatabase(firebaseApp);
export const storage = getStorage(firebaseApp);
export const database = getDatabase(firebaseApp);
