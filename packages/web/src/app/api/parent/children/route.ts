import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/middleware';

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const parent = await User.findById(user.userId).populate({
      path: 'children',
      select: 'name level points streakDays completedLessons lastActive',
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    const childrenData = parent.children?.map((child: any) => ({
      id: child._id,
      name: child.name,
      level: child.level || 1,
      points: child.points || 0,
      streakDays: child.streakDays || 0,
      completedLessons: child.completedLessons?.length || 0,
      totalLessons: 50, // This should come from your lesson system
      lastActive: child.lastActive,
    }));

    return NextResponse.json(childrenData || []);
  } catch (error) {
    console.error('Fetch children error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { name, email, password } = await request.json();

    // Create child account
    const child = await User.create({
      email,
      password,
      name,
      role: 'child',
      parent: user.userId,
    });

    // Add child to parent's children array
    await User.findByIdAndUpdate(user.userId, {
      $push: { children: child._id },
    });

    return NextResponse.json({
      id: child._id,
      name: child.name,
      email: child.email,
    });
  } catch (error) {
    console.error('Add child error:', error);
    return NextResponse.json({ error: 'Failed to add child' }, { status: 500 });
  }
}
