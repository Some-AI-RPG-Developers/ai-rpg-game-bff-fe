import React from 'react';
import { JsonViewer } from '@textea/json-viewer';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';

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
  return (
    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #ccc' }}>
      <h4>Game State (Debug):</h4>
      <p>Current Game Status: <strong>{gameStatus}</strong></p>
      <div style={{ maxHeight: '500px', overflowY: 'auto', marginBottom: '0px' }}>
        <JsonViewer value={game} theme="light" indentWidth={2} displayDataTypes={false} />
      </div>
    </div>
  );
};