export interface User {
  id: number;
  registration: string;
  name: string;
  email: string;
  roles: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  registration: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  registration: string;
  name: string;
  email: string;
  password: string;
}

export interface Boletim {
  id: number;
  title: string;
  description: string;
  content: string;
  publicationDate: string;
  fileUrl?: string;
  status: 'draft' | 'published';
  createdBy: number;
  isFeatured?: boolean;
  viewCount?: number;
  authorName?: string;
  news?: NewsItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsItem {
  id: number;
  boletimId: number;
  title: string;
  content: string;
  imageUrl?: string;
  order: number;
  isMain: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
