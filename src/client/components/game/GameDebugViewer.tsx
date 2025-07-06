import React from 'react';
import { JsonViewer } from '@textea/json-viewer';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';

interface GameDebugViewerProps {
  /** Current game object */
  game: PlayPageGame;
  /** Current game status */
  gameStatus: GameStatus;
}

/**
 * GameDebugViewer displays the game object in a JSON viewer for debugging purposes.
 * Extracted from the original monolithic component (lines 892-901).
 */
export const GameDebugViewer: React.FC<GameDebugViewerProps> = ({
  game,
  gameStatus
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  // Custom theme for better visibility and colors
  const getCustomTheme = (currentTheme: string) => {
    if (currentTheme === 'matrix') {
      return {
        scheme: 'matrix',
        author: 'custom',
        base00: '#000000', // Background
        base01: '#0a0a0a', // Lighter background
        base02: '#1a1a1a', // Selection background
        base03: '#008f11', // Comments
        base04: '#00cc33', // Dark foreground
        base05: '#00ff41', // Default foreground
        base06: '#00ff41', // Light foreground
        base07: '#00ff41', // Lightest foreground
        base08: '#ff6b6b', // Variables, XML Tags
        base09: '#66ff66', // Numbers
        base0A: '#88ff88', // Strings, URLs
        base0B: '#44ff44', // Classes, markup bold
        base0C: '#22ff22', // Support, regex
        base0D: '#00ffaa', // Functions
        base0E: '#00dd77', // Keywords
        base0F: '#00bb55'  // Deprecated
      };
    } else if (currentTheme === 'dark') {
      return {
        scheme: 'dark',
        author: 'custom',
        base00: '#1a1a1a', // Background
        base01: '#2d2d2d', // Lighter background
        base02: '#383838', // Selection background
        base03: '#5e5e5e', // Comments
        base04: '#b4b7b4', // Dark foreground
        base05: '#c5c8c6', // Default foreground
        base06: '#e0e0e0', // Light foreground
        base07: '#ffffff', // Lightest foreground
        base08: '#cc6666', // Variables, XML Tags
        base09: '#de935f', // Numbers
        base0A: '#f0c674', // Strings
        base0B: '#b5bd68', // Classes
        base0C: '#8abeb7', // Support
        base0D: '#81a2be', // Functions
        base0E: '#b294bb', // Keywords
        base0F: '#a3685a'  // Deprecated
      };
    } else {
      return {
        scheme: 'light',
        author: 'custom',
        base00: '#ffffff', // Background
        base01: '#f5f5f5', // Lighter background
        base02: '#e8e8e8', // Selection background
        base03: '#969896', // Comments
        base04: '#282a2e', // Dark foreground
        base05: '#1d1f21', // Default foreground
        base06: '#1d1f21', // Light foreground
        base07: '#1d1f21', // Lightest foreground
        base08: '#cc6666', // Variables
        base09: '#de935f', // Numbers
        base0A: '#f0c674', // Strings
        base0B: '#b5bd68', // Classes
        base0C: '#8abeb7', // Support
        base0D: '#81a2be', // Functions
        base0E: '#b294bb', // Keywords
        base0F: '#a3685a'  // Deprecated
      };
    }
  };

  return (
    <div className="w-full mt-8">
      <div className={`rounded-3xl p-8 w-full`}
           style={{
             backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <h4 className={`text-2xl font-bold mb-6 text-center ${theme !== 'matrix' ? styles.text : ''}`} 
            style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
          Game State (Debug)
        </h4>
        <p className={`mb-6 text-lg text-center ${theme !== 'matrix' ? styles.text : ''}`} 
           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
          Current Game Status: <strong className={theme !== 'matrix' ? styles.text : ''} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>{gameStatus}</strong>
        </p>
        <div className={`max-h-96 overflow-x-auto overflow-y-auto rounded-lg p-4 ${styles.border} border`} 
             style={{
               backgroundColor: theme === 'matrix' ? '#000000' : theme === 'dark' ? '#1a1a1a' : '#ffffff',
               border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.7)' : undefined,
               width: '100%',
               minWidth: 0
             }}>
          <JsonViewer 
            value={game} 
            theme={getCustomTheme(theme)}
            indentWidth={2} 
            displayDataTypes={false}
            enableClipboard={true}
            collapseStringsAfterLength={80}
            defaultInspectDepth={1}
            rootName={false}
            style={{
              backgroundColor: theme === 'matrix' ? '#000000' : theme === 'dark' ? '#1a1a1a' : '#ffffff',
              fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              fontSize: '13px',
              lineHeight: '1.4',
              color: theme === 'matrix' ? '#00ff41' : undefined,
              width: '100%',
              minWidth: 0,
              overflow: 'hidden'
            }}
          />
        </div>
      </div>
    </div>
  );
};