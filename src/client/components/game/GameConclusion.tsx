import React from 'react';
import { PlayPageGame } from '@/client/types/game.types';
import { TTSWrapper } from '@/client/components/tts';

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
  // Only render if game has a conclusion
  if (!game.conclusion) {
    return null;
  }

  return (
    <TTSWrapper
      text={`Game Over! Conclusion: ${game.conclusion}`}
      buttonPosition="top-right"
      title="Read game conclusion aloud"
    >
      <div style={{ border: '1px solid #ddd', padding: '15px', marginTop: '20px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Game Over!</h3>
        <p><strong>Conclusion:</strong> {game.conclusion}</p>
      </div>
    </TTSWrapper>
  );
};