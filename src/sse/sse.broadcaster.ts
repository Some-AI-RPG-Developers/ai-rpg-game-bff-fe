export interface SSEClient {
  controller: ReadableStreamDefaultController;
}

export interface SSEBroadcaster {
  getSubscribedClients(): string[]
  addClientSubscription(clientId: string, controller: ReadableStreamDefaultController): void
  broadcastEventToClients(event: string, clientIds?: string[]): void
  broadcastEventToClient(event: string, clientId: string): void
  removeClientSubscription(clientId: string): void
  removeAllClientsSubscriptions(): void
}

export class SSEBroadcasterImpl implements SSEBroadcaster{
  public readonly clients: Map<string, SSEClient> = new Map();

  public getSubscribedClients(): string[] {
    return this.clients.keys().toArray()
  }

  public addClientSubscription(clientId: string, controller: ReadableStreamDefaultController): void {
    if (this.clients.has(clientId)) {
      this.removeClientSubscription(clientId)
    }
    console.debug(`Starting event broadcast to SSE client ${clientId}.`)
    const sseClient: SSEClient = { controller }
    this.clients.set(clientId, sseClient);
    console.info(`SSE client ${clientId} connected. Total clients: ${this.clients.size}`);
  }

  public removeClientSubscription(clientId: string): void {
    const client: SSEClient | undefined = this.clients.get(clientId);
    if (!client) {
      return;
    }
    console.debug(`Closing SSE client ${clientId}.`)
    try {
      this.clients.delete(clientId);
      client.controller.close();
      console.info(`SSE client ${clientId} disconnected. Total clients: ${this.clients.size}`);

    } catch (error) {
      console.warn(`Error closing SSE client ${clientId}:`, error);
    }
  }

  public broadcastEventToClients(event: string, clientIds?: string[]): void {
    const clients: string[] = clientIds ?? this.clients.keys().toArray()
    console.debug(`Broadcasting event to ${clients.length} SSE clients:`, event);
    clients.forEach(clientId => this.broadcastEventToClient(event, clientId));
  }

  public broadcastEventToClient(event: string, clientId: string): void {
    console.debug(`Broadcasting event to SSE client ${clientId}, event: [${event}].`)
    if(!this.clients.has(clientId)) {
      console.warn(`Client with id ${clientId} was not found`)
      return;
    }
    try {
      this.clients.get(clientId)?.controller.enqueue(event);
      console.debug(`Event broadcasted to SSE client ${clientId}.`)

    } catch (error) {
      console.warn(`Error sending SSE message to client ${clientId}:`, error);
    }
  }

  public removeAllClientsSubscriptions(): void {
    console.debug(`Stopping event broadcast to ${this.clients.size} SSE clients.`)
    this.clients.keys().forEach(this.removeClientSubscription)
  }
}