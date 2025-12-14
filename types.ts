export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl?: string;
  likes: number;
  comments: Comment[];
  timestamp: number;
  category: string;
}

export type ViewState = 'HOME' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';
