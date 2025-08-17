import * as fs from 'fs';
import * as path from 'path';
import { hashPassword, comparePassword, generateToken } from '../auth/utils';
import { User } from '../models/User';

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read users from JSON file
function readUsers(): User[] {
  ensureDataDir();
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading users file:', error);
  }
  return [];
}

// Write users to JSON file
function writeUsers(users: User[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users file:', error);
  }
}

// Initialize with default user if no users exist
async function initializeDefaultUser() {
  const users = readUsers();
  if (users.length === 0) {
    const hashedPassword = await hashPassword('demo123');
    const defaultUser: User = {
      id: '1',
      email: 'parent@example.com',
      password: hashedPassword,
      username: 'Demo Parent',
      role: 'parent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeUsers([defaultUser]);
    console.log('Default user created: parent@example.com / demo123');
  }
}

export class FileDB {
  static async findUserByEmail(email: string): Promise<User | null> {
    await initializeDefaultUser();
    const users = readUsers();
    return users.find(user => user.email === email) || null;
  }

  static async findUserById(id: string): Promise<User | null> {
    const users = readUsers();
    return users.find(user => user.id === id) || null;
  }

  static async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    const users = readUsers();
    const newUser: User = {
      ...userData,
      id: String(users.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeUsers(users);
    return newUser;
  }

  static async verifyLogin(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    user?: Omit<User, 'password'>;
    token?: string;
  }> {
    console.log('FileDB.verifyLogin called with email:', email);
    const user = await this.findUserByEmail(email);
    console.log('User found:', !!user);

    if (!user) {
      console.log('No user found with email:', email);
      return { success: false };
    }

    console.log('Comparing passwords...');
    const isValidPassword = await comparePassword(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return { success: false };
    }

    console.log('Generating token...');
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;
    console.log('Login successful for user:', email);
    return { success: true, user: userWithoutPassword, token };
  }

  static async registerUser(
    email: string,
    password: string,
    username: string
  ): Promise<{
    success: boolean;
    user?: Omit<User, 'password'>;
    token?: string;
    error?: string;
  }> {
    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = await this.createUser({
      email,
      password: hashedPassword,
      username,
      role: 'parent',
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword, token };
  }
}
