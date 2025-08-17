// User interface for the file-based database
export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  role: 'parent' | 'student' | 'teacher' | 'admin';
  createdAt: string;
  updatedAt: string;
  children?: string[]; // For parent accounts, IDs of their children
}

// User without password for API responses
export type UserResponse = Omit<User, 'password'>;
