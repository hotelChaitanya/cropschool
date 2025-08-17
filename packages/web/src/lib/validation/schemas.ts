import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(1).max(50),
  role: z.enum(['student', 'parent', 'teacher', 'admin']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Game schemas
export const gameSessionSchema = z.object({
  gameId: z.string(),
  playerId: z.string(),
  score: z.number().min(0),
  duration: z.number().min(0),
  completedAt: z.date().optional(),
  achievements: z.array(z.string()),
});

export const gameProgressSchema = z.object({
  level: z.number().min(1),
  experience: z.number().min(0),
  unlockedItems: z.array(z.string()),
  statistics: z.record(z.string(), z.number()),
});

// Parent dashboard schemas
export const childProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  age: z.number().min(3).max(18),
  grade: z.string(),
  parentId: z.string(),
  settings: z.object({
    dailyTimeLimit: z.number().min(0).max(480), // minutes
    allowedGames: z.array(z.string()),
    difficulty: z.enum(['easy', 'medium', 'hard', 'adaptive']),
  }),
});

// Validation helpers
export type User = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GameSession = z.infer<typeof gameSessionSchema>;
export type GameProgress = z.infer<typeof gameProgressSchema>;
export type ChildProfile = z.infer<typeof childProfileSchema>;
