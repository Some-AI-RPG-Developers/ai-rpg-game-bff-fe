import React from 'react';
import { ViewMode } from '@/client/types/ui.types';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { ArrowLeft, Download } from 'lucide-react';

interface ResumeGameFormProps {
  /** Current value of the game ID input */
  resumeGameIdInput: string;
  /** Handler for game ID input changes */
  onResumeGameIdChange: (value: string) => void;
  /** Handler for loading a game by ID */
  onLoadGameById: () => void;
  /** Handler for changing view mode */
  onViewModeChange: (mode: ViewMode) => void;
  /** Handler for clearing errors */
  onErrorClear: () => void;
  /** Whether any processing is currently happening */
  isProcessing: boolean;
}

/**
 * ResumeGameForm displays the form for resuming an existing game by entering its ID.
 * Extracted from the original monolithic component (lines 652-678).
 */
export const ResumeGameForm: React.FC<ResumeGameFormProps> = ({
  resumeGameIdInput,
  onResumeGameIdChange,
  onLoadGameById,
  onViewModeChange,
  onErrorClear,
  isProcessing
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className={`rounded-3xl p-12 w-2/3 max-w-2xl mx-auto ${
        theme === 'light' ? 'magical-scroll magical-scroll-corners' : 
        theme === 'dark' ? 'dark-fantasy-card dark-fantasy-holo-corners dark-fantasy-circuit' :
        theme !== 'matrix' ? styles.card : ''
      }`}
           style={{
             backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <div className={
          theme === 'light' ? 'magical-scroll-content' : 
          theme === 'dark' ? 'dark-fantasy-data-stream' : ''
        }>
          <h3 className={`text-3xl font-bold mb-8 text-center ${
            theme === 'light' ? 'spell-title' : 
            theme === 'dark' ? 'dark-fantasy-text-neon' :
            theme !== 'matrix' ? styles.text : ''
          }`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
            {theme === 'light' ? '🗝️ Resume Adventure 🗝️' : 
             theme === 'dark' ? '🏰 RETURN TO CASTLE 🏰' :
             'Resume Game'}
          </h3>
        
        <div className="space-y-6">
          <div>
            <label 
              htmlFor="resumeGameId" 
              className={`block text-lg font-medium mb-3 ${
                theme === 'light' ? 'spell-text' : 
                theme === 'dark' ? 'dark-fantasy-text' :
                theme !== 'matrix' ? styles.text : ''
              }`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
            >
              {theme === 'light' ? '🔮 Enter Quest Identifier:' : 
               theme === 'dark' ? '🏰 CASTLE KEY:' :
               'Enter Game ID:'}
            </label>
            <input
              type="text"
              id="resumeGameId"
              value={resumeGameIdInput}
              onChange={(e) => onResumeGameIdChange(e.target.value)}
              disabled={isProcessing}
              className={`w-full max-w-md mx-auto p-4 rounded-lg text-lg font-medium transition-all duration-300 
                focus:outline-none focus:ring-2 ${
                  theme === 'light' ? 'spell-writing-area' :
                  theme === 'dark' ? 'dark-fantasy-input' :
                  theme !== 'matrix' ? `${styles.bg} ${styles.text} ${styles.border}` : ''
                }`}
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.9)' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined
              }}
              placeholder={theme === 'light' ? 
                "Inscribe thy quest's sacred identifier upon this mystical scroll..." :
                theme === 'dark' ?
                ">> ENTER CASTLE ENTRANCE KEY..." :
                "Enter your game ID here..."
              }
            />
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={onLoadGameById}
              disabled={isProcessing || !resumeGameIdInput.trim()}
              className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 
                hover:shadow-2xl flex items-center gap-2 disabled:opacity-50 ${theme !== 'matrix' ? `${styles.secondary} ${styles.text}` : ''}`}
              style={{
                backgroundColor: theme === 'matrix' ? '#004d00' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
                boxShadow: theme === 'matrix' ? '0 0 10px rgba(0, 255, 65, 0.3)' : undefined
              }}
            >
              <Download size={24} />
              {theme === 'dark' ? 'ENTER CASTLE' : 'Load Game'}
            </button>
            
            <button 
              onClick={() => { 
                onViewModeChange('choice'); 
                onErrorClear(); 
              }} 
              disabled={isProcessing}
              className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 
                hover:shadow-2xl flex items-center gap-2 disabled:opacity-50 ${theme !== 'matrix' ? `${styles.secondary} ${styles.text}` : ''}`}
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                border: theme === 'matrix' ? '1px solid #00ff41' : undefined
              }}
            >
              <ArrowLeft size={24} />
              Back to choices
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};