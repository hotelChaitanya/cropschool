import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { getUserFromRequest } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  try {
    const tokenPayload = await getUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(tokenPayload.userId)
      .select('-password')
      .populate('children', 'name email level points streakDays lastActive');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
