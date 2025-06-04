import {NextResponse} from 'next/server';
import {GameChangeStream} from "@/database/stream/game.stream";
import {DatabaseType} from "@/database/database.type";
import {getMongoDbClientInstance, getMongodbGameChangeStreamInstance, getSSEBroadcasterInstance} from "@/global";

/**
 * Liveness probe endpoint
 * Used to check if the application is running
 * Returns a 200 OK response with a JSON payload
 */
export function GET(): NextResponse {
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
            // @ts-ignore
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
