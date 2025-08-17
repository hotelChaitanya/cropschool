import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    // Manual validation since zod might not be installed
    const { email, password, name, role } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['parent', 'child'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be either parent or child' },
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

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
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
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
