import { NextResponse } from 'next/server';

/**
 * Liveness probe endpoint
 * Used to check if the application is running
 * Returns a 200 OK response with a JSON payload
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ai-rpg-game-bff-fe'
    }, 
    { 
      status: 200 
    }
  );
} 