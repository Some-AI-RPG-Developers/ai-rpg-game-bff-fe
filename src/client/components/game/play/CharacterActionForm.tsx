import React from 'react';
import { PlayPageTurn } from '@/client/types/game.types';
import { CharacterOptions as GameCharacterOption } from '@/server/types/rest/api.alias.types';

interface CharacterActionFormProps {
  /** Current turn with options */
  currentTurn: PlayPageTurn;
  /** Currently selected options for each character */
  selectedOptions: Record<string, string>;
  /** Current free text inputs for each character */
  freeTextInputs: Record<string, string>;
  /** Handler for option changes */
  onOptionChange: (characterName: string, optionValue: string) => void;
  /** Handler for free text changes */
  onFreeTextChange: (characterName: string, text: string) => void;
  /** Whether any processing is currently happening */
  isProcessing: boolean;
}

/**
 * CharacterActionForm displays the character action selection interface with radio buttons and free text input.
 * Submit button has been moved to a centralized location at the bottom of the page.
 * Extracted from the original monolithic component (lines 820-868).
 */
export const CharacterActionForm: React.FC<CharacterActionFormProps> = ({
  currentTurn,
  selectedOptions,
  freeTextInputs,
  onOptionChange,
  onFreeTextChange,
  isProcessing
}) => {
  if (!currentTurn.options) {
    return null;
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <strong>Choose actions for your characters:</strong>
      {currentTurn.options.map((charOption: GameCharacterOption) => (
        <div key={charOption.name} style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '3px' }}>
          <strong>{charOption.name}:</strong>
          {charOption.descriptions.map((optionDesc: string, index: number) => (
            <label key={index} style={{ display: 'block', margin: '5px 0' }}>
              <input
                type="radio"
                name={`option-${charOption.name}`}
                value={optionDesc}
                checked={selectedOptions[charOption.name] === optionDesc}
                onChange={() => onOptionChange(charOption.name, optionDesc)}
                disabled={!!freeTextInputs[charOption.name] || isProcessing}
                style={{ marginRight: '8px' }}
              />
              {optionDesc}
            </label>
          ))}
          <input
            type="text"
            placeholder="Or type a custom action..."
            value={freeTextInputs[charOption.name] || ''}
            onChange={(e) => onFreeTextChange(charOption.name, e.target.value)}
            disabled={isProcessing}
            style={{ marginTop: '5px', width: 'calc(100% - 18px)', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
        </div>
      ))}
    </div>
  );
};