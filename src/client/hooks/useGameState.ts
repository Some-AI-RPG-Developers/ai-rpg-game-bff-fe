/**
 * useGameState - Comprehensive game state management hook
 * Handles all aspects of game state including data, status, SSE integration, and game service operations
 */

import {useCallback, useEffect, useState} from 'react';
import {GameStatus, NewGame, PlayPageGame, ViewMode} from '@/client/types/game.types';
import {GameService} from '@/client/services/GameService';

/**
 * Game state interface
 */
export interface GameState {
  game: PlayPageGame | null;
  gameId: string | null;
  error: string | null;
  gameStatus: GameStatus;
  viewMode: ViewMode;
}

/**
 * Game state actions interface
 */
export interface GameStateActions {
  setGame: (game: PlayPageGame | null) => void;
  setGameId: (gameId: string | null) => void;
  setError: (error: string | null) => void;
  setGameStatus: (status: GameStatus) => void;
  setViewMode: (mode: ViewMode) => void;
  clearError: () => void;
  resetGameState: () => void;
  updateGameFromSSE: (gameData: PlayPageGame, oldGame: PlayPageGame | null) => void;
}

/**
 * Game service integration configuration
 */
export interface GameServiceConfig {
  gameService: GameService;
}

/**
 * Initial game state
 */
const initialGameState: GameState = {
  game: null,
  gameId: null,
  error: null,
  gameStatus: 'idle',
  viewMode: 'choice'
};

/**
 * Comprehensive game state management hook
 * Provides state, actions, and service integration for managing all aspects of game state
 */
export function useGameState(config?: GameServiceConfig): GameState & GameStateActions {
  const [game, setGameInternal] = useState<PlayPageGame | null>(initialGameState.game);
  const [gameId, setGameIdInternal] = useState<string | null>(initialGameState.gameId);
  const [error, setErrorInternal] = useState<string | null>(initialGameState.error);
  const [gameStatus, setGameStatusInternal] = useState<GameStatus>(initialGameState.gameStatus);
  const [viewMode, setViewModeInternal] = useState<ViewMode>(initialGameState.viewMode);

  /**
   * Sets the game data
   */
  const setGame = useCallback((newGame: PlayPageGame | null) => {
    setGameInternal(newGame);
  }, []);

  /**
   * Sets the game ID
   */
  const setGameId = useCallback((newGameId: string | null) => {
    setGameIdInternal(newGameId);
  }, []);

  /**
   * Sets an error message
   */
  const setError = useCallback((newError: string | null) => {
    setErrorInternal(newError);
  }, []);

  /**
   * Sets the game status
   */
  const setGameStatus = useCallback((newStatus: GameStatus) => {
    setGameStatusInternal(newStatus);
  }, []);

  /**
   * Sets the view mode
   */
  const setViewMode = useCallback((newMode: ViewMode) => {
    setViewModeInternal(newMode);
  }, []);

  /**
   * Clears the current error
   */
  const clearError = useCallback(() => {
    setErrorInternal(null);
  }, []);

  /**
   * Resets the entire game state to initial values
   */
  const resetGameState = useCallback(() => {
    setGameInternal(initialGameState.game);
    setGameIdInternal(initialGameState.gameId);
    setErrorInternal(initialGameState.error);
    setGameStatusInternal(initialGameState.gameStatus);
    setViewModeInternal(initialGameState.viewMode);
  }, []);

  /**
   * Updates game state from SSE data with proper change detection
   */
  const updateGameFromSSE = useCallback((gameData: PlayPageGame, oldGame: PlayPageGame | null) => {
    // Update game data first
    setGameInternal(gameData);

    // Extract current scene and turn information for logging
    const newCurrentScene = gameData.scenes?.slice(-1)[0] || null;
    const newCurrentTurn = newCurrentScene?.turns?.slice(-1)[0] || null;

    // Log the game update for debugging
    console.log('Game updated via SSE:', {
      gameId: gameData.gameId,
      hasConclusion: !!gameData.conclusion,
      scenesCount: gameData.scenes?.length || 0,
      currentScene: newCurrentScene?.sceneId,
      currentTurn: newCurrentTurn?.turnId,
      turnHasOptions: !!newCurrentTurn?.options,
      turnHasConsequences: !!newCurrentTurn?.consequences,
      oldGameId: oldGame?.gameId
    });

    // --- Status Transition Logic ---
    setGameStatusInternal(prevStatus => {
      console.log(`updateGameFromSSE: prevStatus='${prevStatus}', new gameId='${gameData.gameId}', hasSynopsis='${!!gameData.synopsis}', hasConclusion='${!!gameData.conclusion}'`);
      
      // Handle game over
      if (gameData.conclusion) {
        console.log("Transitioning status to 'game_Over'");
        return 'game_Over';
      }

      const currentLastScene = gameData.scenes?.[gameData.scenes.length - 1];
      const currentLastTurn = currentLastScene?.turns?.[currentLastScene.turns.length - 1];

      // Rule 2: Player Input Required (transition to 'idle')
      // This rule should be checked early as it's a very specific and common state.
      if (currentLastTurn?.options && currentLastTurn.options.length > 0 && !currentLastTurn.consequences) {
        if (prevStatus !== 'idle') { // Log only if it's a change
          console.log("Transitioning status to 'idle' (player input required)");
        }
        return 'idle';
      }
      
      // Rule 3: Transition from creatingGame_WaitingForCharacters and creatingGame_WaitingForSynopsis
      if (prevStatus === 'creatingGame_WaitingForCharacters' && gameData.characters && gameData.characters.length > 0) {
        if (gameData.synopsis) {
          console.log("Transitioning status from 'creatingGame_WaitingForCharacters' to 'game_ReadyToStart' (characters and synopsis ready)");
          return 'game_ReadyToStart';
        } else {
          console.log("Transitioning status from 'creatingGame_WaitingForCharacters' to 'creatingGame_WaitingForSynopsis' (characters ready, waiting for synopsis)");
          return 'creatingGame_WaitingForSynopsis';
        }
      }
      
      if (prevStatus === 'creatingGame_WaitingForSynopsis' && gameData.synopsis) {
        // If game creation results in immediate options, 'idle' rule (Rule 2) would have already handled it.
        // Otherwise, it's ready to be started.
        console.log("Transitioning status from 'creatingGame_WaitingForSynopsis' to 'game_ReadyToStart'");
        return 'game_ReadyToStart';
      }
      
      // Rule 4: Transition from loadingGame_WaitingForData (resume game)
      if (prevStatus === 'loadingGame_WaitingForData' && gameData.gameId) {
         // If game is over, 'game_Over' rule (Rule 1) already handled it.
         
         // Check if player input is required (current turn has options)
         if (currentLastTurn?.options && currentLastTurn.options.length > 0) {
            console.log("Transitioning status from 'loadingGame_WaitingForData' to 'idle' (loaded game with player options available)");
            return 'idle';
         }
         
         // Check game creation completeness
         if (!gameData.characters || gameData.characters.length === 0) {
            console.log("Transitioning status from 'loadingGame_WaitingForData' to 'creatingGame_WaitingForCharacters' (loaded game missing characters)");
            return 'creatingGame_WaitingForCharacters';
         }
         
         if (!gameData.synopsis) {
            console.log("Transitioning status from 'loadingGame_WaitingForData' to 'creatingGame_WaitingForSynopsis' (loaded game missing synopsis)");
            return 'creatingGame_WaitingForSynopsis';
         }
         
         // If synopsis exists but no options available, check further:
         if (gameData.synopsis) {
            // If no scenes yet, or last scene has consequences and no new options for the player,
            // OR if scene exists but has no playable turns, it's ready to start/restart
            if (!currentLastScene || 
                (currentLastScene.consequences && !currentLastTurn?.options) ||
                (!currentLastScene.turns || currentLastScene.turns.length === 0 || 
                 (currentLastScene.turns.length > 0 && (!currentLastScene.turns[0].options || currentLastScene.turns[0].options.length === 0)))) {
                console.log("Transitioning status from 'loadingGame_WaitingForData' to 'game_ReadyToStart' (loaded, no immediate player actions, or incomplete scene)");
                return 'game_ReadyToStart';
            }
         }
         // If it has active scenes/turns but no options (and not game over), it's some other active state.
         // This implies the game is waiting for an AI turn or some other resolution.
         console.log(`Loaded game from 'loadingGame_WaitingForData'. Not 'idle', 'game_Over', or 'game_ReadyToStart'. Game has scenes/turns. Current prevStatus: ${prevStatus}.`);
         // Let it fall through to Rule 5 or default. The 'idle' and 'game_Over' checks are primary.
      }
      
      // Rule 5: Handle incomplete game start - scene exists but no playable turn
      // This can happen if scene generation succeeded but turn generation failed
      if (gameData.synopsis && gameData.scenes && gameData.scenes.length > 0) {
        const latestScene = gameData.scenes[gameData.scenes.length - 1];
        // If scene exists but has no turns, or turns exist but have no options, return to ready state
        if (!latestScene.turns || latestScene.turns.length === 0 || 
            (latestScene.turns.length > 0 && (!latestScene.turns[0].options || latestScene.turns[0].options.length === 0))) {
          // Only transition to game_ReadyToStart if we're not already in a waiting state
          // (to avoid interrupting active generation processes)
          if (!['startingGame_WaitingForScene', 'startingGame_WaitingForFirstTurn', 'startingGame_InProgress'].includes(prevStatus)) {
            console.log("Transitioning to 'game_ReadyToStart' (scene exists but no playable turn - allowing retry)");
            return 'game_ReadyToStart';
          }
        }
      }
      
      // Rule 6: Handle startingGame transitions
      if (prevStatus === 'startingGame_WaitingForScene' && gameData.scenes && gameData.scenes.length > 0) {
        const latestScene = gameData.scenes[gameData.scenes.length - 1];
        console.log(`startingGame_WaitingForScene transition. Scene exists:`, {
          sceneId: latestScene.sceneId,
          hasTurns: !!(latestScene.turns && latestScene.turns.length > 0),
          turnsCount: latestScene.turns?.length || 0
        });
        
        if (latestScene.turns && latestScene.turns.length > 0) {
          const latestTurn = latestScene.turns[latestScene.turns.length - 1];
          console.log(`startingGame_WaitingForScene transition. Scene has turns. Latest turn:`, {
            turnId: latestTurn.turnId,
            hasOptions: !!(latestTurn.options && latestTurn.options.length > 0),
            optionsCount: latestTurn.options?.length || 0
          });
          
          if (latestTurn.options && latestTurn.options.length > 0) {
            console.log("Transitioning status from 'startingGame_WaitingForScene' to 'idle' (first turn options available)");
            return 'idle';
          } else {
            console.log("Transitioning status from 'startingGame_WaitingForScene' to 'startingGame_WaitingForFirstTurn' (scene created, waiting for turn options)");
            return 'startingGame_WaitingForFirstTurn';
          }
        } else {
          // Scene exists but has no turns - this means the scene was already generated 
          // and now we need to wait for the first turn to be created
          console.log("Transitioning status from 'startingGame_WaitingForScene' to 'startingGame_WaitingForFirstTurn' (scene already exists, waiting for first turn)");
          return 'startingGame_WaitingForFirstTurn';
        }
      }
      
      // Rule 7: If it was a specific "active waiting" state (e.g., submittingTurn_WaitingForTurnResolution, startingGame_WaitingForFirstTurn)
      // and new data arrives that doesn't shift to 'idle' or 'game_Over',
      // it might still be in that waiting state or has transitioned to another waiting state.
      // The 'idle' (Rule 2) and 'game_Over' (Rule 1) rules should take precedence and are checked earlier.
      const activeWaitingStates: GameStatus[] = [
        'submittingTurn_WaitingForTurnResolution',
        'submittingTurn_WaitingForNewScene',
        'submittingTurn_WaitingForNewTurn',
        'turn_Creating',
        'startingGame_WaitingForScene',
        'startingGame_WaitingForFirstTurn',
        'contentGen_Characters_WaitingForData',
        'contentGen_Settings_WaitingForData'
        // 'creatingGame_WaitingForCharacters', 'creatingGame_WaitingForSynopsis' and 'loadingGame_WaitingForData' are handled by specific rules above if they transition.
      ];
      if (activeWaitingStates.includes(prevStatus)) {
        // If we are in these states and receive new game data:
        // - If new data has options -> 'idle' (handled by Rule 2)
        // - If new data has conclusion -> 'game_Over' (handled by Rule 1)
        // - Otherwise, the game is still processing or waiting for the next automatic step from AI.
        //   In this case, retaining the 'prevStatus' is often correct, as the AI is still working,
        //   unless the backend explicitly sends a new status with the game data.
        console.log(`Data received while in active waiting state '${prevStatus}'. Not transitioning to idle/game_over. Retaining status '${prevStatus}'.`);
        return prevStatus;
      }

      // Rule 8: Transition from 'startingGame_InProgress' if data arrives
      // (assuming 'startingGame_InProgress' is set before an API call, and SSE provides the first turn)
      if (prevStatus === 'startingGame_InProgress' && gameData.gameId) {
        // Rule 2 ('idle') would catch if options are present.
        // Rule 1 ('game_Over') would catch if game somehow ends immediately.
        // If neither, but we have scenes, it means the game has started and is active.
        // If it's waiting for the first turn options, it should be 'startingGame_WaitingForFirstTurn'.
        // This state is usually set by GameService after the API call.
        // If SSE delivers the first turn directly, Rule 2 handles it.
        // If SSE delivers game data without options yet, it might be 'startingGame_WaitingForFirstTurn'.
        // This logic might be better handled by explicit status setting in GameService.
        // For now, if it was 'startingGame_InProgress' and we get data, and it's not 'idle' or 'game_Over',
        // it's likely now waiting for the first turn if not already 'idle'.
        if (!currentLastTurn?.options) {
             console.log(`Transitioning status from '${prevStatus}' to 'startingGame_WaitingForFirstTurn' (game started, awaiting first turn options)`);
            return 'startingGame_WaitingForFirstTurn';
        }
        // if options are present, Rule 2 (idle) already handled it.
      }

      // Default: if no other rule applies, retain the previous status.
      // This is important for states like 'submittingTurn_InProgress', 'creatingGame_InProgress', etc.,
      // where an SSE update might be a partial one not meant to change the overall client-side status yet.
      console.log(`updateGameFromSSE: No specific status transition rule met for prevStatus='${prevStatus}'. Retaining status '${prevStatus}'.`);
      return prevStatus; // Default: keep current status if no other rule applies
    });
  }, [/* setGameStatusInternal is stable, no dependencies needed for functional update */]);

  // Auto-transition effect: Handle status changes that need immediate evaluation
  // This handles cases where status changes but no SSE event is triggered
  useEffect(() => {
    // When status changes to startingGame_WaitingForScene, check if we should immediately 
    // transition to startingGame_WaitingForFirstTurn if a scene already exists
    if (gameStatus === 'startingGame_WaitingForScene' && game && game.scenes && game.scenes.length > 0) {
      const latestScene = game.scenes[game.scenes.length - 1];
      if (!latestScene.turns || latestScene.turns.length === 0) {
        console.log("Auto-transition: Scene exists but has no turns. Transitioning from 'startingGame_WaitingForScene' to 'startingGame_WaitingForFirstTurn'");
        setGameStatusInternal('startingGame_WaitingForFirstTurn');
      }
    }
  }, [gameStatus, game]);

  // Game service integration effects
  useEffect(() => {
    if (!config?.gameService) return;

    // Initialize the game service with callbacks
    config.gameService.initialize({
      onGameUpdate: (gameData: PlayPageGame) => {
        updateGameFromSSE(gameData, game);
      },
      onStatusChange: setGameStatus,
      onError: setError
    });

    return () => {};
  }, [config?.gameService, updateGameFromSSE, game, setGameStatus, setError]);

  // Game recreation management effect
  useEffect(() => {
    if (!game || !gameId || !config?.gameService) return;

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
          language: game.language,
          characters: game.characters.map(c => ({
            name: c.name,
            characterPrompt: c.prompt || `Default prompt for ${c.name}`,
          })),
        };

        // Use the game service to recreate content
        config.gameService.recreateGameContent(newGamePayload, game.gameId)
          .then(result => {
            if (result.status !== 200) {
              console.error(`Recreation error for ${game.gameId}:`, result.error);
              const currentError = result.error || 'Error re-initializing game content.';
              setError(currentError);
              setGameStatus('error_GameSetupFailed');
            }
            // Success case is handled by the service internally
          })
          .catch(error => {
            console.error(`Recreation error for ${game.gameId}:`, error);
            setError('Error re-initializing game content.');
            setGameStatus('error_GameSetupFailed');
          });
      } else {
        console.warn(`Recreation Trigger: Cannot re-trigger game ${game.gameId}, missing initial data. Current gameStatus: ${gameStatus}`);
        // Could optionally set an error here if critical data is missing
      }
    } else if (game.synopsis && gameStatus === 'recreatingGame_WaitingForData') {
      // If synopsis arrived while we were waiting for recreation data, transition to idle
      console.log(`Recreation Trigger: Synopsis received for ${game.gameId} while waiting for recreation. Transitioning to idle.`);
      setGameStatus('idle');
    }
  }, [game, gameId, gameStatus, config?.gameService, setError, setGameStatus]);

  return {
    // State
    game,
    gameId,
    error,
    gameStatus,
    viewMode,
    
    // Actions
    setGame,
    setGameId,
    setError,
    setGameStatus,
    setViewMode,
    clearError,
    resetGameState,
    updateGameFromSSE
  };
}

// =============================================================================
// STATUS UTILITY FUNCTIONS
// =============================================================================

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
    'submittingTurn_InProgress',
    'submittingTurn_WaitingForTurnResolution',
    'submittingTurn_WaitingForNewScene',
    'submittingTurn_WaitingForNewTurn',
    'turn_Creating',
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
    'submittingTurn_InProgress',
    'turn_Creating'
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
    'submittingTurn_WaitingForTurnResolution',
    'submittingTurn_WaitingForNewScene',
    'submittingTurn_WaitingForNewTurn'
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
    'submittingTurn_WaitingForTurnResolution',
    'submittingTurn_WaitingForNewScene',
    'submittingTurn_WaitingForNewTurn',
    'contentGen_Characters_WaitingForData',
    'contentGen_Settings_WaitingForData',
    'submittingTurn_InProgress',
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
      return 'Generating game synopsis...';
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
    case 'submittingTurn_InProgress':
      return 'Submitting turn... Please wait.';
    case 'submittingTurn_WaitingForTurnResolution':
      return 'Processing turn resolution...';
    case 'submittingTurn_WaitingForNewScene':
      return 'Generating next scene...';
    case 'submittingTurn_WaitingForNewTurn':
      return 'Generating next turn...';
    case 'turn_Creating':
      return 'Creating new turn...';
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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Utility function to determine processing state
 */
export function getProcessingState(gameStatus: GameStatus): {
  isProcessing: boolean;
  isWaitingForSSEResponse: boolean;
} {
  return {
    isProcessing: isProcessingStatus(gameStatus),
    isWaitingForSSEResponse: isWaitingForSSEStatus(gameStatus)
  };
}

/**
 * Utility function to get current scene and turn from game
 */
export function getCurrentSceneAndTurn(game: PlayPageGame | null) {
  if (!game || !game.scenes || game.scenes.length === 0) {
    return { currentScene: null, currentTurn: null };
  }

  const currentScene = game.scenes[game.scenes.length - 1];
  const currentTurn = currentScene?.turns && currentScene.turns.length > 0 
    ? currentScene.turns[currentScene.turns.length - 1] 
    : null;

  return { currentScene, currentTurn };
}

/**
 * Utility function to check if all characters made choices
 */
export function checkAllCharactersMadeChoice(
  currentTurn: PlayPageGame['scenes'][0]['turns'][0] | null,
  selectedOptions: Record<string, string>
): boolean {
  if (!currentTurn?.options) return false;
  
  return currentTurn.options.every(
    (charOpt) => selectedOptions[charOpt.name]
  );
}