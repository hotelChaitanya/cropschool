'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '../validation/schemas';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login-dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const { user, token } = await response.json();
    localStorage.setItem('auth_token', token);
    setUser(user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    const response = await fetch('/api/auth/register-dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const { user, token } = await response.json();
    localStorage.setItem('auth_token', token);
    setUser(user);
  };

  const updateProfile = async (data: Partial<User>) => {
    const response = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Profile update failed');
    }

    const updatedUser = await response.json();
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
