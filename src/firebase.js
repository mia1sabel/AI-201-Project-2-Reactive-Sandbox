// 1. We added 'getAuth' to this line
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyAj5VSoiDI_i77BkGb8t2JVDA2dwSlWLt0",
  authDomain: "shot-flow-fd618.firebaseapp.com",
  projectId: "shot-flow-fd618",
  storageBucket: "shot-flow-fd618.firebasestorage.app",
  messagingSenderId: "494112462748",
  appId: "1:494112462748:web:756fed961ed7a5b917da59",
  measurementId: "G-DXML6RPREJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. We added this line to "turn on" the login features and share them with your app
export const auth = getAuth(app);