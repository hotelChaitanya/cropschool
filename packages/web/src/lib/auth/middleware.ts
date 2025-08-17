import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'parent' | 'child';
}

export async function verifyToken(
  request: Request
): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      // Check Authorization header as fallback
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return null;
      }
      const headerToken = authHeader.substring(7);
      return jwt.verify(headerToken, JWT_SECRET) as TokenPayload;
    }

    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
