export interface User {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'child';
  children?: string[];
  parent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  name: string;
  email: string;
  level: number;
  points: number;
  streakDays: number;
  completedLessons: number;
  totalLessons: number;
  lastActive: string;
  subjects: {
    math: SubjectProgress;
    science: SubjectProgress;
    english: SubjectProgress;
  };
}

export interface SubjectProgress {
  level: number;
  xp: number;
  completedLessons: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'parent' | 'child';
}
