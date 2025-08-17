import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

/**
 * JWT utility functions for authentication
 * For development purposes - use a proper JWT library in production
 */

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'parent' | 'child';
}

/**
 * Generate a JWT token
 * @param payload The payload to encode
 * @returns The signed JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify a JWT token
 * @param token The JWT token to verify
 * @returns Promise that resolves with the decoded payload
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Get token from cookie
 * @returns The token payload or null if not found
 */
export async function getTokenFromCookie(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Get user from request object
 * @param request The request object
 * @returns The user payload or null if not authenticated
 */
export async function getUserFromRequest(
  request: Request
): Promise<TokenPayload | null> {
  const token = await getTokenFromCookie();
  if (token) return token;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const headerToken = authHeader.substring(7);
  return verifyToken(headerToken);
}
