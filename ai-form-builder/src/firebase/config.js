import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBbdHUmmFGx01SGIxoyHNyYwHpZ5gFJpRs",
  authDomain: "conditionalformapp.firebaseapp.com",
  projectId: "conditionalformapp",
  storageBucket: "conditionalformapp.firebasestorage.app",
  messagingSenderId: "554486678690",
  appId: "1:554486678690:web:4ae037f8627c03f7a143fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
