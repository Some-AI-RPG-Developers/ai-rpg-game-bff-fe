/**
 * GameApiService - Handles all HTTP API calls for game operations
 * Extracted from the Page component to provide centralized API management
 */

import {
  NewGame,
  NewTurn,
  GameServiceResponse,
  GameApiError
} from '@/client/types/game.types';

/**
 * Service class for handling game-related API operations
 */
export class GameApiService {
  private readonly baseUrl: string;

  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Creates a new game
   * @param gameData - The game creation data
   * @returns Promise resolving to the created game ID
   */
  async createGame(gameData: NewGame): Promise<GameServiceResponse<{ gameId: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `Error creating game: ${response.statusText}`);
      }

      const result: { gameId: string } = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred while creating the game.'
      };
    }
  }

  /**
   * Starts an existing game
   * @param gameId - The ID of the game to start
   * @returns Promise resolving to the operation result
   */
  async startGame(gameId: string): Promise<GameServiceResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/games/${gameId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `Error starting game: ${response.statusText}`);
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred while starting the game.'
      };
    }
  }

  /**
   * Submits a turn for the current game
   * @param gameId - The ID of the game
   * @param turnData - The turn submission data
   * @returns Promise resolving to the operation result
   */
  async submitTurn(gameId: string, turnData: NewTurn): Promise<GameServiceResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/games/${gameId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turnData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `Error submitting turn: ${response.statusText}`);
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred while submitting the turn.'
      };
    }
  }

  /**
   * Recreates/regenerates game content
   * @param gameId - The ID of the game to recreate
   * @param gameData - The original game creation data
   * @returns Promise resolving to the operation result
   */
  async recreateGameContent(gameId: string, gameData: NewGame): Promise<GameServiceResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/games?gameId=${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        const errorResponseText = await response.text().catch(() => '');
        console.error("Recreation error response body:", errorResponseText);
        throw new Error(`Failed to trigger game content re-generation: ${response.status}`);
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error re-initializing game content.'
      };
    }
  }

  /**
   * Gets the SSE endpoint URL for a game
   * @param gameId - The ID of the game
   * @returns The SSE endpoint URL
   */
  getSSEEndpoint(gameId: string): string {
    return `${this.baseUrl}/games/${gameId}/updates`;
  }

  /**
   * Validates game creation data
   * @param gameData - The game data to validate
   * @returns Validation result with any errors
   */
  validateGameCreationData(gameData: Partial<NewGame>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!gameData.gamePrompt?.trim()) {
      errors.push("Game Prompt cannot be empty.");
    }

    if (!gameData.maxScenesNumber || gameData.maxScenesNumber <= 0) {
      errors.push("Max Scenes Number must be greater than 0.");
    }

    if (!gameData.characters || gameData.characters.length === 0) {
      errors.push("At least one character is required.");
    } else {
      const hasInvalidCharacters = gameData.characters.some(
        c => !c.name?.trim() || !c.characterPrompt?.trim()
      );
      if (hasInvalidCharacters) {
        errors.push("All characters must have a name and a prompt.");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Creates error information from a caught error
   * @param error - The caught error
   * @param context - Additional context for the error
   * @returns Formatted error information
   */
  static createErrorInfo(error: unknown, context = 'API operation'): GameApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        details: { context, originalError: error.name }
      };
    }
    
    return {
      message: `An unknown error occurred during ${context}`,
      details: { context, originalError: String(error) }
    };
  }
}

// Export a singleton instance for convenience
export const gameApiService = new GameApiService();