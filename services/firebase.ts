import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC1HDJWSLhCSab1y_yomYwpBCXDOmu5Dvo",
  authDomain: "inreports-d21c3.firebaseapp.com",
  projectId: "inreports-d21c3",
  storageBucket: "inreports-d21c3.firebasestorage.app",
  messagingSenderId: "543150261055",
  appId: "1:543150261055:web:e3b951bd332c34bda9898a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);