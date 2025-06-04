import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Combines both liveness and readiness information
 * Returns detailed information about the application health
 */
export async function GET(): Promise<Response>  {
  const [livenessResponse, readinessResponse] = await Promise.all([
    fetch(new URL('/api/health/liveness', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')),
    fetch(new URL('/api/health/readiness', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
  ]);

  const liveness = await livenessResponse.json();
  const readiness = await readinessResponse.json();

  const isHealthy = readiness.status === 'ok';

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'ai-rpg-game-bff-fe',
      version: '0.1.0',
      liveness,
      readiness
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    }
  );
} 