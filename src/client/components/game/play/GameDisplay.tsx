import React from 'react';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';
import { SceneDisplay } from './SceneDisplay';
import { TurnDisplay } from './TurnDisplay';
import { TTSWrapper } from '@/client/components/tts';

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
  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h4>Game Details:</h4>
        <p><strong>ID:</strong> {game.gameId}</p>
        {game.synopsis && (
          <div style={{ marginTop: '10px' }}>
            <TTSWrapper
              text={`Synopsis: ${game.synopsis}`}
              buttonPosition="inline-end"
              title="Read synopsis aloud"
            >
              <strong>Synopsis:</strong>
            </TTSWrapper>
            <p style={{ margin: '5px 0 0 0', maxWidth: '90ch' }}>{game.synopsis}</p>
          </div>
        )}
        {/* Specific messages for content generation are handled by the centralized status messages now */}
      </div>

      {/* All Scenes and Turns Display */}
      {game.scenes && game.scenes.length > 0 && (
        <div>
          {game.scenes.map((scene, sceneIndex) => (
            <SceneDisplay
              key={scene.sceneId || sceneIndex}
              currentScene={scene}
              sceneNumber={sceneIndex + 1}
            >
              {scene.turns && scene.turns.length > 0 && (
                <div>
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