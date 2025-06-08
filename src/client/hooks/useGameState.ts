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

    // The status transition logic will be handled by the GameService
    // This hook focuses on state management, not business logic
  }, []);

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