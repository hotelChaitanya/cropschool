import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
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
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Populate children if parent
    let populatedUser = user;
    if (user.role === 'parent') {
      populatedUser = await User.findById(user._id).populate(
        'children',
        'name level points streakDays lastActive'
      );
    }

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      children: user.role === 'parent' ? populatedUser.children : undefined,
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
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
