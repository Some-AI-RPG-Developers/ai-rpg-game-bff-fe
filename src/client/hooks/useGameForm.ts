/**
 * useGameForm - Handle form validation and character input management
 * Manages game creation form state, validation, and character input operations
 */

import { useState, useCallback } from 'react';
import { CharacterInput, GameCreationData } from '@/client/types/game.types';

/**
 * Game form state interface
 */
export interface GameFormState {
  gamePromptInput: string;
  maxScenesInput: number;
  charactersInput: CharacterInput[];
  resumeGameIdInput: string;
}

/**
 * Form validation results
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Game form actions interface
 */
export interface GameFormActions {
  setGamePromptInput: (value: string) => void;
  setMaxScenesInput: (value: number) => void;
  setCharactersInput: (characters: CharacterInput[]) => void;
  setResumeGameIdInput: (value: string) => void;
  handleCharacterInputChange: (index: number, field: 'name' | 'characterPrompt', value: string) => void;
  handleAddCharacterInput: () => void;
  handleRemoveCharacterInput: (index: number) => void;
  validateGameCreation: () => FormValidationResult;
  validateResumeGameId: () => FormValidationResult;
  getGameCreationData: () => GameCreationData;
  resetForm: () => void;
}

/**
 * Initial form state
 */
const initialFormState: GameFormState = {
  gamePromptInput: 'A fantasy adventure in a dark forest.',
  maxScenesInput: 5,
  charactersInput: [
    { name: 'Sir Roland', characterPrompt: 'A noble knight who values honor and courage above all else' },
    { name: 'Lady Elara', characterPrompt: 'A wise mage seeking to protect the realm with her magical powers' },
  ],
  resumeGameIdInput: ''
};

/**
 * Hook for managing game creation and resume forms
 */
export function useGameForm(): GameFormState & GameFormActions {
  const [gamePromptInput, setGamePromptInputInternal] = useState<string>(initialFormState.gamePromptInput);
  const [maxScenesInput, setMaxScenesInputInternal] = useState<number>(initialFormState.maxScenesInput);
  const [charactersInput, setCharactersInputInternal] = useState<CharacterInput[]>(initialFormState.charactersInput);
  const [resumeGameIdInput, setResumeGameIdInputInternal] = useState<string>(initialFormState.resumeGameIdInput);

  /**
   * Sets the game prompt input
   */
  const setGamePromptInput = useCallback((value: string) => {
    setGamePromptInputInternal(value);
  }, []);

  /**
   * Sets the max scenes input
   */
  const setMaxScenesInput = useCallback((value: number) => {
    setMaxScenesInputInternal(value);
  }, []);

  /**
   * Sets the characters input array
   */
  const setCharactersInput = useCallback((characters: CharacterInput[]) => {
    setCharactersInputInternal(characters);
  }, []);

  /**
   * Sets the resume game ID input
   */
  const setResumeGameIdInput = useCallback((value: string) => {
    console.log('useGameForm: setResumeGameIdInput called with value:', JSON.stringify(value));
    setResumeGameIdInputInternal(value);
  }, []);

  /**
   * Handles changes to character input fields
   */
  const handleCharacterInputChange = useCallback((
    index: number,
    field: 'name' | 'characterPrompt',
    value: string
  ) => {
    setCharactersInputInternal(prevCharacters => {
      const newCharacters = prevCharacters.map((char, i) => {
        if (i === index) {
          return { ...char, [field]: value };
        }
        return char;
      });
      return newCharacters;
    });
  }, []);

  /**
   * Adds a new character input
   */
  const handleAddCharacterInput = useCallback(() => {
    setCharactersInputInternal(prevCharacters => [
      ...prevCharacters,
      { name: '', characterPrompt: '' }
    ]);
  }, []);

  /**
   * Removes a character input by index
   */
  const handleRemoveCharacterInput = useCallback((index: number) => {
    setCharactersInputInternal(prevCharacters => 
      prevCharacters.filter((_, i) => i !== index)
    );
  }, []);

  /**
   * Validates game creation form data
   */
  const validateGameCreation = useCallback((): FormValidationResult => {
    const errors: string[] = [];

    if (!gamePromptInput.trim()) {
      errors.push("Game Prompt cannot be empty.");
    }

    if (maxScenesInput <= 0) {
      errors.push("Max Scenes Number must be greater than 0.");
    }

    if (charactersInput.length === 0) {
      errors.push("At least one character is required.");
    } else {
      const hasInvalidCharacters = charactersInput.some(
        c => !c.name.trim() || !c.characterPrompt.trim()
      );
      if (hasInvalidCharacters) {
        errors.push("All characters must have a name and a prompt.");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [gamePromptInput, maxScenesInput, charactersInput]);

  /**
   * Validates resume game ID
   */
  const validateResumeGameId = useCallback((): FormValidationResult => {
    const errors: string[] = [];

    if (!resumeGameIdInput.trim()) {
      errors.push("Please enter a Game ID to resume.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [resumeGameIdInput]);

  /**
   * Gets the game creation data in the format needed for API calls
   */
  const getGameCreationData = useCallback((): GameCreationData => {
    return {
      gamePrompt: gamePromptInput,
      maxScenesNumber: maxScenesInput,
      characters: charactersInput
    };
  }, [gamePromptInput, maxScenesInput, charactersInput]);

  /**
   * Resets the form to initial state
   */
  const resetForm = useCallback(() => {
    setGamePromptInputInternal(initialFormState.gamePromptInput);
    setMaxScenesInputInternal(initialFormState.maxScenesInput);
    setCharactersInputInternal(initialFormState.charactersInput);
    setResumeGameIdInputInternal(initialFormState.resumeGameIdInput);
  }, []);

  return {
    // State
    gamePromptInput,
    maxScenesInput,
    charactersInput,
    resumeGameIdInput,
    
    // Actions
    setGamePromptInput,
    setMaxScenesInput,
    setCharactersInput,
    setResumeGameIdInput,
    handleCharacterInputChange,
    handleAddCharacterInput,
    handleRemoveCharacterInput,
    validateGameCreation,
    validateResumeGameId,
    getGameCreationData,
    resetForm
  };
}

/**
 * Utility function to validate individual character
 */
export function validateCharacter(character: CharacterInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!character.name.trim()) {
    errors.push("Character name cannot be empty.");
  }

  if (!character.characterPrompt.trim()) {
    errors.push("Character prompt cannot be empty.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Utility function to validate all characters
 */
export function validateAllCharacters(characters: CharacterInput[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (characters.length === 0) {
    errors.push("At least one character is required.");
    return { isValid: false, errors };
  }

  characters.forEach((character, index) => {
    const validation = validateCharacter(character);
    if (!validation.isValid) {
      errors.push(`Character ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  // Check for duplicate names
  const names = characters.map(c => c.name.trim().toLowerCase()).filter(name => name);
  const uniqueNames = new Set(names);
  if (names.length !== uniqueNames.size) {
    errors.push("Character names must be unique.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Utility function to get default character inputs
 */
export function getDefaultCharacters(): CharacterInput[] {
  return [
    { name: 'Sir Roland', characterPrompt: 'A noble knight who values honor and courage above all else' },
    { name: 'Lady Elara', characterPrompt: 'A wise mage seeking to protect the realm with her magical powers' },
  ];
}