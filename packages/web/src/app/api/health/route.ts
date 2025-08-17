import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';

export async function GET() {
  try {
    // Test database connection
    await connectDB();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'],
      services: {
        database: 'connected',
        api: 'operational',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'],
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
