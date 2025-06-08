/**
 * useCharacterActions - Handle character option selection logic
 * Manages character action state, option selection, and turn submission validation
 */

import { useState, useCallback } from 'react';
import {
  ChosenCharacterAction,
  NewTurn,
  GameCharacterOption,
  PlayPageGame,
  TurnSubmissionValidationResult
} from '@/client/types/game.types';

/**
 * Character action state interface
 */
export interface CharacterActionState {
  selectedOptions: Record<string, string>;
  freeTextInputs: Record<string, string>;
}

/**
 * Character action management interface
 */
export interface CharacterActionActions {
  handleOptionChange: (characterName: string, optionValue: string) => void;
  handleFreeTextChange: (characterName: string, text: string) => void;
  validateTurnSubmission: (currentTurn: PlayPageGame['scenes'][0]['turns'][0] | null) => TurnSubmissionValidationResult;
  prepareTurnData: (currentTurn: PlayPageGame['scenes'][0]['turns'][0] | null) => NewTurn | null;
  checkAllCharactersMadeChoice: (currentTurn: PlayPageGame['scenes'][0]['turns'][0] | null) => boolean;
  clearSelections: () => void;
  resetCharacterActions: () => void;
}

/**
 * Initial character action state
 */
const initialCharacterActionState: CharacterActionState = {
  selectedOptions: {},
  freeTextInputs: {}
};

/**
 * Hook for managing character actions and turn submission
 */
export function useCharacterActions(): CharacterActionState & CharacterActionActions {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    initialCharacterActionState.selectedOptions
  );
  const [freeTextInputs, setFreeTextInputs] = useState<Record<string, string>>(
    initialCharacterActionState.freeTextInputs
  );

  /**
   * Handles option selection for a character
   */
  const handleOptionChange = useCallback((characterName: string, optionValue: string) => {
    setSelectedOptions(prev => ({ ...prev, [characterName]: optionValue }));
    // If a radio option is selected, clear the free text for that character
    setFreeTextInputs(prev => ({ ...prev, [characterName]: '' }));
  }, []);

  /**
   * Handles free text input for a character
   */
  const handleFreeTextChange = useCallback((characterName: string, text: string) => {
    setFreeTextInputs(prev => ({ ...prev, [characterName]: text }));
    
    // If free text is used, it overrides the selected option
    if (text.trim() !== '') {
      // Only consider it an override if there's actual text
      setSelectedOptions(prev => ({ ...prev, [characterName]: `freeText:${text}` }));
    } else {
      // If free text is cleared, remove it as the selected option
      // This allows radio buttons to be re-selected if desired.
      setSelectedOptions(prev => {
        const newSelected = { ...prev };
        // Only delete if the current selection was from this free text field
        if (newSelected[characterName]?.startsWith('freeText:')) {
          delete newSelected[characterName];
        }
        return newSelected;
      });
    }
  }, []);

  /**
   * Validates turn submission data
   */
  const validateTurnSubmission = useCallback((
    currentTurn: PlayPageGame['scenes'][0]['turns'][0] | null
  ): TurnSubmissionValidationResult => {
    if (!currentTurn || !currentTurn.options) {
      return {
        isValid: false,
        characterActions: [],
        errors: ['No current turn or options available.']
      };
    }

    const characterActions: ChosenCharacterAction[] = [];
    const errors: string[] = [];

    // Process each character's options
    currentTurn.options.forEach((charOption: GameCharacterOption) => {
      const characterName = charOption.name;
      const actionValue = selectedOptions[characterName];

      if (actionValue) {
        // If an option was selected or free text was entered
        if (actionValue.startsWith('freeText:')) {
          const freeTextValue = actionValue.substring('freeText:'.length);
          if (freeTextValue.trim()) {
            characterActions.push({ 
              characterName, 
              chosenOption: freeTextValue.trim() 
            });
          } else {
            errors.push(`${characterName} must provide valid free text input.`);
          }
        } else {
          characterActions.push({ 
            characterName, 
            chosenOption: actionValue 
          });
        }
      } else {
        errors.push(`${characterName} must select an action or provide free text input.`);
      }
    });

    // Ensure all characters who had options made a choice
    if (characterActions.length !== currentTurn.options.length) {
      if (errors.length === 0) {
        errors.push("All characters with options must select an action or provide free text input.");
      }
    }

    return {
      isValid: errors.length === 0,
      characterActions,
      errors
    };
  }, [selectedOptions]);

  /**
   * Prepares turn data for submission
   */
  const prepareTurnData = useCallback((
    currentTurn: PlayPageGame['scenes'][0]['turns'][0] | null
  ): NewTurn | null => {
    const validation = validateTurnSubmission(currentTurn);
    
    if (!validation.isValid) {
      return null;
    }

    return {
      characterActions: validation.characterActions
    };
  }, [validateTurnSubmission]);

  /**
   * Checks if all characters have made their choice
   */
  const checkAllCharactersMadeChoice = useCallback((
    currentTurn: PlayPageGame['scenes'][0]['turns'][0] | null
  ): boolean => {
    if (!currentTurn?.options) return false;
    
    return currentTurn.options.every(
      (charOpt: GameCharacterOption) => selectedOptions[charOpt.name]
    );
  }, [selectedOptions]);

  /**
   * Clears all current selections (used after successful turn submission)
   */
  const clearSelections = useCallback(() => {
    setSelectedOptions({});
    setFreeTextInputs({});
  }, []);

  /**
   * Resets character actions to initial state
   */
  const resetCharacterActions = useCallback(() => {
    setSelectedOptions(initialCharacterActionState.selectedOptions);
    setFreeTextInputs(initialCharacterActionState.freeTextInputs);
  }, []);

  return {
    // State
    selectedOptions,
    freeTextInputs,
    
    // Actions
    handleOptionChange,
    handleFreeTextChange,
    validateTurnSubmission,
    prepareTurnData,
    checkAllCharactersMadeChoice,
    clearSelections,
    resetCharacterActions
  };
}

/**
 * Utility function to check if a character has made any selection
 */
export function hasCharacterMadeChoice(
  characterName: string,
  selectedOptions: Record<string, string>,
  freeTextInputs: Record<string, string>
): boolean {
  return !!(selectedOptions[characterName] || freeTextInputs[characterName]?.trim());
}

/**
 * Utility function to get the display value for a character's selection
 */
export function getCharacterSelectionDisplay(
  characterName: string,
  selectedOptions: Record<string, string>,
  freeTextInputs: Record<string, string>
): string {
  const selection = selectedOptions[characterName];
  const freeText = freeTextInputs[characterName];
  
  if (freeText?.trim()) {
    return `Custom: ${freeText}`;
  }
  
  if (selection) {
    if (selection.startsWith('freeText:')) {
      return `Custom: ${selection.substring('freeText:'.length)}`;
    }
    return selection;
  }
  
  return 'No selection';
}

/**
 * Utility function to validate a single character's action
 */
export function validateCharacterAction(
  characterName: string,
  actionValue: string | undefined
): { isValid: boolean; error?: string } {
  if (!actionValue) {
    return {
      isValid: false,
      error: `${characterName} must select an action or provide free text input.`
    };
  }

  if (actionValue.startsWith('freeText:')) {
    const freeTextValue = actionValue.substring('freeText:'.length);
    if (!freeTextValue.trim()) {
      return {
        isValid: false,
        error: `${characterName} must provide valid free text input.`
      };
    }
  }

  return { isValid: true };
}

/**
 * Utility function to count selected characters
 */
export function getSelectedCharacterCount(
  selectedOptions: Record<string, string>
): number {
  return Object.keys(selectedOptions).filter(key => selectedOptions[key]).length;
}

/**
 * Utility function to get characters with missing selections
 */
export function getCharactersWithMissingSelections(
  characterOptions: GameCharacterOption[],
  selectedOptions: Record<string, string>
): string[] {
  return characterOptions
    .filter(charOpt => !selectedOptions[charOpt.name])
    .map(charOpt => charOpt.name);
}