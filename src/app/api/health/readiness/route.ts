import { NextResponse } from 'next/server';

/**
 * Interface for health check results
 */
interface HealthCheckResult {
  status: 'ok' | 'error';
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Interface for the complete readiness response
 */
interface ReadinessResponse {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
  checks: Record<string, HealthCheckResult>;
}

/**
 * Performs a basic memory check to ensure the application has sufficient resources
 */
async function checkMemory(): Promise<HealthCheckResult> {
  try {
    // In a production environment, you might want to check if memory usage is below a threshold
    return { status: 'ok' };
  } catch (error) {
    return { 
      status: 'error', 
      message: 'Memory check failed',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}

/**
 * Performs application-specific checks
 * Add your custom health checks here
 */
async function checkApplication(): Promise<HealthCheckResult> {
  try {
    // Add any application-specific checks here
    // For example, checking connections to critical services
    
    return { status: 'ok' };
  } catch (error) {
    return { 
      status: 'error', 
      message: 'Application check failed',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}

/**
 * Readiness probe endpoint
 * Used to check if the application is ready to serve traffic
 * Returns a 200 OK response if all checks pass, 503 Service Unavailable otherwise
 */
export async function GET() {
  const memoryCheck = await checkMemory();
  const applicationCheck = await checkApplication();
  
  const checks = {
    memory: memoryCheck,
    application: applicationCheck,
  };
  
  const isHealthy = Object.values(checks).every(check => check.status === 'ok');
  
  const response: ReadinessResponse = {
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    service: 'ai-rpg-game-bff-fe',
    checks,
  };
  
  return NextResponse.json(
    response, 
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