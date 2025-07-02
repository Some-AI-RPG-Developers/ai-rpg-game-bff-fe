import React from 'react';
import { ViewMode } from '@/client/types/ui.types';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { Play } from 'lucide-react';

interface WelcomeScreenProps {
  /** Handler for changing view mode */
  onViewModeChange: (mode: ViewMode) => void;
  /** Whether any processing is currently happening */
  isProcessing: boolean;
}

/**
 * WelcomeScreen displays the initial choice between creating a new game or resuming an existing one.
 * Extracted from the original monolithic component (lines 640-650).
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onViewModeChange,
  isProcessing
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className={`rounded-3xl p-12 w-2/3 max-w-2xl text-center mx-auto ${
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
          <h2 className={`text-4xl font-bold mb-6 ${
            theme === 'light' ? 'spell-title' : 
            theme === 'dark' ? 'dark-fantasy-text-neon' :
            theme !== 'matrix' ? styles.text : ''
          }`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
            {theme === 'light' ? '📜 Welcome to AI RPG Adventure 📜' : 
             theme === 'dark' ? '🏰 WELCOME TO DARK REALM CHRONICLES 🏰' :
             'Welcome to AI RPG Adventure'}
          </h2>
          <p className={`text-lg mb-8 ${
            theme === 'light' ? 'spell-text' : 
            theme === 'dark' ? 'dark-fantasy-text' :
            theme !== 'matrix' ? styles.text : ''
          }`}
             style={{ 
               color: theme === 'matrix' ? '#00ff41' : undefined,
               opacity: theme === 'matrix' ? 0.9 : 0.8
             }}>
            {theme === 'light' ? 
              'Embark upon a most wondrous quest where thy choices shall weave the very fabric of destiny. Face mystical creatures, uncover ancient treasures, and ascend to legendary status!' :
              theme === 'dark' ?
              'ENTER THE ENCHANTED CASTLE. YOUR CHOICES FORGE DESTINY. BATTLE THROUGH DARK DUNGEONS, UNRAVEL ANCIENT MYSTERIES, AND BECOME THE ULTIMATE LEGENDARY HERO.' :
              'Embark on an epic journey where your choices shape the story. Face mythical creatures, discover ancient treasures, and become a legend!'
            }
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onViewModeChange('create')}
            disabled={isProcessing}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 
              hover:shadow-2xl flex items-center gap-2 disabled:opacity-50 ${theme !== 'matrix' ? `${styles.secondary} ${styles.text}` : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? '#004d00' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined,
              border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
              boxShadow: theme === 'matrix' ? '0 0 10px rgba(0, 255, 65, 0.3)' : undefined
            }}
          >
            <Play size={24} />
            Create New Game
          </button>
          <button
            onClick={() => onViewModeChange('resume')}
            disabled={isProcessing}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 
              hover:shadow-2xl flex items-center gap-2 disabled:opacity-50 ${theme !== 'matrix' ? `${styles.secondary} ${styles.text}` : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined,
              border: theme === 'matrix' ? '1px solid #00ff41' : undefined
            }}
          >
            Resume Game
          </button>
        </div>
      </div>
    </div>
  );
};