import React from 'react';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';
import { SceneDisplay } from './SceneDisplay';
import { TurnDisplay } from './TurnDisplay';
import { TTSWrapper } from '@/client/components/tts';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';

interface GameDisplayProps {
  /** Current game object */
  game: PlayPageGame;
  /** Current game status */
  gameStatus: GameStatus;
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
 * GameDisplay shows the main game area including game details and current scene/turn.
 * Buttons have been moved to a centralized location at the bottom of the page.
 * Extracted from the original monolithic component (lines 770-890).
 */
export const GameDisplay: React.FC<GameDisplayProps> = ({
  game,
  gameStatus,
  selectedOptions,
  freeTextInputs,
  onOptionChange,
  onFreeTextChange,
  isProcessing
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className="flex flex-col items-center mt-8">
      <div className={`rounded-3xl p-8 max-w-lg mb-8`}
           style={{
             backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <h4 className={`text-2xl font-bold mb-6 ${theme !== 'matrix' ? styles.text : ''}`}
            style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
          Game Details
        </h4>
        <p className={`mb-4 text-lg ${theme !== 'matrix' ? styles.text : ''}`}
           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
          <strong>ID:</strong> {game.gameId}
        </p>
        {game.synopsis && (
          <div className="mt-6">
            <TTSWrapper
              text={`Synopsis: ${game.synopsis}`}
              buttonPosition="inline-end"
              title="Read synopsis aloud"
            >
              <strong className={theme !== 'matrix' ? styles.text : ''}
                      style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                Synopsis:
              </strong>
            </TTSWrapper>
            <p className={`mt-3 text-lg leading-relaxed ${theme !== 'matrix' ? styles.text : ''}`}
               style={{ 
                 color: theme === 'matrix' ? '#00ff41' : undefined,
                 opacity: theme === 'matrix' ? 0.9 : 0.8,
                 maxWidth: '90ch' 
               }}>
              {game.synopsis}
            </p>
          </div>
        )}
      </div>

      {/* All Scenes and Turns Display */}
      {game.scenes && game.scenes.length > 0 && (
        <div className="w-full max-w-lg space-y-6">
          {game.scenes.map((scene, sceneIndex) => (
            <SceneDisplay
              key={scene.sceneId || sceneIndex}
              currentScene={scene}
              sceneNumber={sceneIndex + 1}
            >
              {scene.turns && scene.turns.length > 0 && (
                <div className="space-y-4">
                  {scene.turns.map((turn, turnIndex) => (
                    <TurnDisplay
                      key={turn.turnId || turnIndex}
                      currentTurn={turn}
                      gameStatus={gameStatus}
                      isGameConcluded={!!game.conclusion}
                      turnNumber={turnIndex + 1}
                      selectedOptions={selectedOptions}
                      freeTextInputs={freeTextInputs}
                      onOptionChange={onOptionChange}
                      onFreeTextChange={onFreeTextChange}
                      isProcessing={isProcessing}
                    />
                  ))}
                </div>
              )}
            </SceneDisplay>
          ))}
        </div>
      )}
    </div>
  );
}; 