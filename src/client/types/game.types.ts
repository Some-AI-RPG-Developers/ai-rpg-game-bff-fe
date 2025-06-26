/**
 * Enhanced type definitions for the AI RPG Game application
 * Extends base API types with UI-specific augmentations and utility types
 */

/**
 * Objective step status representing the possible states of a game objective step
 */
export enum ObjectiveStepStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

import {
  Character,
  CharacterOptions as GameCharacterOption,
  ChosenCharacterAction,
  Game,
  NewGame,
  NewTurn,
  ObjectiveStep,
  Scene,
  Turn
} from '@/server/types/rest/api.alias.types';

/**
 * Game status representing the unified state machine for game lifecycle
 */
export type GameStatus =
  | 'idle' // Default, or ready for user input on a new turn
  | 'creatingGame_InProgress' // POST /api/v1/games (client-side loading)
  | 'creatingGame_WaitingForCharacters' // After POST /api/v1/games, waiting for SSE for character generation
  | 'creatingGame_WaitingForSynopsis' // After characters received, waiting for SSE for synopsis generation
  | 'loadingGame_WaitingForData' // Game ID known (e.g. resume), waiting for SSE for game data
  | 'recreatingGame_InProgress' // POST /api/v1/games?gameId=... (client-side loading)
  | 'recreatingGame_WaitingForData' // After recreation trigger, waiting for SSE for synopsis
  | 'startingGame_InProgress' // POST /api/v1/games/{id} (to start it, client-side loading)
  | 'startingGame_WaitingForScene' // After POST to start, waiting for first scene via SSE
  | 'startingGame_WaitingForFirstTurn' // After scene received, waiting for first turn options via SSE
  | 'submittingTurn_InProgress' // Player submitted turn, PUT /turns in progress (client-side loading)
  | 'submittingTurn_WaitingForTurnResolution' // Turn submitted (PUT complete), waiting for consequences via SSE
  | 'submittingTurn_WaitingForNewScene' // Turn consequences received, scene completed, waiting for new scene via SSE
  | 'submittingTurn_WaitingForNewTurn' // Scene/consequences received, waiting for new turn options via SSE
  | 'turn_Creating' // Creating new turn, POST /turns in progress (client-side loading)
  | 'contentGen_Characters_WaitingForData' // Game loaded, but characters missing, waiting for SSE
  | 'contentGen_Settings_WaitingForData' // Game loaded, characters present, but synopsis missing, waiting for SSE
  | 'error_GameSetupFailed' // An error occurred that prevents game from starting/continuing
  | 'game_ReadyToStart' // New status: Game created/loaded, synopsis present, ready for "Start Game" action
  | 'game_Over'; // Game has concluded

/**
 * Extended Turn interface with UI-specific augmentations
 */
export interface PlayPageTurn extends Turn {
  turnNumber?: number;
}

/**
 * Extended Scene interface with UI-specific augmentations
 */
export interface PlayPageScene extends Scene {
  sceneNumber?: number;
  turns: PlayPageTurn[];
}

/**
 * Extended Game interface with UI-specific augmentations
 */
export interface PlayPageGame extends Game {
  scenes: PlayPageScene[];
}

/**
 * Character input configuration for game creation
 */
export interface CharacterInput {
  name: string;
  characterPrompt: string;
}

/**
 * Game creation form data structure
 */
export interface GameCreationData {
  gamePrompt: string;
  maxScenesNumber: number;
  characters: CharacterInput[];
}

/**
 * Character action selection state
 */
export interface CharacterActionSelection {
  selectedOptions: Record<string, string>;
  freeTextInputs: Record<string, string>;
}

/**
 * View mode for the main UI state
 */
export type ViewMode = 'choice' | 'create' | 'resume';

/**
 * Game state processing flags
 */
export interface GameProcessingState {
  isProcessing: boolean;
  isWaitingForSSEResponse: boolean;
}

/**
 * SSE event data structure
 */
export interface GameSSEEvent {
  data: string;
  type?: string;
}

/**
 * Game service response wrapper
 */
export interface GameServiceResponse<T = unknown> {
  status: number;
  data?: T;
  error?: string;
}

/**
 * API error response structure
 */
export interface GameApiError {
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

/**
 * Character validation result
 */
export interface CharacterValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Game form validation result
 */
export interface GameFormValidationResult {
  isValid: boolean;
  errors: {
    gamePrompt?: string;
    maxScenes?: string;
    characters?: string[];
  };
}

/**
 * Turn submission validation result
 */
export interface TurnSubmissionValidationResult {
  isValid: boolean;
  characterActions: ChosenCharacterAction[];
  errors: string[];
}

// Re-export commonly used types for convenience
export type {
  Game,
  Scene,
  Turn,
  Character,
  NewGame,
  NewTurn,
  ChosenCharacterAction,
  GameCharacterOption,
  ObjectiveStep
};