import {NextRequest} from 'next/server';
import {SSEBroadcaster} from '@/server/sse/sse.broadcaster';
import {getSSEBroadcasterInstance, getGameServiceInstance} from "@/global";

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
    const sseBroadcaster: SSEBroadcaster = getSSEBroadcasterInstance()
    const gameService = getGameServiceInstance()
    
    request.signal.addEventListener('abort', reason => {
      console.error(`Client ${gameId} disconnected, reason: ${reason.type}`);
      sseBroadcaster.removeClientSubscription(gameId);
    });

    // Create a readable stream for SSE
    const sseBroadcast = new ReadableStream({
      start: async (controller: ReadableStreamDefaultController): Promise<void> => {
        console.info(`SSE connection request from client: ${gameId}`);
        sseBroadcaster.addClientSubscription(gameId, controller);
        
        // Send current game state immediately to trigger onopen event
        const currentGame = await gameService.getGame(gameId);
        if (currentGame) {
          console.debug(`Sending initial game state to SSE client ${gameId}`);
          sseBroadcaster.broadcastEventToClient(JSON.stringify(currentGame), gameId);
        }
      },
      cancel(reason: string): void {
        console.info(`SSE stream cancelled for client ${gameId}:`, reason);
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