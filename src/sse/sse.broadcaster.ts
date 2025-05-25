export interface SSEClient {
  controller: ReadableStreamDefaultController;
}

export interface SSEBroadcaster {
  getSubscribedClients(): string[]
  startBroadcastingEventToClient(clientId: string, controller: ReadableStreamDefaultController): void
  broadcastEventToClients(event: string, clientIds?: string[]): void
  broadcastEventToClient(event: string, clientId: string): void
  stopBroadcastingEventsToClient(clientId: string): void
  stopBroadcastingEventsToClients(): void
}

class SSEBroadcasterImpl {
  private readonly clients: Map<string, SSEClient> = new Map();

  public getSubscribedClients(): string[] {
    return this.clients.keys().toArray()
  }

  public startBroadcastingEventToClient(clientId: string, controller: ReadableStreamDefaultController): void {
    if (this.clients.has(clientId)) {
      this.stopBroadcastingEventsToClient(clientId)
    }
    console.log(`Starting event broadcast to SSE client ${clientId}.`)
    const sseClient: SSEClient = { controller }
    this.clients.set(clientId, sseClient);
    console.log(`SSE client ${clientId} connected. Total clients: ${this.clients.size}`);
  }

  public stopBroadcastingEventsToClient(clientId: string): void {
    const client: SSEClient | undefined = this.clients.get(clientId);
    if (!client) {
      return;
    }
    console.log(`Closing SSE client ${clientId}.`)
    try {
      this.clients.delete(clientId);
      client.controller.close();
      console.log(`SSE client ${clientId} disconnected. Total clients: ${this.clients.size}`);

    } catch (error) {
      console.warn(`Error closing SSE client ${clientId}:`, error);
    }
  }

  public broadcastEventToClients(event: string, clientIds?: string[]): void {
    const clients: string[] = clientIds ?? this.clients.keys().toArray()
    console.log(`Broadcasting event to ${clients.length} SSE clients:`, event);
    clients.forEach(clientId => this.broadcastEventToClient(event, clientId));
  }

  public broadcastEventToClient(event: string, clientId: string): void {
    console.log(`Broadcasting event to SSE client ${clientId}.`)
    const client: SSEClient | undefined = this.clients.get(clientId)
    if (!client) {
      throw Error(`Client with id ${clientId} was not found.`)
    }
    try {
      client.controller.enqueue(event);
      console.log(`Event broadcasted to SSE client ${clientId}.`)

    } catch (error) {
      console.error(`Error sending SSE message to client ${clientId}:`, error);
      this.stopBroadcastingEventsToClient(clientId);
    }
  }

  public stopBroadcastingEventsToClients(): void {
    console.log(`Stopping event broadcast to ${this.clients.size} SSE clients.`)
    this.clients.keys().forEach(this.stopBroadcastingEventsToClient)
  }
}

let sseBroadcaster: SSEBroadcaster;
export function getSSEBroadcasterInstance(): SSEBroadcaster {
  if (sseBroadcaster) {
    return sseBroadcaster
  }
  return sseBroadcaster = new SSEBroadcasterImpl();
}