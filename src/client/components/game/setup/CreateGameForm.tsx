import React from 'react';
import { CharacterInput, GameStatus } from '@/client/types/game.types';
import { ViewMode } from '@/client/types/ui.types';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { ArrowLeft, Plus, Trash2, Play } from 'lucide-react';

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
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8">
      <div className={`rounded-3xl p-12 w-2/3 max-w-2xl mx-auto`}
           style={{
             backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <div className="flex items-center justify-between mb-8">
          <h3 className={`text-3xl font-bold ${theme !== 'matrix' ? styles.text : ''}`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
            Create New Game
          </h3>
          <button 
            onClick={() => { 
              onViewModeChange('choice'); 
              onErrorClear(); 
            }} 
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 ${theme !== 'matrix' ? `${styles.secondary} ${styles.text}` : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined,
              border: theme === 'matrix' ? '1px solid #00ff41' : undefined
            }}
            disabled={isProcessing}
          >
            <ArrowLeft size={16} />
            Back to choices
          </button>
        </div>
        <div className="mb-6">
          <label htmlFor="gamePrompt" className={`block mb-3 text-lg font-medium ${theme !== 'matrix' ? styles.text : ''}`}
                 style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Game Prompt:</label>
          <textarea
            id="gamePrompt"
            value={gamePromptInput}
            onChange={(e) => onGamePromptChange(e.target.value)}
            rows={4}
            className={`w-full max-w-3xl mx-auto p-4 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined,
              border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined,
              focusRingColor: theme === 'matrix' ? '#00ff41' : undefined
            }}
            disabled={isProcessing}
            placeholder="Describe your adventure setting..."
          />
        </div>
        <div className="mb-6">
          <label htmlFor="maxScenes" className={`block mb-3 text-lg font-medium ${theme !== 'matrix' ? styles.text : ''}`}
                 style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Max Scenes Number:</label>
          <input
            type="number"
            id="maxScenes"
            value={maxScenesInput}
            onChange={(e) => onMaxScenesChange(parseInt(e.target.value, 10))}
            className={`w-40 p-4 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined,
              border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined,
              focusRingColor: theme === 'matrix' ? '#00ff41' : undefined
            }}
            disabled={isProcessing}
            min="1"
            max="20"
          />
        </div>
        <div className="mb-8">
          <h4 className={`text-2xl font-bold mb-6 ${theme !== 'matrix' ? styles.text : ''}`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Characters:</h4>
          <div className="space-y-6">
            {charactersInput.map((char, index) => (
              <div key={index} className={`rounded-lg p-6`}
                   style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.6)' : undefined,
                     border: theme === 'matrix' ? '2px dashed rgba(0, 255, 65, 0.4)' : undefined
                   }}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor={`charName-${index}`} className={`block mb-3 font-medium ${theme !== 'matrix' ? styles.text : ''}`}
                           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Name:</label>
                    <input
                      type="text"
                      id={`charName-${index}`}
                      value={char.name}
                      onChange={(e) => onCharacterInputChange(index, 'name', e.target.value)}
                      className={`w-full p-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''}`}
                      style={{
                        backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                        color: theme === 'matrix' ? '#00ff41' : undefined,
                        border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined,
                        focusRingColor: theme === 'matrix' ? '#00ff41' : undefined
                      }}
                      disabled={isProcessing}
                      placeholder="Character name..."
                    />
                  </div>
                  <div>
                    <label htmlFor={`charPrompt-${index}`} className={`block mb-3 font-medium ${theme !== 'matrix' ? styles.text : ''}`}
                           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Description:</label>
                    <textarea
                      id={`charPrompt-${index}`}
                      value={char.characterPrompt}
                      onChange={(e) => onCharacterInputChange(index, 'characterPrompt', e.target.value)}
                      rows={3}
                      className={`w-full p-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''}`}
                      style={{
                        backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                        color: theme === 'matrix' ? '#00ff41' : undefined,
                        border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined,
                        focusRingColor: theme === 'matrix' ? '#00ff41' : undefined
                      }}
                      disabled={isProcessing}
                      placeholder="Character description..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCharacterInput(index)}
                  className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105`}
                  style={{
                    backgroundColor: theme === 'matrix' ? '#330000' : '#dc3545',
                    color: theme === 'matrix' ? '#ff6666' : 'white',
                    border: theme === 'matrix' ? '1px solid #ff4444' : undefined
                  }}
                  disabled={isProcessing}
                >
                  <Trash2 size={16} />
                  Remove Character
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAddCharacterInput}
            className={`mt-6 flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 ${theme !== 'matrix' ? `${styles.accent} ${styles.text}` : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined,
              border: theme === 'matrix' ? '1px solid #00ff41' : undefined
            }}
            disabled={isProcessing}
          >
            <Plus size={16} />
            Add Character
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onCreateGame}
            disabled={isProcessing}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl flex items-center gap-2 disabled:opacity-50 ${theme !== 'matrix' ? `${styles.accent} ${styles.text}` : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? '#004d00' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined,
              border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
              boxShadow: theme === 'matrix' ? '0 0 10px rgba(0, 255, 65, 0.3)' : undefined
            }}
          >
            <Play size={24} />
            {gameStatus === 'creatingGame_InProgress' ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </div>
    </div>
  );
};