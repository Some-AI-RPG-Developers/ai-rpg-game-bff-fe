/**
 * GameSSEService - Handles Server-Sent Events (SSE) for real-time game updates
 * Extracted from the Page component to provide centralized SSE management
 */

import { PlayPageGame, GameStatus } from '@/client/types/game.types';

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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;

  /**
   * Connects to the SSE endpoint for a game
   * @param config - SSE connection configuration
   * @param handlers - Event handlers for SSE events
   */
  connect(config: SSEConfig, handlers: SSEEventHandlers): void {
    this.disconnect(); // Ensure clean state
    
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
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.config = null;
    this.handlers = null;
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
      throw new Error('SSE service not properly configured');
    }

    const eventSourceUrl = this.getEndpointUrl(this.config);
    
    try {
      this.eventSource = new EventSource(eventSourceUrl);
      this.setupEventListeners();
    } catch (error) {
      const errorMessage = `Failed to initialize SSE connection to ${eventSourceUrl}: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error('GameSSEService: Error creating EventSource:', error);
      this.handlers.onError(errorMessage);
    }
  }

  /**
   * Sets up event listeners for the SSE connection
   */
  private setupEventListeners(): void {
    if (!this.eventSource || !this.handlers) return;

    this.eventSource.onopen = () => {
      console.debug(`GameSSEService: SSE connection opened for gameId: ${this.config?.gameId}`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.handlers!.onConnectionOpen();
    };

    this.eventSource.onmessage = (event) => {
      this.handleGameUpdate(event);
    };

    this.eventSource.onerror = (errorEvent) => {
      this.handleConnectionError(errorEvent);
    };
  }

  /**
   * Handles incoming game update messages
   */
  private handleGameUpdate(event: MessageEvent): void {
    if (!this.handlers || !this.config) return;

    try {
      console.log(`SSE event for ${this.config.gameId}:`, event.data);
      const gameData = JSON.parse(event.data) as PlayPageGame;
      
      if (gameData && typeof gameData === 'object') {
        this.handlers.onGameUpdate(gameData);
      } else {
        console.warn('GameSSEService: Received SSE data did not parse to a valid object:', event.data);
      }
    } catch (error) {
      console.error('GameSSEService: Error parsing SSE data:', error);
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
    const activeWaitingStatuses: GameStatus[] = [
      'creatingGame_WaitingForData',
      'loadingGame_WaitingForData',
      'recreatingGame_WaitingForData',
      'startingGame_WaitingForFirstTurn',
      'turn_Resolving',
      'turn_GeneratingNext',
      'scene_GeneratingNext',
      'contentGen_Characters_WaitingForData',
      'contentGen_Settings_WaitingForData',
      'turn_Submitting',
      'startingGame_InProgress',
      'recreatingGame_InProgress'
    ];
    
    return activeWaitingStatuses.includes(gameStatus);
  }
}

// Export a singleton instance for convenience
export const gameSSEService = new GameSSEService();