import {NextRequest} from 'next/server';
import {getSSEBroadcasterInstance, SSEBroadcaster} from '@/sse/sse.broadcaster';

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

  // Handle client disconnect
  const sseBroadcaster: SSEBroadcaster = getSSEBroadcasterInstance()
  request.signal.addEventListener('abort', reason => {
    console.error(`Client ${gameId} disconnected, reason: ${reason.type}`);
    sseBroadcaster.stopBroadcastingEventsToClient(gameId);
  });

  // Create a readable stream for SSE
  const sseBroadcast = new ReadableStream({
    start(controller: ReadableStreamDefaultController): void {
      console.log(`SSE connection request from client: ${gameId}`);
      sseBroadcaster.startBroadcastingEventToClient(gameId, controller);
    },
    cancel(reason: string): void {
      console.log(`SSE stream cancelled for client ${gameId}:`, reason);
      sseBroadcaster.stopBroadcastingEventsToClient(gameId);
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
}