import { db } from './firebase';
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
import { Project, Comment } from '../types';

const COLLECTION_NAME = 'projects';

// Real vaqtda o'zgarishlarni kuzatish (Subscribe)
export const subscribeToProjects = (onUpdate: (projects: Project[]) => void) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => doc.data() as Project);
      onUpdate(projects);
    }, (error) => {
      console.error("Firebase kuzatishda xatolik:", error);
      onUpdate([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Firebase ulanmagan. Config faylni tekshiring.", error);
    return () => {};
  }
};

// Rasmni kichraytirish va Base64 ga o'tkazish (Firestore 1MB limiti uchun)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Maksimal o'lcham (juda katta bo'lmasligi kerak)
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // JPEG sifati 0.7 (Firestore 1MB limitiga sig'dirish uchun)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Loyihani saqlash
export const saveProject = async (project: Project, imageFile?: File): Promise<void> => {
  try {
    let imageUrl = project.imageUrl;

    // Agar yangi fayl tanlangan bo'lsa, uni siqib Base64 ga o'tkazamiz
    if (imageFile) {
      console.log("Rasm qayta ishlanmoqda (Compression)...");
      imageUrl = await compressImage(imageFile);
    }
    
    const projectToSave = { ...project, imageUrl };

    // Hujjat hajmini tekshirish (taxminan)
    const sizeInBytes = new Blob([JSON.stringify(projectToSave)]).size;
    if (sizeInBytes > 1000000) {
       throw new Error("Rasm hajmi juda katta. Iltimos kichikroq rasm yuklang.");
    }

    await setDoc(doc(db, COLLECTION_NAME, project.id), projectToSave);
    console.log("Loyiha muvaffaqiyatli saqlandi!");
  } catch (error) {
    console.error("Loyiha saqlashda xatolik:", error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
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

export const initDB = async (): Promise<void> => Promise.resolve();
export const getProjects = async (): Promise<Project[]> => [];