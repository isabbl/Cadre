import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDFezARxEkHfhJBfgdNQonBG_okonsqmyU",
  authDomain: "cadre-9603f.firebaseapp.com",
  projectId: "cadre-9603f",
  storageBucket: "cadre-9603f.firebasestorage.app",
  messagingSenderId: "937288968550",
  appId: "1:937288968550:web:7ad049ad99b7d85940c0a7",
  measurementId: "G-22ZLT4NZ0S",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// App secundário para criar usuários sem deslogar o admin atual
const secondaryApp = initializeApp(firebaseConfig, "secondary");
export const secondaryAuth = getAuth(secondaryApp);
