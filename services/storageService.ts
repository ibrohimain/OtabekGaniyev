import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  arrayUnion, 
  increment, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { Project, Comment } from '../types';

const COLLECTION_NAME = 'projects';

// Real vaqtda o'zgarishlarni kuzatish (Subscribe)
export const subscribeToProjects = (onUpdate: (projects: Project[]) => void) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
    
    // onSnapshot bu real-time listener. Bazada o'zgarish bo'lsa darhol ishlaydi
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => doc.data() as Project);
      onUpdate(projects);
    }, (error) => {
      console.error("Firebase kuzatishda xatolik:", error);
      // Agar Firebase ulanmagan bo'lsa, bo'sh array qaytarish yoki lokal ma'lumotni ko'rsatish mumkin
      onUpdate([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Firebase ulanmagan. Config faylni tekshiring.", error);
    return () => {};
  }
};

// Rasmni Storagega yuklash funksiyasi
const uploadImageToStorage = async (base64String: string, projectId: string): Promise<string> => {
  try {
    // Agar rasm allaqachon URL bo'lsa (https://...), uni yuklash shart emas
    if (base64String.startsWith('http')) {
      return base64String;
    }

    const storageRef = ref(storage, `project-images/${projectId}`);
    await uploadString(storageRef, base64String, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Rasm yuklashda xatolik:", error);
    throw new Error("Rasmni bulutga yuklay olmadik");
  }
};

// Loyihani saqlash (Rasm bilan birga)
export const saveProject = async (project: Project): Promise<void> => {
  try {
    // 1. Agar rasm Base64 bo'lsa, avval uni Storagega yuklaymiz
    const imageUrl = await uploadImageToStorage(project.imageUrl, project.id);
    
    // 2. Yangi URL bilan loyihani yangilaymiz
    const projectToSave = { ...project, imageUrl };

    // 3. Firestore bazasiga yozamiz
    await setDoc(doc(db, COLLECTION_NAME, project.id), projectToSave);
  } catch (error) {
    console.error("Loyiha saqlashda xatolik:", error);
    alert("Ma'lumotni saqlashda xatolik bo'ldi. Firebase Config to'g'ri ekanligini tekshiring.");
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    // 1. Hujjatni o'chirish
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    
    // 2. Rasmni ham o'chirishga harakat qilamiz (agar u storage da bo'lsa)
    const imageRef = ref(storage, `project-images/${id}`);
    try {
        await deleteObject(imageRef);
    } catch (e) {
        // Rasm topilmasa yoki tashqi URL bo'lsa, e'tibor bermaymiz
        console.log("Rasm o'chirilmadi yoki mavjud emas edi");
    }
  } catch (error) {
    console.error("O'chirishda xatolik:", error);
  }
};

export const toggleLikeProject = async (id: string): Promise<void> => {
  const projectRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(projectRef, {
    likes: increment(1)
  });
};

export const addCommentToProject = async (projectId: string, comment: Comment): Promise<void> => {
  const projectRef = doc(db, COLLECTION_NAME, projectId);
  await updateDoc(projectRef, {
    comments: arrayUnion(comment)
  });
};

// Eski initDB funksiyasi endi kerak emas, chunki Firebase schema-less
export const initDB = async (): Promise<void> => {
  console.log("Firebase initialized");
  return Promise.resolve();
};

// Eski getProjects funksiyasi (faqat moslik uchun qoldirildi, lekin biz subscribe ishlatamiz)
export const getProjects = async (): Promise<Project[]> => {
  return [];
};