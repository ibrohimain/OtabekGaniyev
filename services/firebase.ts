import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// DIQQAT: Bu yerga o'zingizning Firebase loyihangiz ma'lumotlarini qo'yishingiz kerak.
// 1. https://console.firebase.google.com ga kiring
// 2. Yangi loyiha oching
// 3. Web app yarating va configlarni shu yerga nusxalang
const firebaseConfig = {
  apiKey: "AIzaSyD-YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Agar config bo'lmasa xatolik bermasligi uchun dummy object
const app = initializeApp(firebaseConfig.apiKey.includes("YOUR_API_KEY") ? {} as any : firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);