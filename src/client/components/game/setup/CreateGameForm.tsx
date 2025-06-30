import React from 'react';
import { CharacterInput, GameStatus } from '@/client/types/game.types';
import { ViewMode } from '@/client/types/ui.types';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { ArrowLeft, Plus, Trash2, Play, FileText, Users, Hash } from 'lucide-react';

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
      <div className={`rounded-3xl p-12 w-2/3 max-w-4xl mx-auto overflow-hidden`}
           style={{
             backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <div className="text-center mb-8">
          <h3 className={`text-4xl font-bold mb-4 ${theme !== 'matrix' ? styles.text : ''}`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
            Create New Game
          </h3>
          <div className="flex justify-center">
            <button 
            onClick={() => { 
              onViewModeChange('choice'); 
              onErrorClear(); 
            }} 
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-[1.02] ${theme !== 'matrix' ? `${styles.secondary} ${styles.text}` : ''}`}
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
        </div>
        <div className="mb-8 w-11/12 mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText size={24} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
            <h4 className={`text-2xl font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                   style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Game Prompt</h4>
          </div>
          <div className="w-11/12 mx-auto">
            <textarea
              id="gamePrompt"
              value={gamePromptInput}
              onChange={(e) => onGamePromptChange(e.target.value)}
              rows={5}
              className={`w-full p-6 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''}`}
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined
              }}
              disabled={isProcessing}
              placeholder="Describe your adventure setting... What world will your characters explore?"
            />
          </div>
        </div>
        <div className="mb-8 w-11/12 mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Hash size={24} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
            <h4 className={`text-2xl font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                   style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Max Scenes</h4>
          </div>
          <div className="flex justify-center">
            <input
              type="number"
              id="maxScenes"
              value={maxScenesInput}
              onChange={(e) => onMaxScenesChange(parseInt(e.target.value, 10))}
              className={`w-32 p-4 rounded-xl font-bold text-center text-xl transition-all duration-300 focus:outline-none focus:ring-2 ${theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''}`}
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined
              }}
              disabled={isProcessing}
              min="1"
              max="20"
            />
          </div>
        </div>
        <div className="mb-8 w-11/12 mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users size={28} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
            <h4 className={`text-3xl font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Characters</h4>
          </div>
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={onAddCharacterInput}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] transform ${theme !== 'matrix' ? `${styles.accent} ${styles.text}` : ''}`}
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.15)' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                border: theme === 'matrix' ? '2px solid #00ff41' : undefined,
                boxShadow: theme === 'matrix' ? '0 4px 20px rgba(0, 255, 65, 0.3)' : undefined
              }}
              disabled={isProcessing}
            >
              <Plus size={20} />
              Add New Character
            </button>
          </div>
          <div className="space-y-6 w-11/12 mx-auto">
            {charactersInput.map((char, index) => (
              <div key={index} className={`rounded-xl p-8 w-11/12 mx-auto transform transition-all duration-300 hover:scale-[1.02]`}
                   style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.8)' : undefined,
                     border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.5)' : undefined,
                     boxShadow: theme === 'matrix' ? '0 4px 20px rgba(0, 255, 65, 0.2)' : undefined
                   }}>
                <div className="text-center mb-6">
                  <h5 className={`text-xl font-bold mb-6 ${theme !== 'matrix' ? styles.text : ''}`}
                      style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Character #{index + 1}</h5>
                </div>
                <div className="space-y-6 w-11/12 mx-auto">
                  <div>
                    <label htmlFor={`charName-${index}`} className={`block text-center mb-3 font-bold text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Name</label>
                    <input
                      type="text"
                      id={`charName-${index}`}
                      value={char.name}
                      onChange={(e) => onCharacterInputChange(index, 'name', e.target.value)}
                      className={`w-full p-4 rounded-xl font-bold text-center text-lg transition-all duration-300 focus:outline-none focus:ring-2 ${theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''}`}
                      style={{
                        backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                        color: theme === 'matrix' ? '#00ff41' : undefined,
                        border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined
                      }}
                      disabled={isProcessing}
                      placeholder="Enter character name..."
                    />
                  </div>
                  <div>
                    <label htmlFor={`charPrompt-${index}`} className={`block text-center mb-3 font-bold text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>Description</label>
                    <textarea
                      id={`charPrompt-${index}`}
                      value={char.characterPrompt}
                      onChange={(e) => onCharacterInputChange(index, 'characterPrompt', e.target.value)}
                      rows={4}
                      className={`w-full p-4 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''}`}
                      style={{
                        backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                        color: theme === 'matrix' ? '#00ff41' : undefined,
                        border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined
                      }}
                      disabled={isProcessing}
                      placeholder="Describe this character's background, abilities, and personality..."
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => onRemoveCharacterInput(index)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] transform`}
                    style={{
                      backgroundColor: theme === 'matrix' ? 'rgba(51, 0, 0, 0.8)' : '#dc3545',
                      color: theme === 'matrix' ? '#ff6666' : 'white',
                      border: theme === 'matrix' ? '2px solid #ff4444' : undefined,
                      boxShadow: theme === 'matrix' ? '0 4px 15px rgba(255, 68, 68, 0.3)' : undefined
                    }}
                    disabled={isProcessing}
                  >
                    <Trash2 size={18} />
                    Remove Character
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <button
            onClick={onCreateGame}
            disabled={isProcessing}
            className={`px-12 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center gap-4 disabled:opacity-50 ${theme !== 'matrix' ? `${styles.accent} ${styles.text}` : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 77, 0, 0.9)' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined,
              border: theme === 'matrix' ? '3px solid #00ff41' : undefined,
              boxShadow: theme === 'matrix' ? '0 0 30px rgba(0, 255, 65, 0.5), inset 0 0 20px rgba(0, 255, 65, 0.1)' : undefined
            }}
          >
            <Play size={32} />
            {gameStatus === 'creatingGame_InProgress' ? 'Creating Adventure...' : 'Create Game'}
          </button>
        </div>
      </div>
    </div>
  );
};