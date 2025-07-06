import React from 'react';
import {CharacterInput, GameStatus} from '@/client/types/game.types';
import {ViewMode} from '@/client/types/ui.types';
import {useTheme} from '@/client/context/ThemeContext';
import {getThemeStyles} from '@/client/utils/themeStyles';
import {ArrowLeft, FileText, Globe, Hash, Play, Plus, Trash2, Users} from 'lucide-react';

interface CreateGameFormProps {
  /** Current game prompt input value */
  gamePromptInput: string;
  /** Current max scenes input value */
  maxScenesInput: number;
  /** Current language input value */
  languageInput?: string;
  /** Current characters input array */
  charactersInput: CharacterInput[];
  /** Current game status */
  gameStatus: GameStatus;
  /** Handler for game prompt changes */
  onGamePromptChange: (value: string) => void;
  /** Handler for max scenes changes */
  onMaxScenesChange: (value: number) => void;
  /** Handler for language changes */
  onLanguageChange: (value: string) => void;
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
  languageInput,
  charactersInput,
  gameStatus,
  onGamePromptChange,
  onMaxScenesChange,
  onLanguageChange,
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
      <div className={`rounded-3xl p-12 w-2/3 max-w-4xl mx-auto overflow-hidden ${
        theme === 'light' ? 'magical-scroll magical-scroll-corners' : 
        theme === 'dark' ? 'dark-fantasy-card dark-fantasy-holo-corners dark-fantasy-circuit' :
        theme === 'performance' ? 'performance-card' :
        theme !== 'matrix' ? styles.card : ''
      }`}
           style={{
             backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <div className={`text-center mb-8 ${
          theme === 'light' ? 'magical-scroll-content' : 
          theme === 'dark' ? 'dark-fantasy-data-stream' :
          theme === 'performance' ? 'performance-text' : ''
        }`}>
          <h3 className={`text-4xl font-bold mb-4 ${
            theme === 'light' ? 'spell-title' : 
            theme === 'dark' ? 'dark-fantasy-text-neon' :
            theme === 'performance' ? 'performance-text' :
            theme !== 'matrix' ? styles.text : ''
          }`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
            {theme === 'light' ? '📜 Craft New Adventure ⚡' : 
             theme === 'dark' ? '🏰 FORGE NEW CASTLE QUEST 🏰' :
             'Create New Game'}
          </h3>
          <div className="flex justify-center">
            <button 
            onClick={() => { 
              onViewModeChange('choice'); 
              onErrorClear(); 
            }} 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] transform ${
              theme === 'performance' ? 'performance-button-secondary' :
              theme !== 'matrix' ? `${styles.secondary} ${styles.text}` : ''
            }`}
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
            <h4 className={`text-2xl font-bold ${
              theme === 'light' ? 'spell-text' : 
              theme === 'dark' ? 'dark-fantasy-text' :
              theme === 'performance' ? 'performance-text' :
              theme !== 'matrix' ? styles.text : ''
            }`}
                   style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
              {theme === 'light' ? '📜 Adventure Scroll' : 
               theme === 'dark' ? '🏰 QUEST PARAMETERS' :
               'Game Prompt'}
            </h4>
          </div>
          <div className="w-11/12 mx-auto">
            <textarea
              id="gamePrompt"
              value={gamePromptInput}
              onChange={(e) => onGamePromptChange(e.target.value)}
              rows={5}
              className={`w-full p-6 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${
                theme === 'light' ? 'spell-writing-area' :
                theme === 'dark' ? 'dark-fantasy-input' :
                theme === 'performance' ? 'performance-input' :
                theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''
              }`}
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined
              }}
              disabled={isProcessing}
              placeholder={theme === 'light' ? 
                "Inscribe thy grand adventure upon this enchanted parchment... What mystical realm shall thy heroes explore?" :
                theme === 'dark' ?
                ">> ENTER QUEST PARAMETERS... WHAT DARK CASTLE REALM WILL YOUR HEROES EXPLORE?" :
                "Describe your adventure setting... What world will your characters explore?"
              }
            />
          </div>
        </div>
        <div className="mb-8 w-11/12 mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Hash size={24} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
            <h4 className={`text-2xl font-bold ${
              theme === 'dark' ? 'dark-fantasy-text' :
              theme === 'performance' ? 'performance-text' :
              theme !== 'matrix' ? styles.text : ''
            }`}
                   style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
              {theme === 'dark' ? 'QUEST CHAPTERS' : 'Max Scenes'}
            </h4>
          </div>
          <div className="flex justify-center">
            <input
              type="number"
              id="maxScenes"
              value={maxScenesInput}
              onChange={(e) => onMaxScenesChange(parseInt(e.target.value, 10))}
              className={`w-32 p-4 rounded-xl font-bold text-center text-xl transition-all duration-300 focus:outline-none focus:ring-2 ${
                theme === 'dark' ? 'dark-fantasy-input' :
                theme === 'performance' ? 'performance-input' :
                theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''
              }`}
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe size={24} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
            <h4 className={`text-2xl font-bold ${
              theme === 'light' ? 'spell-text' : 
              theme === 'dark' ? 'dark-fantasy-text' :
              theme === 'performance' ? 'performance-text' :
              theme !== 'matrix' ? styles.text : ''
            }`}
                   style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
              {theme === 'light' ? '🌍 Adventure Language' : 
               theme === 'dark' ? '🌍 REALM TONGUE' :
               'Language'}
            </h4>
          </div>
          <div className="flex justify-center">
            <select
              id="language"
              value={languageInput || 'en'}
              onChange={(e) => onLanguageChange(e.target.value)}
              className={`w-64 p-4 rounded-xl font-bold text-center text-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                theme === 'light' ? 'spell-writing-area' :
                theme === 'dark' ? 'dark-fantasy-input' :
                theme === 'performance' ? 'performance-input' :
                theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''
              }`}
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined
              }}
              disabled={isProcessing}
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="it">🇮🇹 Italiano</option>
              <option value="pt">🇵🇹 Português</option>
              <option value="ru">🇷🇺 Русский</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="ko">🇰🇷 한국어</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="nl">🇳🇱 Nederlands</option>
              <option value="sv">🇸🇪 Svenska</option>
              <option value="no">🇳🇴 Norsk</option>
              <option value="da">🇩🇰 Dansk</option>
              <option value="fi">🇫🇮 Suomi</option>
              <option value="pl">🇵🇱 Polski</option>
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="hi">🇮🇳 हिन्दी</option>
            </select>
          </div>
        </div>
        <div className="mb-8 w-11/12 mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users size={28} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
            <h4 className={`text-3xl font-bold ${
              theme === 'dark' ? 'dark-fantasy-text' :
              theme === 'performance' ? 'performance-text' :
              theme !== 'matrix' ? styles.text : ''
            }`}
                style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
              {theme === 'dark' ? 'HEROES' : 'Characters'}
            </h4>
          </div>
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={onAddCharacterInput}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] transform ${
                theme === 'performance' ? 'performance-button-primary' :
                theme !== 'matrix' ? `${styles.secondary} ${styles.text}` : ''
              }`}
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.15)' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                border: theme === 'matrix' ? '2px solid #00ff41' : undefined,
                boxShadow: theme === 'matrix' ? '0 4px 20px rgba(0, 255, 65, 0.3)' : undefined
              }}
              disabled={isProcessing}
            >
              <Plus size={20} />
              {theme === 'dark' ? 'RECRUIT HERO' : 'Add New Character'}
            </button>
          </div>
          <div className="space-y-6 flex flex-col items-center">
            {charactersInput.map((char, index) => (
              <div key={index} className={`rounded-xl p-8 w-full max-w-lg transform transition-all duration-300 hover:scale-[1.02] ${
                theme === 'dark' ? 'dark-fantasy-card dark-fantasy-glow' :
                theme === 'performance' ? 'performance-character' : ''
              }`}
                   style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.8)' : undefined,
                     border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.5)' : undefined,
                     boxShadow: theme === 'matrix' ? '0 4px 20px rgba(0, 255, 65, 0.2)' : undefined
                   }}>
                <div className="text-center mb-6">
                  <h5 className={`text-xl font-bold mb-6 ${
                    theme === 'dark' ? 'dark-fantasy-text' :
                    theme === 'performance' ? 'performance-text' :
                    theme !== 'matrix' ? styles.text : ''
                  }`}
                      style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                    {theme === 'dark' ? `HERO #${index + 1}` : `Character #${index + 1}`}
                  </h5>
                </div>
                <div className="space-y-6 flex flex-col items-center w-full">
                  <div className="w-full max-w-md">
                    <label htmlFor={`charName-${index}`} className={`block text-center mb-3 font-bold text-lg ${
                      theme === 'dark' ? 'dark-fantasy-text' :
                      theme === 'performance' ? 'performance-text' :
                      theme !== 'matrix' ? styles.text : ''
                    }`}
                           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                      {theme === 'dark' ? 'HERO NAME' : 'Name'}
                    </label>
                    <input
                      type="text"
                      id={`charName-${index}`}
                      value={char.name}
                      onChange={(e) => onCharacterInputChange(index, 'name', e.target.value)}
                      className={`w-full p-4 rounded-xl font-bold text-center text-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                        theme === 'dark' ? 'dark-fantasy-input' :
                        theme === 'performance' ? 'performance-input' :
                        theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''
                      }`}
                      style={{
                        backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                        color: theme === 'matrix' ? '#00ff41' : undefined,
                        border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined
                      }}
                      disabled={isProcessing}
                      placeholder={theme === 'dark' ? ">> ENTER HERO NAME..." : "Enter character name..."}
                    />
                  </div>
                  <div className="w-full max-w-md">
                    <label htmlFor={`charPrompt-${index}`} className={`block text-center mb-3 font-bold text-lg ${
                      theme === 'dark' ? 'dark-fantasy-text' :
                      theme === 'performance' ? 'performance-text' :
                      theme !== 'matrix' ? styles.text : ''
                    }`}
                           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                      {theme === 'dark' ? 'HERO CHRONICLE' : 'Description'}
                    </label>
                    <textarea
                      id={`charPrompt-${index}`}
                      value={char.characterPrompt}
                      onChange={(e) => onCharacterInputChange(index, 'characterPrompt', e.target.value)}
                      rows={4}
                      className={`w-full p-4 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${
                        theme === 'dark' ? 'dark-fantasy-input' :
                        theme === 'performance' ? 'performance-input' :
                        theme !== 'matrix' ? `${styles.card} ${styles.text} ${styles.border}` : ''
                      }`}
                      style={{
                        backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                        color: theme === 'matrix' ? '#00ff41' : undefined,
                        border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined
                      }}
                      disabled={isProcessing}
                      placeholder={theme === 'dark' ? ">> HERO CHRONICLE: BACKGROUND, MAGICAL ABILITIES, ANCIENT BLOODLINES..." : "Describe this character's background, abilities, and personality..."}
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => onRemoveCharacterInput(index)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] transform ${
                      theme === 'dark' ? 'dark-fantasy-button-secondary' :
                      theme === 'performance' ? 'performance-button-secondary' : ''
                    }`}
                    style={{
                      backgroundColor: theme === 'matrix' ? 'rgba(51, 0, 0, 0.8)' : (
                        theme === 'performance' ? '#374151' : (
                          theme === 'dark' ? undefined : '#dc3545'
                        )
                      ),
                      color: theme === 'matrix' ? '#ff6666' : (
                        theme === 'performance' ? '#f3f4f6' : (
                          theme === 'dark' ? undefined : 'white'
                        )
                      ),
                      border: theme === 'matrix' ? '2px solid #ff4444' : (
                        theme === 'performance' ? '2px solid #dc2626' : (
                          theme === 'dark' ? undefined : '2px solid #dc2626'
                        )
                      ),
                      boxShadow: theme === 'matrix' ? '0 4px 15px rgba(255, 68, 68, 0.3)' : undefined
                    }}
                    disabled={isProcessing}
                  >
                    <Trash2 size={18} />
                    {theme === 'dark' ? 'DISMISS HERO' : 'Remove Character'}
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
            className={`px-12 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center gap-4 disabled:opacity-50 ${
              theme === 'performance' ? 'performance-button-primary' :
              theme !== 'matrix' ? `${styles.secondary} ${styles.text}` : ''
            }`}
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 77, 0, 0.9)' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined,
              border: theme === 'matrix' ? '3px solid #00ff41' : undefined,
              boxShadow: theme === 'matrix' ? '0 0 30px rgba(0, 255, 65, 0.5), inset 0 0 20px rgba(0, 255, 65, 0.1)' : undefined
            }}
          >
            <Play size={32} />
            {gameStatus === 'creatingGame_InProgress' ? 
              (theme === 'dark' ? 'OPENING CASTLE GATES...' : 'Creating Adventure...') : 
              (theme === 'dark' ? 'BEGIN QUEST' : 'Create Game')
            }
          </button>
        </div>
      </div>
    </div>
  );
};