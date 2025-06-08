import React from 'react';
import { PlayPageGame } from '@/client/types/game.types';

interface GameHeaderProps {
  /** Current game object */
  game?: PlayPageGame | null;
  /** Current game ID */
  gameId?: string | null;
  /** Current error message */
  error?: string | null;
}

/**
 * GameHeader displays the main game title and error messages.
 * Extracted from the original monolithic component (lines 614-616).
 */
export const GameHeader: React.FC<GameHeaderProps> = ({
  game,
  gameId,
  error
}) => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>{game ? `AI RPG GAME - ${game.gameId}` : (gameId ? `AI RPG GAME - ${gameId}` : 'AI RPG Game')}</h1>

      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>Error: {error}</p>}
    </div>
  );
};