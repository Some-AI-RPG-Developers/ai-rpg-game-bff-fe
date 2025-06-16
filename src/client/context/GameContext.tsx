/**
 * GameContext - Context provider for game state management
 * Provides centralized game state and operations throughout the component tree
 */

'use client';

import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {GameService} from '@/client/services/GameService';
import {getCurrentSceneAndTurn, getProcessingState, useGameState} from '@/client/hooks/useGameState';
import {useGameForm} from '@/client/hooks/useGameForm';
import {useCharacterActions} from '@/client/hooks/useCharacterActions';
import {useGameRecreation, useGameStatus} from '@/client/hooks/useGameStatus';
import {GameStatus, PlayPageGame, ViewMode} from '@/client/types/game.types';

/**
 * Game context value interface
 */
export interface GameContextValue {
  // Game state
  game: PlayPageGame | null;
  gameId: string | null;
  error: string | null;
  gameStatus: GameStatus;
  viewMode: ViewMode;
  
  // Processing indicators
  isProcessing: boolean;
  isWaitingForSSEResponse: boolean;
  
  // Current game elements
  currentScene: PlayPageGame['scenes'][0] | null;
  currentTurn: PlayPageGame['scenes'][0]['turns'][0] | null;
  
  // Form state
  gamePromptInput: string;
  maxScenesInput: number;
  charactersInput: Array<{ name: string; characterPrompt: string }>;
  resumeGameIdInput: string;
  
  // Character actions state
  selectedOptions: Record<string, string>;
  freeTextInputs: Record<string, string>;
  allCharactersMadeChoice: boolean;
  
  // Game operations
  createGame: () => Promise<void>;
  loadGameById: () => void;
  startGame: () => Promise<void>;
  submitTurn: () => Promise<void>;
  
  // Form operations
  setGamePromptInput: (value: string) => void;
  setMaxScenesInput: (value: number) => void;
  handleCharacterInputChange: (index: number, field: 'name' | 'characterPrompt', value: string) => void;
  handleAddCharacterInput: () => void;
  handleRemoveCharacterInput: (index: number) => void;
  setResumeGameIdInput: (value: string) => void;
  
  // Character action operations
  handleOptionChange: (characterName: string, optionValue: string) => void;
  handleFreeTextChange: (characterName: string, text: string) => void;
  
  // UI operations
  setViewMode: (mode: ViewMode) => void;
  clearError: () => void;
  resetGame: () => void;
}

/**
 * Game context
 */
const GameContext = createContext<GameContextValue | null>(null);

/**
 * Game service singleton instance
 */
const gameService = new GameService();

/**
 * Game context provider props
 */
export interface GameContextProviderProps {
  children: React.ReactNode;
}

/**
 * Game context provider component
 */
export function GameContextProvider({ children }: Readonly<GameContextProviderProps>) {
  // Initialize hooks
  const gameState = useGameState();
  const gameForm = useGameForm();
  const characterActions = useCharacterActions();
  
  // Setup game status management
  const handleGameUpdate = useCallback((gameData: PlayPageGame) => {
    gameState.updateGameFromSSE(gameData, gameState.game);
  }, [gameState]);

  const gameStatusConfig = useMemo(() => ({
    gameService,
    onGameUpdate: handleGameUpdate,
    onStatusChange: gameState.setGameStatus,
    onError: gameState.setError
  }), [gameService, handleGameUpdate, gameState.setGameStatus, gameState.setError]);
  
  useGameStatus(gameStatusConfig);
  
  // Setup game recreation management
  useGameRecreation({
    game: gameState.game,
    gameId: gameState.gameId,
    gameStatus: gameState.gameStatus,
    gameService,
    onStatusChange: gameState.setGameStatus,
    onError: gameState.setError
  });

  // Derived state
  const { currentScene, currentTurn } = getCurrentSceneAndTurn(gameState.game);
  const { isProcessing, isWaitingForSSEResponse } = getProcessingState(gameState.gameStatus);
  const allCharactersMadeChoice = characterActions.checkAllCharactersMadeChoice(currentTurn);

  /**
   * Creates a new game
   */
  const createGame = useCallback(async () => {
    const validation = gameForm.validateGameCreation();
    if (!validation.isValid) {
      gameState.setError(validation.errors.join(' '));
      return;
    }

    gameState.clearError();
    const gameData = gameForm.getGameCreationData();
    
    const result = await gameService.createGame(gameData);
    
    if (result.success && result.data) {
      gameState.setGameId(result.data.gameId);
    } else {
      gameState.setError(result.error ?? 'Failed to create game');
    }
  }, [gameForm, gameState]);

  /**
   * Loads a game by ID
   */
  const loadGameById = useCallback(() => {
    const validation = gameForm.validateResumeGameId();
    if (!validation.isValid) {
      gameState.setError(validation.errors.join(' '));
      return;
    }

    gameState.clearError();
    gameState.setGame(null); // Clear any existing game data
    const newGameId = gameForm.resumeGameIdInput.trim();
    gameState.setGameId(newGameId);
    gameService.loadGameById(newGameId);
  }, [gameForm, gameState]);

  /**
   * Starts the current game
   */
  const startGame = useCallback(async () => {
    if (!gameState.gameId) return;
    
    gameState.clearError();
    const result = await gameService.startGame();
    
    if (!result.success) {
      gameState.setError(result.error ?? 'Failed to start game');
    }
  }, [gameState]);

  /**
   * Submits a turn
   */
  const submitTurn = useCallback(async () => {
    const validation = characterActions.validateTurnSubmission(currentTurn);
    if (!validation.isValid) {
      gameState.setError(validation.errors.join(' '));
      return;
    }

    const turnData = characterActions.prepareTurnData(currentTurn);
    if (!turnData) {
      gameState.setError('Failed to prepare turn data');
      return;
    }

    gameState.clearError();
    const result = await gameService.submitTurn(turnData);
    
    if (result.success) {
      characterActions.clearSelections();
    } else {
      gameState.setError(result.error ?? 'Failed to submit turn');
    }
  }, [characterActions, currentTurn, gameState]);

  /**
   * Resets the entire game state
   */
  const resetGame = useCallback(() => {
    gameService.disconnect();
    gameState.resetGameState();
    gameForm.resetForm();
    characterActions.resetCharacterActions();
  }, [gameState, gameForm, characterActions]);

  // Context value
  const contextValue: GameContextValue = {
    // Game state
    game: gameState.game,
    gameId: gameState.gameId,
    error: gameState.error,
    gameStatus: gameState.gameStatus,
    viewMode: gameState.viewMode,
    
    // Processing indicators
    isProcessing,
    isWaitingForSSEResponse,
    
    // Current game elements
    currentScene,
    currentTurn,
    
    // Form state
    gamePromptInput: gameForm.gamePromptInput,
    maxScenesInput: gameForm.maxScenesInput,
    charactersInput: gameForm.charactersInput,
    resumeGameIdInput: gameForm.resumeGameIdInput,
    
    // Character actions state
    selectedOptions: characterActions.selectedOptions,
    freeTextInputs: characterActions.freeTextInputs,
    allCharactersMadeChoice,
    
    // Game operations
    createGame,
    loadGameById,
    startGame,
    submitTurn,
    
    // Form operations
    setGamePromptInput: gameForm.setGamePromptInput,
    setMaxScenesInput: gameForm.setMaxScenesInput,
    handleCharacterInputChange: gameForm.handleCharacterInputChange,
    handleAddCharacterInput: gameForm.handleAddCharacterInput,
    handleRemoveCharacterInput: gameForm.handleRemoveCharacterInput,
    setResumeGameIdInput: gameForm.setResumeGameIdInput,
    
    // Character action operations
    handleOptionChange: characterActions.handleOptionChange,
    handleFreeTextChange: characterActions.handleFreeTextChange,
    
    // UI operations
    setViewMode: gameState.setViewMode,
    clearError: gameState.clearError,
    resetGame
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook to use the game context
 */
export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGameContext must be used within a GameContextProvider');
  }
  
  return context;
}

/**
 * Higher-order component to provide game context
 */
export function withGameContext<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    return (
      <GameContextProvider>
        <Component {...props} />
      </GameContextProvider>
    );
  };
  
  WrappedComponent.displayName = `withGameContext(${Component.displayName ?? Component.name})`;
  
  return WrappedComponent;
}