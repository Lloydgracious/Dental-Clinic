import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOJfEHYJAvi0sLAhCn4ptskPnhxHD7WwI",
  authDomain: "dentalclinic-ce706.firebaseapp.com",
  projectId: "dentalclinic-ce706",
  storageBucket: "dentalclinic-ce706.firebasestorage.app",
  messagingSenderId: "666122298600",
  appId: "1:666122298600:web:efa11728879007cca1155d",
  measurementId: "G-RDH3F0WXPF"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
