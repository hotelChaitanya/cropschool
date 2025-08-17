import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env['JWT_SECRET'] || 'your-secret-key'
);

export interface SessionUser {
  userId: string;
  email: string;
  role: 'parent' | 'child';
}

export async function createSession(user: SessionUser): Promise<string> {
  return await new SignJWT({
    userId: user.userId,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySession(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload['userId'] && payload['email'] && payload['role']) {
      return {
        userId: payload['userId'] as string,
        email: payload['email'] as string,
        role: payload['role'] as 'parent' | 'child',
      };
    }
    return null;
  } catch {
    return null;
  }
}
