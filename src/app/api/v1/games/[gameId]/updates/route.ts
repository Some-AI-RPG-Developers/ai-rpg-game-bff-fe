import {NextRequest} from 'next/server';
import {SSEBroadcaster} from '@/server/sse/sse.broadcaster';
import {getSSEBroadcasterInstance, getGameServiceInstance} from "@/global"; // Import getGameServiceInstance
import {GameService} from "@/server/services/game.service"; // Import GameService type
import {Game} from "@/server/types/rest/api.alias.types"; // Import Game type

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ gameId: string }> }
): Promise<Response> {
  const { gameId } = await params;
  if (!gameId) {
    return Response.json(
        {error: `Missing param gamedId: ${gameId}`},
        {status: 400})
  }

  try {
    const gameService: GameService = getGameServiceInstance();
    const sseBroadcaster: SSEBroadcaster = getSSEBroadcasterInstance()
    request.signal.addEventListener('abort', reason => {
      console.error(`Client ${gameId} disconnected, reason: ${reason.type}`);
      sseBroadcaster.removeClientSubscription(gameId);
    });

    // Create a readable stream for SSE
    const sseBroadcast = new ReadableStream({
      async start(controller: ReadableStreamDefaultController): Promise<void> { // Made start async
        console.info(`SSE route: Connection request from client: ${gameId}`);
        sseBroadcaster.addClientSubscription(gameId, controller);

        const currentGame: Game | null = await gameService.getGame(gameId);
        const gameJson: string = currentGame ? JSON.stringify(currentGame) : JSON.stringify({"_id": gameId});
        sseBroadcaster.broadcastEventToClient(gameJson, gameId);
        console.info(`SSE route: Sent initial game state to ${gameId}`);
      },
      cancel(reason: string): void {
        console.info(`SSE route: Stream cancelled for client ${gameId}:`, reason);
        sseBroadcaster.removeClientSubscription(gameId);
      }
    });

    // Return SSE response
    return new Response(sseBroadcast, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  }catch (error) {
    return Response.json(
        {error: error},
        {status: 500}
    );
  }
}