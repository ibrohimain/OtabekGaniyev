import { Project, Comment } from '../types';

const DB_NAME = 'PortfolioDB';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

// Initial dummy data
const INITIAL_DATA: Project[] = [
  {
    id: '1',
    title: 'Neon Cyberpunk Poster',
    description: 'A futuristic poster design for a music festival in Tokyo. Created using Photoshop and Blender.',
    imageUrl: 'https://picsum.photos/800/1000?random=1',
    likes: 42,
    comments: [
      { id: 'c1', author: 'Alex', text: 'This colors are amazing!', timestamp: Date.now() }
    ],
    timestamp: Date.now(),
    category: 'Poster'
  },
  {
    id: '2',
    title: 'Minimalist Brand Identity',
    description: 'Complete branding package for a coffee shop, focusing on earth tones and clean typography.',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    likes: 128,
    comments: [],
    timestamp: Date.now() - 100000,
    category: 'Branding'
  },
  {
    id: '3',
    title: 'Social Media Kit',
    description: 'Instagram templates for a fashion influencer. High engagement layout.',
    imageUrl: 'https://picsum.photos/800/800?random=3',
    likes: 85,
    comments: [],
    timestamp: Date.now() - 200000,
    category: 'Social Media'
  }
];

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Helper to initialize data if empty
export const initDB = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();

    countRequest.onsuccess = () => {
      if (countRequest.result === 0) {
        // Populate initial data
        const writeTx = db.transaction(STORE_NAME, 'readwrite');
        const writeStore = writeTx.objectStore(STORE_NAME);
        INITIAL_DATA.forEach(p => writeStore.add(p));
        writeTx.oncomplete = () => resolve();
        writeTx.onerror = () => reject(writeTx.error);
      } else {
        resolve();
      }
    };
    countRequest.onerror = () => reject(countRequest.error);
  });
};

export const getProjects = async (): Promise<Project[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by timestamp descending (newest first)
      const projects = request.result as Project[];
      projects.sort((a, b) => b.timestamp - a.timestamp);
      resolve(projects);
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveProject = async (project: Project): Promise<Project[]> => {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(project); // put updates if exists, adds if not

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  return getProjects();
};

export const deleteProject = async (id: string): Promise<Project[]> => {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  return getProjects();
};

export const toggleLikeProject = async (id: string): Promise<Project[]> => {
  const db = await openDB();
  // 1. Get the project
  const project = await new Promise<Project>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (project) {
    // 2. Update it
    project.likes += 1;
    await saveProject(project);
  }
  return getProjects();
};

export const addCommentToProject = async (projectId: string, comment: Comment): Promise<Project[]> => {
  const db = await openDB();
  const project = await new Promise<Project>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(projectId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (project) {
    project.comments = [comment, ...project.comments];
    await saveProject(project);
  }
  return getProjects();
};