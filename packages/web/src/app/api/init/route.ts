import { NextResponse } from 'next/server';
import { seedDatabase } from '../../../lib/database/seed';

export async function GET() {
  try {
    const result = await seedDatabase();

    if (result.success) {
      return NextResponse.json({
        message: 'Database initialized successfully',
        success: true,
      });
    } else {
      return NextResponse.json(
        {
          message: 'Database initialization failed',
          error: result.error,
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      {
        message: 'Database initialization failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    );
  }
}
