/**
 * UI-specific type definitions for the AI RPG Game application
 * Contains types for component state, form handling, and UI interactions
 */

import { GameStatus, CharacterInput, PlayPageGame } from '@/client/types/game.types';

/**
 * Main game UI state interface
 */
export interface GameUIState {
  game: PlayPageGame | null;
  gameId: string | null;
  error: string | null;
  gameStatus: GameStatus;
  viewMode: ViewMode;
}

/**
 * Character action UI state
 */
export interface CharacterActionUIState {
  selectedOptions: Record<string, string>;
  freeTextInputs: Record<string, string>;
}

/**
 * Game creation form state
 */
export interface GameCreationFormState {
  gamePromptInput: string;
  maxScenesInput: number;
  charactersInput: CharacterInput[];
}

/**
 * Resume game form state
 */
export interface ResumeGameFormState {
  resumeGameIdInput: string;
}

/**
 * View modes for the main UI
 */
export type ViewMode = 'choice' | 'create' | 'resume';

/**
 * Form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string | string[]>;
}

/**
 * Character form field types
 */
export type CharacterFormField = 'name' | 'characterPrompt';

/**
 * UI event handlers interface
 */
export interface GameUIHandlers {
  // Game creation handlers
  onCreateGame: () => Promise<void>;
  onStartGame: () => Promise<void>;
  onLoadGameById: () => void;
  
  // Form handlers
  onGamePromptChange: (value: string) => void;
  onMaxScenesChange: (value: number) => void;
  onCharacterInputChange: (index: number, field: CharacterFormField, value: string) => void;
  onAddCharacterInput: () => void;
  onRemoveCharacterInput: (index: number) => void;
  onResumeGameIdChange: (value: string) => void;
  
  // Character action handlers
  onOptionChange: (characterName: string, optionValue: string) => void;
  onFreeTextChange: (characterName: string, text: string) => void;
  onSubmitTurn: () => Promise<void>;
  
  // Navigation handlers
  onViewModeChange: (mode: ViewMode) => void;
  onErrorClear: () => void;
}

/**
 * Processing state indicators
 */
export interface ProcessingIndicators {
  isProcessing: boolean;
  isWaitingForSSEResponse: boolean;
  isSubmittingTurn: boolean;
  isLoadingGame: boolean;
  isCreatingGame: boolean;
  isStartingGame: boolean;
}

/**
 * Game display state
 */
export interface GameDisplayState {
  currentScene: PlayPageGame['scenes'][0] | null;
  currentTurn: PlayPageGame['scenes'][0]['turns'][0] | null;
  allCharactersMadeChoice: boolean;
  canStartGame: boolean;
  canSubmitTurn: boolean;
  isGameOver: boolean;
}

/**
 * SSE connection state
 */
export interface SSEConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastError: string | null;
  connectionUrl: string | null;
}

/**
 * Component props interfaces
 */

/**
 * Props for game creation form component
 */
export interface GameCreationFormProps {
  formState: GameCreationFormState;
  handlers: Pick<
    GameUIHandlers,
    | 'onCreateGame'
    | 'onGamePromptChange'
    | 'onMaxScenesChange'
    | 'onCharacterInputChange'
    | 'onAddCharacterInput'
    | 'onRemoveCharacterInput'
    | 'onViewModeChange'
  >;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Props for resume game form component
 */
export interface ResumeGameFormProps {
  formState: ResumeGameFormState;
  handlers: Pick<
    GameUIHandlers,
    | 'onLoadGameById'
    | 'onResumeGameIdChange'
    | 'onViewModeChange'
    | 'onErrorClear'
  >;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Props for character actions component
 */
export interface CharacterActionsProps {
  characterActionState: CharacterActionUIState;
  currentTurn: NonNullable<GameDisplayState['currentTurn']>;
  handlers: Pick<
    GameUIHandlers,
    | 'onOptionChange'
    | 'onFreeTextChange'
    | 'onSubmitTurn'
  >;
  canSubmit: boolean;
  isProcessing: boolean;
}

/**
 * Props for game display component
 */
export interface GameDisplayProps {
  game: PlayPageGame;
  gameStatus: GameStatus;
  displayState: GameDisplayState;
  characterActionState: CharacterActionUIState;
  handlers: Pick<
    GameUIHandlers,
    | 'onStartGame'
    | 'onOptionChange'
    | 'onFreeTextChange'
    | 'onSubmitTurn'
  >;
  processingIndicators: ProcessingIndicators;
}

/**
 * Props for status message component
 */
export interface StatusMessageProps {
  gameStatus: GameStatus;
  gameId: string | null;
  isProcessing: boolean;
  isWaitingForSSEResponse: boolean;
  error: string | null;
}