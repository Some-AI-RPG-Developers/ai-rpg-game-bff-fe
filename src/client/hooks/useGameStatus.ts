/**
 * useGameStatus - Game status state machine management hook
 * Handles the complex game status transitions and SSE integration
 */

import { useEffect, useCallback } from 'react';
import { GameService } from '@/client/services/GameService';
import {
  PlayPageGame,
  GameStatus,
  NewGame
} from '@/client/types/game.types';

/**
 * Game status management configuration
 */
export interface GameStatusConfig {
  gameService: GameService;
  onGameUpdate: (game: PlayPageGame) => void;
  onStatusChange: (status: GameStatus) => void;
  onError: (error: string) => void;
}

/**
 * Recreation trigger configuration
 */
export interface RecreationConfig {
  game: PlayPageGame | null;
  gameId: string | null;
  gameStatus: GameStatus;
}

/**
 * Game status management hook
 * Manages SSE connections, status transitions, and game recreation logic
 */
export function useGameStatus(config: GameStatusConfig) {
  const { gameService, onGameUpdate, onStatusChange, onError } = config;

  /**
   * Initialize the game service with callbacks
   */
  useEffect(() => {
    gameService.initialize({
      onGameUpdate,
      onStatusChange,
      onError
    });
    return () => {};
  }, [gameService, onGameUpdate, onStatusChange, onError]);

  /**
   * Determines the next game status based on game data and current status
   */
  const determineGameStatus = useCallback((
    gameData: PlayPageGame,
    oldGame: PlayPageGame | null
  ): GameStatus => {
    return gameService.determineGameStatus(gameData, oldGame);
  }, [gameService]);

  /**
   * Handles SSE game updates and status transitions
   */
  const handleSSEGameUpdate = useCallback((
    gameData: PlayPageGame,
    oldGame: PlayPageGame | null,
    currentStatus: GameStatus
  ) => {
    // Update game data first
    onGameUpdate(gameData);

    // Determine new status based on game data
    const newStatus = determineGameStatus(gameData, oldGame);
    
    if (newStatus !== currentStatus) {
      onStatusChange(newStatus);
    }
  }, [onGameUpdate, onStatusChange, determineGameStatus]);

  return {
    determineGameStatus,
    handleSSEGameUpdate
  };
}

/**
 * Game recreation management hook
 * Handles automatic game content recreation when necessary
 */
export function useGameRecreation(config: RecreationConfig & {
  gameService: GameService;
  onStatusChange: (status: GameStatus) => void;
  onError: (error: string) => void;
}) {
  const { game, gameId, gameStatus, gameService, onStatusChange, onError } = config;

  /**
   * Recreation trigger effect
   */
  useEffect(() => {
    if (!game || !gameId) return;

    // Only consider recreation if the game is loaded but incomplete,
    // and we are in a state where recreation makes sense
    const canConsiderRecreation =
      gameStatus === 'idle' ||
      gameStatus === 'contentGen_Characters_WaitingForData' ||
      gameStatus === 'contentGen_Settings_WaitingForData' ||
      gameStatus === 'error_GameSetupFailed';

    if (!game.synopsis && canConsiderRecreation) {
      // Check if we have the necessary data from the 'game' object to make the call
      if (game.gamePrompt && 
          typeof game.maxScenesNumber === 'number' && 
          game.characters && 
          game.characters.length > 0) {
        
        console.log(`Recreation Trigger: Game ${game.gameId} incomplete (no synopsis), status ${gameStatus}. Triggering recreation.`);

        const newGamePayload: NewGame = {
          gamePrompt: game.gamePrompt,
          maxScenesNumber: game.maxScenesNumber,
          characters: game.characters.map(c => ({
            name: c.name,
            characterPrompt: c.prompt || `Default prompt for ${c.name}`,
          })),
        };

        // Use the game service to recreate content
        gameService.recreateGameContent(newGamePayload, game.gameId)
          .then(result => {
            if (result.status !== 200) {
              console.error(`Recreation error for ${game.gameId}:`, result.error);
              const currentError = result.error || 'Error re-initializing game content.';
              onError(currentError);
              onStatusChange('error_GameSetupFailed');
            }
            // Success case is handled by the service internally
          })
          .catch(error => {
            console.error(`Recreation error for ${game.gameId}:`, error);
            onError('Error re-initializing game content.');
            onStatusChange('error_GameSetupFailed');
          });
      } else {
        console.warn(`Recreation Trigger: Cannot re-trigger game ${game.gameId}, missing initial data. Current gameStatus: ${gameStatus}`);
        // Could optionally set an error here if critical data is missing
      }
    } else if (game.synopsis && gameStatus === 'recreatingGame_WaitingForData') {
      // If synopsis arrived while we were waiting for recreation data, transition to idle
      console.log(`Recreation Trigger: Synopsis received for ${game.gameId} while waiting for recreation. Transitioning to idle.`);
      onStatusChange('idle');
    }
  }, [game, gameId, gameStatus, gameService, onStatusChange, onError]);
}

/**
 * Utility function to check if a status represents an active operation
 */
export function isActiveStatus(status: GameStatus): boolean {
  const activeStatuses: GameStatus[] = [
    'creatingGame_InProgress',
    'creatingGame_WaitingForCharacters',
    'creatingGame_WaitingForSynopsis',
    'loadingGame_WaitingForData',
    'recreatingGame_InProgress',
    'recreatingGame_WaitingForData',
    'startingGame_InProgress',
    'startingGame_WaitingForScene',
    'startingGame_WaitingForFirstTurn',
    'turn_Submitting',
    'turn_Resolving',
    'turn_GeneratingNext',
    'scene_GeneratingNext',
    'contentGen_Characters_WaitingForData',
    'contentGen_Settings_WaitingForData'
  ];
  
  return activeStatuses.includes(status);
}

/**
 * Utility function to check if a status represents a processing state
 */
export function isProcessingStatus(status: GameStatus): boolean {
  const processingStatuses: GameStatus[] = [
    'creatingGame_InProgress',
    'loadingGame_WaitingForData',
    'recreatingGame_InProgress',
    'startingGame_InProgress',
    'turn_Submitting'
  ];
  
  return processingStatuses.includes(status);
}

/**
 * Utility function to check if a status represents waiting for SSE
 */
export function isWaitingForSSEStatus(status: GameStatus): boolean {
  const waitingStatuses: GameStatus[] = [
    'creatingGame_WaitingForCharacters',
    'creatingGame_WaitingForSynopsis',
    'recreatingGame_WaitingForData',
    'contentGen_Characters_WaitingForData',
    'contentGen_Settings_WaitingForData',
    'startingGame_WaitingForScene',
    'startingGame_WaitingForFirstTurn',
    'turn_Resolving',
    'turn_GeneratingNext',
    'scene_GeneratingNext'
  ];
  
  return waitingStatuses.includes(status);
}

/**
 * Utility function to check if a status should trigger an error on SSE connection close
 */
export function shouldTriggerErrorOnSSEClose(status: GameStatus): boolean {
  const errorTriggerStatuses: GameStatus[] = [
    'creatingGame_WaitingForCharacters',
    'creatingGame_WaitingForSynopsis',
    'loadingGame_WaitingForData',
    'recreatingGame_WaitingForData',
    'startingGame_WaitingForScene',
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
  
  return errorTriggerStatuses.includes(status);
}

/**
 * Utility function to get user-friendly status messages
 */
export function getStatusMessage(status: GameStatus, gameId?: string | null): string {
  switch (status) {
    case 'creatingGame_InProgress':
      return 'Creating your game world...';
    case 'loadingGame_WaitingForData':
      return gameId ? `Loading game data for ${gameId}...` : 'Loading game data...';
    case 'recreatingGame_InProgress':
      return 'Re-initializing game content...';
    case 'creatingGame_WaitingForCharacters':
      return 'Generating characters...';
    case 'creatingGame_WaitingForSynopsis':
      return 'Generating game synopsis and objectives...';
    case 'recreatingGame_WaitingForData':
      return 'Re-initialization triggered. Waiting for updated game data...';
    case 'contentGen_Characters_WaitingForData':
      return 'Generating characters...';
    case 'contentGen_Settings_WaitingForData':
      return 'Generating game setting and synopsis...';
    case 'startingGame_InProgress':
      return 'Starting your adventure...';
    case 'startingGame_WaitingForScene':
      return 'Generating the opening scene...';
    case 'startingGame_WaitingForFirstTurn':
      return 'Creating first turn options...';
    case 'turn_Submitting':
      return 'Submitting turn... Please wait.';
    case 'turn_Resolving':
      return 'Processing turn resolution...';
    case 'turn_GeneratingNext':
      return 'Generating next turn...';
    case 'scene_GeneratingNext':
      return 'Generating next scene...';
    case 'error_GameSetupFailed':
      return 'Game setup encountered an issue. Please check other error messages or try again.';
    case 'game_ReadyToStart':
      return '';
    case 'game_Over':
      return 'Game completed!';
    case 'idle':
    default:
      return '';
  }
}