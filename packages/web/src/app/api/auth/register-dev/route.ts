import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { generateToken } from '@/lib/auth/utils';

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectDB();

    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user (password will be automatically hashed by the pre-save hook)
    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      name: username,
      role: 'parent', // Default to parent for development
      level: 1,
      points: 0,
      streakDays: 0,
      completedLessons: [],
      children: [],
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    // Return user data without password
    const userResponse = {
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      level: newUser.level,
      points: newUser.points,
      streakDays: newUser.streakDays,
      children: newUser.children,
    };

    const response = NextResponse.json({
      user: userResponse,
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: 'Registration failed',
        details:
          process.env['NODE_ENV'] === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
