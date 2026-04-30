import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyB1-your-key-here", // We'll need the loaded config 
};

// Actually wait, let's use the local codebase to read config via dotenv or just printing the students.
