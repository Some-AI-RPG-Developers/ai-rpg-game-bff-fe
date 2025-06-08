/**
 * GameService - Main service class that orchestrates API and SSE services
 * Provides a unified interface for all game-related operations
 */

import { GameApiService } from '@/client/services/api/GameApiService';
import { GameSSEService, SSEEventHandlers } from '@/client/services/sse/GameSSEService';
import {
  NewGame,
  NewTurn,
  PlayPageGame,
  GameStatus,
  GameServiceResponse,
  CharacterInput
} from '@/client/types/game.types';

/**
 * Game service configuration
 */
export interface GameServiceConfig {
  apiBaseUrl?: string;
  sseReconnectAttempts?: number;
  sseReconnectDelay?: number;
}

/**
 * Game operation callbacks
 */
export interface GameServiceCallbacks {
  onGameUpdate: (game: PlayPageGame) => void;
  onStatusChange: (status: GameStatus) => void;
  onError: (error: string) => void;
}

/**
 * Main game service class that coordinates all game operations
 */
export class GameService {
  private apiService: GameApiService;
  private sseService: GameSSEService;
  private config: GameServiceConfig;
  private callbacks: GameServiceCallbacks | null = null;
  private currentGameId: string | null = null;
  private currentStatus: GameStatus = 'idle';

  constructor(config: GameServiceConfig = {}) {
    this.config = config;
    this.apiService = new GameApiService(config.apiBaseUrl);
    this.sseService = new GameSSEService();
  }

  /**
   * Initializes the service with callbacks
   */
  initialize(callbacks: GameServiceCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Creates a new game
   */
  async createGame(gameData: NewGame): Promise<GameServiceResponse<{ gameId: string }>> {
    if (!this.callbacks) {
      throw new Error('GameService not initialized');
    }

    // Validate the game data first
    const validation = this.apiService.validateGameCreationData(gameData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(' ')
      };
    }

    this.updateStatus('creatingGame_InProgress');

    const result = await this.apiService.createGame(gameData);
    
    if (result.success && result.data) {
      this.currentGameId = result.data.gameId;
      this.updateStatus('creatingGame_WaitingForData');
      this.connectToGameSSE(result.data.gameId);
    } else {
      this.updateStatus('error_GameSetupFailed');
    }

    return result;
  }

  /**
   * Loads an existing game by ID
   */
  loadGameById(gameId: string): void {
    if (!this.callbacks) {
      throw new Error('GameService not initialized');
    }

    if (!gameId.trim()) {
      this.callbacks.onError("Please enter a Game ID to resume.");
      return;
    }

    this.currentGameId = gameId;
    this.updateStatus('loadingGame_WaitingForData');
    this.connectToGameSSE(gameId);
  }

  /**
   * Starts an existing game
   */
  async startGame(): Promise<GameServiceResponse<void>> {
    if (!this.currentGameId || !this.callbacks) {
      return {
        success: false,
        error: 'No game ID available or service not initialized'
      };
    }

    this.updateStatus('startingGame_InProgress');

    const result = await this.apiService.startGame(this.currentGameId);
    
    if (result.success) {
      this.updateStatus('startingGame_WaitingForFirstTurn');
    } else {
      this.updateStatus('error_GameSetupFailed');
    }

    return result;
  }

  /**
   * Submits a turn for the current game
   */
  async submitTurn(turnData: NewTurn): Promise<GameServiceResponse<void>> {
    if (!this.currentGameId || !this.callbacks) {
      return {
        success: false,
        error: 'No game ID available or service not initialized'
      };
    }

    this.updateStatus('turn_Submitting');

    const result = await this.apiService.submitTurn(this.currentGameId, turnData);
    
    if (!result.success) {
      this.updateStatus('error_GameSetupFailed');
    }
    // If successful, SSE will handle the status transition

    return result;
  }

  /**
   * Recreates/regenerates game content
   */
  async recreateGameContent(gameData: NewGame, gameId: string): Promise<GameServiceResponse<void>> {
    if (!this.callbacks) {
      throw new Error('GameService not initialized');
    }

    this.updateStatus('recreatingGame_InProgress');

    const result = await this.apiService.recreateGameContent(gameId, gameData);
    
    if (result.success) {
      this.updateStatus('recreatingGame_WaitingForData');
    } else {
      this.updateStatus('error_GameSetupFailed');
    }

    return result;
  }

  /**
   * Checks if the service is currently processing
   */
  isProcessing(): boolean {
    const processingStatuses: GameStatus[] = [
      'creatingGame_InProgress',
      'recreatingGame_InProgress',
      'startingGame_InProgress',
      'turn_Submitting'
    ];
    return processingStatuses.includes(this.currentStatus);
  }

  /**
   * Checks if the service is waiting for SSE response
   */
  isWaitingForSSE(): boolean {
    const waitingStatuses: GameStatus[] = [
      'creatingGame_WaitingForData',
      'recreatingGame_WaitingForData',
      'contentGen_Characters_WaitingForData',
      'contentGen_Settings_WaitingForData',
      'startingGame_WaitingForFirstTurn',
      'turn_Resolving',
      'turn_GeneratingNext',
      'scene_GeneratingNext',
      'loadingGame_WaitingForData'
    ];
    return waitingStatuses.includes(this.currentStatus);
  }

  /**
   * Gets the current game status
   */
  getCurrentStatus(): GameStatus {
    return this.currentStatus;
  }

  /**
   * Gets the current game ID
   */
  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  /**
   * Disconnects from SSE and resets the service
   */
  disconnect(): void {
    this.sseService.disconnect();
    this.currentGameId = null;
    this.updateStatus('idle');
  }

  /**
   * Determines the next status based on game data and current status
   */
  determineGameStatus(gameData: PlayPageGame, oldGame: PlayPageGame | null): GameStatus {
    const newCurrentScene = gameData.scenes?.slice(-1)[0] || null;
    const newCurrentTurn = newCurrentScene?.turns?.slice(-1)[0] || null;
    const oldCurrentScene = oldGame?.scenes?.slice(-1)[0] || null;
    const oldCurrentTurn = oldCurrentScene?.turns?.slice(-1)[0] || null;

    // Game concluded
    if (gameData.conclusion) {
      return 'game_Over';
    }

    // Status transition logic based on current status and new data
    switch (this.currentStatus) {
      case 'creatingGame_WaitingForData':
      case 'loadingGame_WaitingForData':
      case 'recreatingGame_WaitingForData':
        if (!gameData.characters || gameData.characters.length === 0) {
          return 'contentGen_Characters_WaitingForData';
        } else if (!gameData.synopsis) {
          return 'contentGen_Settings_WaitingForData';
        } else {
          return 'idle';
        }

      case 'contentGen_Characters_WaitingForData':
        if (gameData.characters && gameData.characters.length > 0) {
          if (!gameData.synopsis) {
            return 'contentGen_Settings_WaitingForData';
          } else {
            return 'idle';
          }
        }
        break;

      case 'contentGen_Settings_WaitingForData':
        if (gameData.synopsis) {
          return 'idle';
        }
        break;

      case 'startingGame_WaitingForFirstTurn':
        if (newCurrentTurn?.options && !newCurrentTurn.consequences) {
          return 'idle';
        }
        break;

      case 'turn_Submitting':
        if (newCurrentTurn?.consequences && newCurrentTurn.turnNumber === oldCurrentTurn?.turnNumber) {
          return 'turn_Resolving';
        } else if (newCurrentTurn?.options && !newCurrentTurn.consequences && 
                   newCurrentTurn.turnNumber !== oldCurrentTurn?.turnNumber) {
          return 'idle';
        } else if (newCurrentTurn?.options && !newCurrentTurn.consequences && 
                   newCurrentTurn.turnNumber === oldCurrentTurn?.turnNumber) {
          return 'idle';
        }
        break;

      case 'turn_Resolving':
        if (newCurrentTurn?.options && !newCurrentTurn.consequences && 
            newCurrentTurn.turnNumber !== oldCurrentTurn?.turnNumber) {
          return 'idle';
        } else if (newCurrentScene?.consequences && 
                   newCurrentScene.sceneNumber !== oldCurrentScene?.sceneNumber) {
          return 'scene_GeneratingNext';
        } else if (newCurrentScene?.consequences && !newCurrentTurn?.options && 
                   newCurrentScene.sceneNumber === oldCurrentScene?.sceneNumber) {
          return 'scene_GeneratingNext';
        }
        break;

      case 'scene_GeneratingNext':
        if (newCurrentTurn?.options && !newCurrentTurn.consequences &&
            (newCurrentScene?.sceneNumber !== oldCurrentScene?.sceneNumber || !oldCurrentScene)) {
          return 'idle';
        }
        break;

      case 'idle':
        // Check if game lost synopsis but has prompt (needs recreation)
        if (!gameData.synopsis && gameData.gamePrompt) {
          // This will be handled by the recreation logic in the hook
        }
        break;
    }

    return this.currentStatus; // No status change
  }

  /**
   * Connects to SSE for the specified game
   */
  private connectToGameSSE(gameId: string): void {
    if (!this.callbacks) return;

    const sseHandlers: SSEEventHandlers = {
      onGameUpdate: (gameData: PlayPageGame) => {
        this.callbacks!.onGameUpdate(gameData);
      },
      onStatusChange: (newStatus: GameStatus) => {
        this.updateStatus(newStatus);
      },
      onError: (error: string) => {
        this.callbacks!.onError(error);
      },
      onConnectionOpen: () => {
        // Connection opened successfully
      },
      onConnectionClose: () => {
        // Handle connection close if in active waiting state
        if (GameSSEService.shouldTriggerErrorOnClose(this.currentStatus)) {
          this.updateStatus('error_GameSetupFailed');
        }
      }
    };

    this.sseService.connect({
      gameId,
      reconnectAttempts: this.config.sseReconnectAttempts,
      reconnectDelay: this.config.sseReconnectDelay
    }, sseHandlers);
  }

  /**
   * Updates the current status and notifies callbacks
   */
  private updateStatus(newStatus: GameStatus): void {
    const oldStatus = this.currentStatus;
    this.currentStatus = newStatus;
    
    if (this.callbacks && oldStatus !== newStatus) {
      this.callbacks.onStatusChange(newStatus);
    }
  }

  /**
   * Validates game creation data
   */
  static validateGameCreation(
    gamePrompt: string,
    maxScenes: number,
    characters: CharacterInput[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!gamePrompt.trim()) {
      errors.push("Game Prompt cannot be empty.");
    }

    if (maxScenes <= 0) {
      errors.push("Max Scenes Number must be greater than 0.");
    }

    if (characters.some(c => !c.name.trim() || !c.characterPrompt.trim())) {
      errors.push("All characters must have a name and a prompt.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export a singleton instance for convenience
export const gameService = new GameService();