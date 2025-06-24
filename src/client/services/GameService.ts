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
  CharacterInput,
  Game
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
  private readonly apiService: GameApiService;
  private readonly sseService: GameSSEService;
  private readonly config: GameServiceConfig;
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
        status: 400,
        error: validation.errors.join(' ')
      };
    }

    this.updateStatus('creatingGame_InProgress');

    const result = await this.apiService.createGame(gameData);
    
    if (result.status === 200 && result.data) {
      this.currentGameId = result.data.gameId;
      this.updateStatus('creatingGame_WaitingForData');
      console.log(`GameService: Connecting to SSE for new game. gameId from API: "${result.data.gameId}"`);
      this.connectToGameSSE(result.data.gameId);
    } else {
      this.updateStatus('error_GameSetupFailed');
    }

    return result;
  }

  /**
   * Checks if a game exists by ID
   */
  async getGame(gameId: string): Promise<GameServiceResponse<Game>> {
    return await this.apiService.getGame(gameId);
  }

  /**
   * Loads an existing game by ID
   */
  async loadGameById(gameId: string): Promise<void> {
    if (!this.callbacks) {
      throw new Error('GameService not initialized');
    }

    if (!gameId.trim()) {
      this.callbacks.onError("Please enter a Game ID to resume.");
      return;
    }

    console.log(`🚀 DEBUG LOAD: Starting loadGameById for: "${gameId}"`);

    // First, check if the game exists with a GET request
    console.log(`🚀 DEBUG LOAD: Checking if game exists via API...`);
    const gameResult = await this.apiService.getGame(gameId);
    
    console.log(`🚀 DEBUG LOAD: API result:`, {
      status: gameResult.status,
      hasData: !!gameResult.data,
      error: gameResult.error
    });
    
    if (gameResult.status !== 200) {
      // Game not found (404) or other error - show error without changing status
      console.log(`🚀 DEBUG LOAD: Game not found or error occurred`);
      this.callbacks.onError(gameResult.error ?? 'Failed to load game');
      return;
    }

    // Game exists, check if it has scenes
    const gameData = gameResult.data;
    if (gameData && (!gameData.scenes || gameData.scenes.length === 0)) {
      // Game has no scenes, set data immediately and transition to ready state
      console.log(`🚀 DEBUG LOAD: Game has no scenes, transitioning directly to ready state`);
      this.currentGameId = gameId;
      this.callbacks.onGameUpdate(gameData);
      this.updateStatus('game_ReadyToStart');
      return;
    }

    // Game has scenes, proceed with SSE connection
    this.currentGameId = gameId;
    console.log(`🚀 DEBUG LOAD: Setting status to 'loadingGame_WaitingForData' for gameId: "${gameId}"`);
    this.updateStatus('loadingGame_WaitingForData');
    console.log(`🚀 DEBUG LOAD: Connecting to SSE for existing game: "${gameId}"`);
    this.connectToGameSSE(gameId);
  }

  /**
   * Starts an existing game
   */
  async startGame(): Promise<GameServiceResponse<void>> {
    if (!this.currentGameId || !this.callbacks) {
      return {
        status: 400,
        error: 'No game ID available or service not initialized'
      };
    }

    this.updateStatus('startingGame_InProgress');

    const result = await this.apiService.startGame(this.currentGameId);
    
    if (result.status === 200) {
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
        status: 400,
        error: 'No game ID available or service not initialized'
      };
    }

    this.updateStatus('turn_Submitting');

    const result = await this.apiService.submitTurn(this.currentGameId, turnData);
    
    if (result.status !== 200) {
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
    
    if (result.status === 200) {
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
    console.log(`🔄 DEBUG STATUS: determineGameStatus called`);
    console.log(`🔄 DEBUG STATUS: Current status: ${this.currentStatus}`);
    console.log(`🔄 DEBUG STATUS: Game data summary:`, {
      gameId: gameData?.gameId,
      hasCharacters: !!(gameData?.characters?.length),
      charactersCount: gameData?.characters?.length || 0,
      hasSynopsis: !!gameData?.synopsis,
      hasScenes: !!(gameData?.scenes?.length),
      hasConclusion: !!gameData?.conclusion
    });
    
    const newCurrentScene = gameData.scenes?.slice(-1)[0] || null;
    const newCurrentTurn = newCurrentScene?.turns?.slice(-1)[0] || null;
    const oldCurrentScene = oldGame?.scenes?.slice(-1)[0] || null;
    const oldCurrentTurn = oldCurrentScene?.turns?.slice(-1)[0] || null;

    // Game concluded
    if (gameData.conclusion) {
      console.log(`🔄 DEBUG STATUS: Game concluded, returning 'game_Over'`);
      return 'game_Over';
    }

    // Status transition logic based on current status and new data
    switch (this.currentStatus) {
      case 'creatingGame_WaitingForData':
      case 'loadingGame_WaitingForData':
      case 'recreatingGame_WaitingForData':
        console.log(`🔄 DEBUG STATUS: Processing waiting status: ${this.currentStatus}`);
        if (!gameData.characters || gameData.characters.length === 0) {
          console.log(`🔄 DEBUG STATUS: No characters found, returning 'contentGen_Characters_WaitingForData'`);
          return 'contentGen_Characters_WaitingForData';
        } else if (!gameData.synopsis) {
          console.log(`🔄 DEBUG STATUS: No synopsis found, returning 'contentGen_Settings_WaitingForData'`);
          return 'contentGen_Settings_WaitingForData';
        } else {
          console.log(`🔄 DEBUG STATUS: Characters and synopsis found, returning 'idle'`);
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
    if (!this.callbacks) {
      console.log("GameService: callbacks are empty.")
      return;
    }

    console.log("GameService: connectToGameSSE called.")
    const sseHandlers: SSEEventHandlers = {
      onGameUpdate: (gameData: PlayPageGame) => {
        console.log("GameService: onGameUpdate called.")
        this.callbacks!.onGameUpdate(gameData);
      },
      onStatusChange: (newStatus: GameStatus) => {
        console.log("GameService: onStatusChange called.")
        this.updateStatus(newStatus);
      },
      onError: (error: string) => {
        console.log("GameService: onError called.")
        this.callbacks!.onError(error);
      },
      onConnectionOpen: () => {
        console.log("GameService: onConnectionOpen called.")
        // Connection opened successfully
      },
      onConnectionClose: () => {
        console.log("GameService: onConnectionClose called.")
        if (GameSSEService.shouldTriggerErrorOnClose(this.currentStatus)) {
          console.error("GameService: Game setup failed. Triggering error.")
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