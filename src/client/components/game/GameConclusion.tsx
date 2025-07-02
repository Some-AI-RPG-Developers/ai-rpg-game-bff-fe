import React from 'react';
import { PlayPageGame } from '@/client/types/game.types';
import { TTSWrapper } from '@/client/components/tts';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { Trophy } from 'lucide-react';

interface GameConclusionProps {
  /** Current game object */
  game: PlayPageGame;
}

/**
 * GameConclusion displays the game over screen with the conclusion text.
 * Extracted from the original monolithic component (lines 883-888).
 */
export const GameConclusion: React.FC<GameConclusionProps> = ({
  game
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  // Only render if game has a conclusion
  if (!game.conclusion) {
    return null;
  }

  return (
    <div className="flex flex-col items-center mt-8">
      <div className={`rounded-3xl p-8 w-2/3 max-w-2xl text-center mx-auto ${
        theme === 'dark' ? 'dark-fantasy-game-conclusion' : ''
      }`}
           style={{
             backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <Trophy size={32} className={theme !== 'matrix' ? styles.text : ''}
                  style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
          <h3 className={`text-3xl font-bold ${theme !== 'matrix' ? styles.text : ''}`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
            Game Over!
          </h3>
          <Trophy size={32} className={theme !== 'matrix' ? styles.text : ''}
                  style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
        </div>
        <div className="mt-6">
          <div className={`rounded-lg p-4 ${
            theme === 'dark' ? 'dark-fantasy-scene-description' :
            theme !== 'matrix' ? styles.border : ''
          }`}
               style={{
                 ...(theme === 'matrix' && {
                   backgroundColor: 'rgba(0, 255, 65, 0.1)',
                   border: '1px solid rgba(0, 255, 65, 0.5)'
                 }),
                 ...(theme === 'light' && {
                   backgroundColor: '#e6f7ff',
                   border: '1px solid #b3e0ff'
                 })
               }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <TTSWrapper
                text={`Game Conclusion: ${game.conclusion}`}
                buttonPosition="inline-end"
                title="Read game conclusion aloud"
              >
                <h6 className={`text-lg font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                    style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                  Game Conclusion
                </h6>
              </TTSWrapper>
            </div>
            <p className={`text-base leading-relaxed text-center ${
              theme === 'dark' ? 'dark-fantasy-text-light' :
              theme !== 'matrix' ? styles.text : ''
            }`}
               style={{
                 color: theme === 'matrix' ? '#00ff41' : undefined,
                 opacity: theme === 'matrix' ? 0.9 : 0.8
               }}>
              {game.conclusion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};