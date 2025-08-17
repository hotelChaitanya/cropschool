import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { generateToken } from '@/lib/auth/utils';

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password using the model's comparePassword method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user data without password
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      level: user.level,
      points: user.points,
      streakDays: user.streakDays,
      children: user.role === 'parent' ? user.children : undefined,
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
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: 'Login failed',
        details:
          process.env['NODE_ENV'] === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
