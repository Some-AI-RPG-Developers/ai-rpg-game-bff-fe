import {NextResponse} from 'next/server';
import {DatabaseType} from "@/database/database.type";
import {getMongoDbClientInstance, getMongodbGameChangeStreamInstance, getSSEBroadcasterInstance} from "@/global";

/**
 * Interface for health check results
 */
interface HealthCheckResult {
  status: 'ok' | 'error';
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Readiness probe endpoint
 * Used to check if the application is ready to serve traffic
 * Returns a 200 OK response if all checks pass, 503 Service Unavailable otherwise
 */
export async function GET() {
  const checks = {
    memory: checkMemory(),
    application: checkApplication(),
    database: checkDatabase(),
    sse: checkSSEBroadcaster()
  };
  const isHealthy = Object.values(checks).every(check => check.status === 'ok');
  return NextResponse.json(
      {
        status: isHealthy ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        service: 'ai-rpg-game-bff-fe',
        checks,
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

/**
 * Performs a basic memory check to ensure the application has sufficient resources
 */
function checkMemory(): HealthCheckResult {
  const memUsage = process.memoryUsage();
  const maxHeapSize = process.env.MAX_HEAP_SIZE_MB
      ? parseInt(process.env.MAX_HEAP_SIZE_MB) * 1024 * 1024
      : 512 * 1024 * 1024;

  const heapUsedPercent = (memUsage.heapUsed / maxHeapSize) * 100;
  if (heapUsedPercent > 90) {
    return {
      status: 'error',
      message: 'Memory usage critical',
      details: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsedPercent: Math.round(heapUsedPercent) + '%'
      }
    };
  }
  return {
    status: 'ok',
    details: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsedPercent: Math.round(heapUsedPercent) + '%'
    }
  };
}

/**
 * Performs application-specific checks
 * Add your custom health checks here
 */
function checkApplication(): HealthCheckResult {
  const criticalEnvVars = [
    'MONGODB_URI',
    'MONGODB_DATABASE'
  ];
  const missingEnvVars = criticalEnvVars.filter(varName => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    return {
      status: 'error',
      message: 'Missing critical environment variables',
      details: {
        criticalEnvVars: criticalEnvVars,
        missingEnvVars: missingEnvVars,
        envVars: process.env,
      }
    };
  }
  return {
    status: 'ok',
    details: {
      criticalEnvVars: criticalEnvVars,
      envVars: process.env
    }
  };
}

function checkDatabase() {
  const mongoClient = getMongoDbClientInstance();
  const changeStream = getMongodbGameChangeStreamInstance();
  if (!mongoClient.isConnected()) {
    return {
      status: 'error',
      message: 'Database connection failed',
      details: {
        connected: false,
        type: DatabaseType.MONGODB
      }
    };
  }
  if (!changeStream.isWatching()) {
    return {
      status: 'error',
      message: 'Change streams not initialized',
      details: {
        type: DatabaseType.MONGODB,
        connected: true,
        changeStream: {
          active: false
        }
      }
    };
  }
  return {
    status: 'ok',
    details: {
      type: DatabaseType.MONGODB,
      connected: true,
      changeStream: {
        active: true,
        // @ts-ignore
        ...(changeStream.getResumeToken() && {resumeToken: changeStream.getResumeToken()})
      },
    }
  }
}

/**
 * Performs sse broadcaster health checks
 */
function checkSSEBroadcaster(): HealthCheckResult {
  const sseBroadcaster = getSSEBroadcasterInstance();
  return {
    status: 'ok',
    details: {
      subscribedClients: sseBroadcaster.getSubscribedClients()
    }
  };
}
