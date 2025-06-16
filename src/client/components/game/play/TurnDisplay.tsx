import React from 'react';
import { PlayPageTurn, GameStatus } from '@/client/types/game.types';
import { TTSWrapper } from '@/client/components/tts';

interface TurnDisplayProps {
  /** Current turn object */
  currentTurn: PlayPageTurn;
  /** Current game status */
  gameStatus: GameStatus;
  /** Whether the game has concluded */
  isGameConcluded: boolean;
  /** Children components (typically CharacterActionForm) */
  children?: React.ReactNode;
}

/**
 * TurnDisplay shows the current turn information including description and consequences.
 * Extracted from the original monolithic component turn display logic.
 */
export const TurnDisplay: React.FC<TurnDisplayProps> = ({
  currentTurn,
  gameStatus,
  isGameConcluded,
  children
}) => {
  return (
    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
      <TTSWrapper
        text={currentTurn.description ? `Current Turn: ${currentTurn.turnId}, Turn ${currentTurn.turnNumber}. ${currentTurn.description}` : undefined}
        buttonPosition="inline-end"
        title="Read turn description aloud"
      >
        <h5>Current Turn: {currentTurn.turnId} (Turn {currentTurn.turnNumber})</h5>
      </TTSWrapper>
      
      {currentTurn.description && (
        <div style={{ marginBottom: '10px' }}>
          <p style={{ margin: '0 0 10px 0', maxWidth: '90ch' }}>{currentTurn.description}</p>
        </div>
      )}
      
      {currentTurn.consequences && (
        <TTSWrapper
          text={`Resolution: ${currentTurn.consequences}`}
          buttonPosition="top-right"
          title="Read turn resolution aloud"
        >
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e6ffed', border: '1px solid #b2fab4', borderRadius: '3px' }}>
            <strong>Resolution:</strong> {currentTurn.consequences}
          </div>
        </TTSWrapper>
      )}

      {/* Character Options/Input: Show if options exist, no consequences yet, game not over, and status is idle */}
      {currentTurn.options && !currentTurn.consequences && !isGameConcluded && gameStatus === 'idle' && children}
    </div>
  );
};