import React from 'react';
import { CharacterInput, GameStatus } from '@/client/types/game.types';
import { ViewMode } from '@/client/types/ui.types';

interface CreateGameFormProps {
  /** Current game prompt input value */
  gamePromptInput: string;
  /** Current max scenes input value */
  maxScenesInput: number;
  /** Current characters input array */
  charactersInput: CharacterInput[];
  /** Current game status */
  gameStatus: GameStatus;
  /** Handler for game prompt changes */
  onGamePromptChange: (value: string) => void;
  /** Handler for max scenes changes */
  onMaxScenesChange: (value: number) => void;
  /** Handler for character input changes */
  onCharacterInputChange: (index: number, field: 'name' | 'characterPrompt', value: string) => void;
  /** Handler for adding a new character */
  onAddCharacterInput: () => void;
  /** Handler for removing a character */
  onRemoveCharacterInput: (index: number) => void;
  /** Handler for creating the game */
  onCreateGame: () => Promise<void>;
  /** Handler for changing view mode */
  onViewModeChange: (mode: ViewMode) => void;
  /** Handler for clearing errors */
  onErrorClear: () => void;
  /** Whether any processing is currently happening */
  isProcessing: boolean;
}

/**
 * CreateGameForm displays the form for creating a new game with custom settings.
 * Extracted from the original monolithic component (lines 680-767).
 */
export const CreateGameForm: React.FC<CreateGameFormProps> = ({
  gamePromptInput,
  maxScenesInput,
  charactersInput,
  gameStatus,
  onGamePromptChange,
  onMaxScenesChange,
  onCharacterInputChange,
  onAddCharacterInput,
  onRemoveCharacterInput,
  onCreateGame,
  onViewModeChange,
  onErrorClear,
  isProcessing
}) => {
  return (
    <div style={{ border: '1px solid #eee', padding: '15px', marginBottom: '20px' }}>
      <h3>Create New Game</h3>
      <button 
        onClick={() => { 
          onViewModeChange('choice'); 
          onErrorClear(); 
        }} 
        style={{ marginBottom: '15px', fontSize: '14px' }} 
        disabled={isProcessing}
      >
        Back to choices
      </button>
      <div>
        <label htmlFor="gamePrompt" style={{ display: 'block', marginBottom: '5px' }}>Game Prompt:</label>
        <textarea
          id="gamePrompt"
          value={gamePromptInput}
          onChange={(e) => onGamePromptChange(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          disabled={isProcessing}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="maxScenes" style={{ display: 'block', marginBottom: '5px' }}>Max Scenes Number:</label>
        <input
          type="number"
          id="maxScenes"
          value={maxScenesInput}
          onChange={(e) => onMaxScenesChange(parseInt(e.target.value, 10))}
          style={{ padding: '8px' }}
          disabled={isProcessing}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <h4>Characters:</h4>
        {charactersInput.map((char, index) => (
          <div key={index} style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px' }}>
            <div>
              <label htmlFor={`charName-${index}`} style={{ display: 'block', marginBottom: '3px' }}>Name:</label>
              <input
                type="text"
                id={`charName-${index}`}
                value={char.name}
                onChange={(e) => onCharacterInputChange(index, 'name', e.target.value)}
                style={{ padding: '8px', width: 'calc(100% - 100px)', marginRight: '10px' }}
                disabled={isProcessing}
              />
            </div>
            <div style={{ marginTop: '5px' }}>
              <label htmlFor={`charPrompt-${index}`} style={{ display: 'block', marginBottom: '3px' }}>Prompt:</label>
              <textarea
                id={`charPrompt-${index}`}
                value={char.characterPrompt}
                onChange={(e) => onCharacterInputChange(index, 'characterPrompt', e.target.value)}
                rows={2}
                style={{ width: 'calc(100% - 100px)', padding: '8px', boxSizing: 'border-box', marginRight: '10px' }}
                disabled={isProcessing}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveCharacterInput(index)}
              style={{ marginTop: '5px', color: 'red' }}
              disabled={isProcessing}
            >
              Remove Character
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddCharacterInput}
          style={{ marginTop: '10px' }}
          disabled={isProcessing}
        >
          Add Character
        </button>
      </div>
      <button
        onClick={onCreateGame}
        disabled={isProcessing}
        style={{ marginTop: '20px', padding: '10px 15px', fontSize: '16px' }}
      >
        {gameStatus === 'creatingGame_InProgress' ? 'Creating...' : 'Create Game'}
      </button>
    </div>
  );
};