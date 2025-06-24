/**
 * useGameState - Central game state management hook
 * Manages the core game state including game data, status, and error handling
 */

import { useState, useCallback } from 'react';
import {
  PlayPageGame,
  GameStatus,
  ViewMode
} from '@/client/types/game.types';

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
 * Central game state management hook
 * Provides state and actions for managing game data, status, and UI state
 */
export function useGameState(): GameState & GameStateActions {
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
      
      // Rule 3: Transition from creatingGame_WaitingForData
      if (prevStatus === 'creatingGame_WaitingForData' && gameData.synopsis) {
        // If game creation results in immediate options, 'idle' rule (Rule 2) would have already handled it.
        // Otherwise, it's ready to be started.
        console.log("Transitioning status from 'creatingGame_WaitingForData' to 'game_ReadyToStart'");
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
         
         // If synopsis exists but no options available, check further:
         if (gameData.synopsis) {
            // If no scenes yet, or last scene has consequences and no new options for the player,
            // it's ready to start/restart (if applicable) or indicates the game flow is waiting for next scene generation.
            if (!currentLastScene || (currentLastScene.consequences && !currentLastTurn?.options)) {
                console.log("Transitioning status from 'loadingGame_WaitingForData' to 'game_ReadyToStart' (loaded, no immediate player actions, or only synopsis/completed scene)");
                return 'game_ReadyToStart';
            }
         }
         // If it has active scenes/turns but no options (and not game over), it's some other active state.
         // This implies the game is waiting for an AI turn or some other resolution.
         console.log(`Loaded game from 'loadingGame_WaitingForData'. Not 'idle', 'game_Over', or 'game_ReadyToStart'. Game has scenes/turns. Current prevStatus: ${prevStatus}.`);
         // Let it fall through to Rule 5 or default. The 'idle' and 'game_Over' checks are primary.
      }
      
      // Rule 5: If it was a specific "active waiting" state (e.g., turn_Resolving, startingGame_WaitingForFirstTurn)
      // and new data arrives that doesn't shift to 'idle' or 'game_Over',
      // it might still be in that waiting state or has transitioned to another waiting state.
      // The 'idle' (Rule 2) and 'game_Over' (Rule 1) rules should take precedence and are checked earlier.
      const activeWaitingStates: GameStatus[] = [
        'turn_Resolving',
        'turn_GeneratingNext',
        'scene_GeneratingNext',
        'startingGame_WaitingForFirstTurn',
        'contentGen_Characters_WaitingForData',
        'contentGen_Settings_WaitingForData'
        // 'creatingGame_WaitingForData' and 'loadingGame_WaitingForData' are handled by specific rules above if they transition.
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

      // Rule 6: Transition from 'startingGame_InProgress' if data arrives
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
      // This is important for states like 'turn_Submitting', 'creatingGame_InProgress', etc.,
      // where an SSE update might be a partial one not meant to change the overall client-side status yet.
      console.log(`updateGameFromSSE: No specific status transition rule met for prevStatus='${prevStatus}'. Retaining status '${prevStatus}'.`);
      return prevStatus; // Default: keep current status if no other rule applies
    });
  }, [/* setGameStatusInternal is stable, no dependencies needed for functional update */]);

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

/**
 * Utility function to determine processing state
 */
export function getProcessingState(gameStatus: GameStatus): {
  isProcessing: boolean;
  isWaitingForSSEResponse: boolean;
} {
  const processingStatuses: GameStatus[] = [
    'creatingGame_InProgress',
    'loadingGame_WaitingForData',
    'recreatingGame_InProgress',
    'startingGame_InProgress',
    'turn_Submitting'
  ];

  const waitingForSSEStatuses: GameStatus[] = [
    'creatingGame_WaitingForData',
    'recreatingGame_WaitingForData',
    'contentGen_Characters_WaitingForData',
    'contentGen_Settings_WaitingForData',
    'startingGame_WaitingForFirstTurn',
    'turn_Resolving',
    'turn_GeneratingNext',
    'scene_GeneratingNext'
  ];

  return {
    isProcessing: processingStatuses.includes(gameStatus),
    isWaitingForSSEResponse: waitingForSSEStatuses.includes(gameStatus)
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