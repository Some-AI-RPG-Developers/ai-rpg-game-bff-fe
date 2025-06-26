/**
 * GameSSEService - Handles Server-Sent Events (SSE) for real-time game updates
 * Extracted from the Page component to provide centralized SSE management
 */

import { PlayPageGame, GameStatus } from '@/client/types/game.types';
import { shouldTriggerErrorOnSSEClose } from '@/client/hooks/useGameState';

/**
 * SSE event handlers interface
 */
export interface SSEEventHandlers {
  onGameUpdate: (gameData: PlayPageGame) => void;
  onStatusChange: (newStatus: GameStatus) => void;
  onError: (error: string) => void;
  onConnectionOpen: () => void;
  onConnectionClose: () => void;
}

/**
 * SSE connection configuration
 */
export interface SSEConfig {
  gameId: string;
  baseUrl?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

/**
 * Service class for handling SSE connections and game state updates
 */
export class GameSSEService {
  private eventSource: EventSource | null = null;
  private config: SSEConfig | null = null;
  private handlers: SSEEventHandlers | null = null;
  private isConnected = false;
  private isConnecting = false; // Flag to indicate a connection attempt is in progress
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;

  /**
   * Connects to the SSE endpoint for a game
   * @param config - SSE connection configuration
   * @param handlers - Event handlers for SSE events
   */
  connect(config: SSEConfig, handlers: SSEEventHandlers): void {
    console.log('GameSSEService: connect called with config:', JSON.stringify(config, null, 2));
    // If trying to connect to the same gameId and already connecting or connected, update handlers and return.
    if (this.config?.gameId === config.gameId && (this.isConnecting || this.isConnected)) {
        console.log(`GameSSEService: Already connecting/connected to ${config.gameId}. Updating handlers if necessary.`);
        this.handlers = handlers; // Ensure handlers are up-to-date
        return;
    }
    this.disconnect(); // Ensure clean state from previous different game or failed attempt
    
    this.config = config;
    this.handlers = handlers;
    this.maxReconnectAttempts = config.reconnectAttempts ?? 3;
    this.reconnectDelay = config.reconnectDelay ?? 1000;
    
    this.createConnection();
  }

  /**
   * Disconnects from the SSE endpoint
   */
  disconnect(): void {
    console.log(`GameSSEService: disconnect() called. Current gameId: ${this.config?.gameId}`);
    console.trace("GameSSEService: disconnect() call stack");
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false; // Reset flag on disconnect
    this.reconnectAttempts = 0;
    this.config = null;
    this.handlers = null;
  }

  /**
   * Public getter to check if the service is in the process of connecting.
   */
  public getIsConnecting(): boolean {
    return this.isConnecting;
  }

  /**
   * Checks if currently connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Gets the current SSE endpoint URL
   */
  getCurrentEndpoint(): string | null {
    return this.config ? this.getEndpointUrl(this.config) : null;
  }

  /**
   * Creates the SSE connection
   */
  private createConnection(): void {
    if (!this.config || !this.handlers) {
      console.error('GameSSEService: createConnection called without config or handlers.');
      this.isConnecting = false; // Ensure flag is reset if we can't proceed
      throw new Error('SSE service not properly configured');
    }
    this.isConnecting = true; // Set flag: connection attempt is starting

    const eventSourceUrl = this.getEndpointUrl(this.config);
    console.log('GameSSEService: In createConnection. Attempting to connect to SSE URL:', eventSourceUrl);
    
    // Set a timeout to prevent getting stuck in CONNECTING state
    const connectionTimeout = setTimeout(() => {
      if (this.eventSource && this.eventSource.readyState === EventSource.CONNECTING) {
        console.error('GameSSEService: Connection timeout - SSE connection stuck in CONNECTING state');
        this.eventSource.close();
        this.isConnecting = false;
        this.isConnected = false;
        if (this.handlers) {
          this.handlers.onError('Connection timeout - unable to establish SSE connection');
        }
      }
    }, 10000); // 10 second timeout
    
    try {
      console.log('GameSSEService: PRE new EventSource() instantiation.');
      this.eventSource = new EventSource(eventSourceUrl);
      console.log('GameSSEService: POST new EventSource() instantiation. EventSource object:', this.eventSource);
      if (this.eventSource) {
        console.log(`GameSSEService: EventSource readyState after instantiation: ${this.eventSource.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSED)`);
      }
      this.setupEventListeners(connectionTimeout);
      
    } catch (error) {
      clearTimeout(connectionTimeout);
      console.error('GameSSEService: catch block - Error during EventSource instantiation or setupEventListeners:', error);
      this.isConnecting = false; // Reset flag on error
      const errorMessage = `Failed to initialize SSE connection to ${eventSourceUrl}: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error('GameSSEService: Error creating EventSource:', error);
      if (this.handlers) { // Check if handlers is still there
        this.handlers.onError(errorMessage);
      } else {
        console.error("GameSSEService: Handlers became null before error could be reported in createConnection's catch block.");
      }
    }

  }

  /**
   * Sets up event listeners for the SSE connection
   */
  private setupEventListeners(connectionTimeout?: NodeJS.Timeout): void {
    if (!this.eventSource || !this.handlers)  {
      console.warn("GameSSEService: Either eventSource or handlers is not defined.")
      return;
    }

    console.log("GameSSEService: Setting up event listeners...")
    
    this.eventSource.onopen = () => {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      console.log(`🔌 DEBUG SSE: eventSource.onopen triggered for gameId: ${this.config?.gameId}`);
      console.log(`🔌 DEBUG SSE: Connection established, readyState: ${this.eventSource?.readyState}`);
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.handlers!.onConnectionOpen();
    };

    this.eventSource.onmessage = (event) => {
      console.log(`📩 DEBUG SSE: Message received for gameId: ${this.config?.gameId}`);
      console.log(`📩 DEBUG SSE: Raw event data:`, event.data);
      console.log(`📩 DEBUG SSE: Event data length: ${event.data?.length} characters`);
      this.handleGameUpdate(event);
    };

    this.eventSource.onerror = (errorEvent) => {
      console.error(`GameSSEService: eventSource.onerror triggered for gameId: ${this.config?.gameId}. Event:`, errorEvent);
      if (this.eventSource) {
        console.error(`GameSSEService: EventSource readyState in onerror: ${this.eventSource.readyState}`);
      }
      this.handleConnectionError(errorEvent);
    };
  }

  /**
   * Handles incoming game update messages
   */
  private handleGameUpdate(event: MessageEvent): void {
    if (!this.handlers || !this.config) return;

    try {
      console.log(`🎮 DEBUG SSE: Processing game update for ${this.config.gameId}`);
      const gameData = JSON.parse(event.data) as PlayPageGame;
      
      console.log(`🎮 DEBUG SSE: Parsed game data structure:`, {
        gameId: gameData?.gameId,
        hasCharacters: !!(gameData?.characters?.length),
        hasSynopsis: !!gameData?.synopsis,
        hasScenes: !!(gameData?.scenes?.length),
        hasConclusion: !!gameData?.conclusion,
        dataKeys: Object.keys(gameData || {})
      });
      
      if (gameData && typeof gameData === 'object') {
        console.log(`🎮 DEBUG SSE: Calling onGameUpdate handler`);
        this.handlers.onGameUpdate(gameData);
      } else {
        console.warn('🎮 DEBUG SSE: Invalid game data received:', event.data);
      }
    } catch (error) {
      console.error('🎮 DEBUG SSE: Error parsing game data:', error);
      this.handlers.onError('Error processing game update.');
    }
  }

  /**
   * Handles SSE connection errors
   */
  private handleConnectionError(errorEvent: Event): void {
    if (!this.eventSource || !this.handlers || !this.config) return;

    console.error(`GameSSEService: Error occurred with SSE connection for gameId: ${this.config.gameId}`, errorEvent);
    let errorMessage = 'Connection to game updates failed.';
    if (this.eventSource.readyState === EventSource.CLOSED) {
      errorMessage += ' The connection was closed.';
      this.isConnected = false;
      this.handlers.onConnectionClose();
      
      // Attempt reconnection if we haven't exceeded max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnection();
      } else {
        this.handlers.onError(errorMessage + ' Maximum reconnection attempts exceeded.');
      }
    } else if (this.eventSource.readyState === EventSource.CONNECTING) {
      errorMessage += ' Attempting to reconnect...';
    }
    this.handlers.onError(errorMessage + ' Please try refreshing if the issue persists.');
  }

  /**
   * Attempts to reconnect to the SSE endpoint
   */
  private attemptReconnection(): void {
    if (!this.config || !this.handlers) return;

    this.reconnectAttempts++;
    console.log(`GameSSEService: Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
    
    setTimeout(() => {
      if (this.config && this.handlers) {
        this.createConnection();
      }
    }, this.reconnectDelay);
    
    // Exponential backoff for reconnection delay
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000);
  }

  /**
   * Generates the SSE endpoint URL
   */
  private getEndpointUrl(config: SSEConfig): string {
    const baseUrl = config.baseUrl ?? '/api/v1';
    return `${baseUrl}/games/${config.gameId}/updates`;
  }

  /**
   * Determines if the current game status should trigger an error state on connection close
   */
  static shouldTriggerErrorOnClose(gameStatus: GameStatus): boolean {
    return shouldTriggerErrorOnSSEClose(gameStatus);
  }
}

// Export a singleton instance for convenience
export const gameSSEService = new GameSSEService();