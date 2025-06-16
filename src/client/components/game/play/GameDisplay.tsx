import React from 'react';
import { PlayPageGame, PlayPageScene, PlayPageTurn, GameStatus } from '@/client/types/game.types';
import { SceneDisplay } from './SceneDisplay';
import { TurnDisplay } from './TurnDisplay';
import { CharacterActionForm } from './CharacterActionForm';

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
  /** Handler for turn submission */
  onSubmitTurn: () => Promise<void>;
  /** Handler for starting the game */
  onStartGame: () => Promise<void>;
  /** Whether all characters have made a choice */
  allCharactersMadeChoice: boolean;
  /** Whether any processing is currently happening */
  isProcessing: boolean;
  /** Whether waiting for SSE response */
  isWaitingForSSEResponse: boolean;
}

/**
 * GameDisplay shows the main game area including game details, start button, and current scene/turn.
 * Extracted from the original monolithic component (lines 770-890).
 */
export const GameDisplay: React.FC<GameDisplayProps> = ({
  game,
  gameStatus,
  selectedOptions,
  freeTextInputs,
  onOptionChange,
  onFreeTextChange,
  onSubmitTurn,
  onStartGame,
  allCharactersMadeChoice,
  isProcessing,
  isWaitingForSSEResponse
}) => {
  const currentScene: PlayPageScene | null = game && game.scenes?.length > 0 ? game.scenes[game.scenes.length - 1] : null;
  const currentTurn: PlayPageTurn | null = currentScene && currentScene.turns?.length > 0 ? currentScene.turns[currentScene.turns.length - 1] : null;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h4>Game Details:</h4>
        <p><strong>ID:</strong> {game.gameId}</p>
        {game.synopsis && <p><strong>Synopsis:</strong> {game.synopsis}</p>}
        {/* Specific messages for content generation are handled by the centralized status messages now */}
      </div>

      {/* Start Game Button: if synopsis exists, no current turn, not concluded, and status is idle */}
      {game.synopsis && !currentTurn && !game.conclusion && gameStatus === 'idle' && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={onStartGame}
            disabled={isProcessing || isWaitingForSSEResponse}
            style={{
              padding: '15px 25px',
              fontSize: '18px',
              backgroundColor: (isProcessing || isWaitingForSSEResponse) ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: (isProcessing || isWaitingForSSEResponse) ? 'not-allowed' : 'pointer'
            }}
          >
            Start Game
          </button>
        </div>
      )}

      {/* Current Scene and Turn Display */}
      {currentScene && gameStatus !== 'game_Over' && (
        <SceneDisplay currentScene={currentScene} game={game}>
          {currentTurn && (
            <TurnDisplay 
              currentTurn={currentTurn} 
              gameStatus={gameStatus}
              isGameConcluded={!!game.conclusion}
            >
              <CharacterActionForm
                currentTurn={currentTurn}
                selectedOptions={selectedOptions}
                freeTextInputs={freeTextInputs}
                onOptionChange={onOptionChange}
                onFreeTextChange={onFreeTextChange}
                onSubmitTurn={onSubmitTurn}
                allCharactersMadeChoice={allCharactersMadeChoice}
                isProcessing={isProcessing}
                isWaitingForSSEResponse={isWaitingForSSEResponse}
              />
            </TurnDisplay>
          )}
        </SceneDisplay>
      )}
    </div>
  );
};