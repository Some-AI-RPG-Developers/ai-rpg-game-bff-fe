import {NextResponse} from 'next/server';
import {GameChangeStream, getMongodbGameChangeStreamInstance} from "@/database/stream/game.stream";
import {getSSEBroadcasterInstance} from "@/sse/sse.broadcaster";
import {getMongoDbClientInstance} from "@/database/database.client";
import {DatabaseType} from "@/database/database.type";

/**
 * Liveness probe endpoint
 * Used to check if the application is running
 * Returns a 200 OK response with a JSON payload
 */
export function GET() {
  const mongoClient = getMongoDbClientInstance();
  const changeStream: GameChangeStream = getMongodbGameChangeStreamInstance();
  const sseBroadcaster = getSSEBroadcasterInstance();

  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ai-rpg-game-bff-fe',
      database: {
          type: DatabaseType.MONGODB,
          connected: mongoClient.isConnected(),
          changeStream: {
            active: changeStream.isWatching(),
            ...(changeStream.getResumeToken() && {resumeToken: changeStream.getResumeToken()})
        }
      },
      sse: {
        subscribedClients: sseBroadcaster.getSubscribedClients()
      }
    },
    {
      status: 200
    }
  );
}
