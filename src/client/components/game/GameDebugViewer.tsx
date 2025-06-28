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

  // Custom theme overrides for better visibility
  const getCustomTheme = (currentTheme: string) => {
    const baseTheme = {
      scheme: currentTheme === 'light' ? 'light' : 'dark',
      author: 'custom',
      base00: currentTheme === 'light' ? '#ffffff' : currentTheme === 'matrix' ? '#000000' : '#1a1a1a',
      base01: currentTheme === 'light' ? '#f5f5f5' : currentTheme === 'matrix' ? '#0a0a0a' : '#2d2d2d',
      base02: currentTheme === 'light' ? '#e8e8e8' : currentTheme === 'matrix' ? '#1a1a1a' : '#383838',
      base03: currentTheme === 'light' ? '#969896' : currentTheme === 'matrix' ? '#008f11' : '#5e5e5e',
      base04: currentTheme === 'light' ? '#282a2e' : currentTheme === 'matrix' ? '#00ff41' : '#b4b7b4',
      base05: currentTheme === 'light' ? '#1d1f21' : currentTheme === 'matrix' ? '#00ff41' : '#c5c8c6',
      base06: currentTheme === 'light' ? '#1d1f21' : currentTheme === 'matrix' ? '#00ff41' : '#e0e0e0',
      base07: currentTheme === 'light' ? '#ffffff' : currentTheme === 'matrix' ? '#00ff41' : '#ffffff',
      base08: currentTheme === 'light' ? '#cc6666' : currentTheme === 'matrix' ? '#ff6b6b' : '#cc6666',
      base09: currentTheme === 'light' ? '#de935f' : currentTheme === 'matrix' ? '#00ff41' : '#de935f',
      base0A: currentTheme === 'light' ? '#f0c674' : currentTheme === 'matrix' ? '#00ff41' : '#f0c674',
      base0B: currentTheme === 'light' ? '#b5bd68' : currentTheme === 'matrix' ? '#00ff41' : '#b5bd68',
      base0C: currentTheme === 'light' ? '#8abeb7' : currentTheme === 'matrix' ? '#00ff41' : '#8abeb7',
      base0D: currentTheme === 'light' ? '#81a2be' : currentTheme === 'matrix' ? '#00ff41' : '#81a2be',
      base0E: currentTheme === 'light' ? '#b294bb' : currentTheme === 'matrix' ? '#00ff41' : '#b294bb',
      base0F: currentTheme === 'light' ? '#a3685a' : currentTheme === 'matrix' ? '#00ff41' : '#a3685a'
    };
    return baseTheme;
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <div className={`rounded-3xl p-8 max-w-lg`}
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
            style={{
              backgroundColor: theme === 'matrix' ? '#000000' : theme === 'dark' ? '#1a1a1a' : '#ffffff',
              fontFamily: 'monospace',
              fontSize: '14px',
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