import React from 'react';
import { GameStatus } from '@/client/types/game.types';
import { isProcessingStatus, isWaitingForSSEStatus, getStatusMessage } from '@/client/hooks/useGameStatus';

interface GameStatusIndicatorProps {
  /** Current game status */
  gameStatus: GameStatus;
  /** Current game ID for loading messages */
  gameId?: string | null;
  /** Error message to display */
  error?: string | null;
}

/**
 * GameStatusIndicator displays centralized status messages for game state transitions.
 * Extracted from the original monolithic component (lines 619-636).
 */
export const GameStatusIndicator: React.FC<GameStatusIndicatorProps> = ({
  gameStatus,
  gameId,
  error
}) => {
  // Determine if any critical loading/processing is happening
  const isProcessing = isProcessingStatus(gameStatus);

  // Determine if we are waiting for SSE to deliver game content/updates
  const isWaitingForSSEResponse = isWaitingForSSEStatus(gameStatus);

  // Only show status indicator if we have processing, waiting, or error states
  // Also show a helpful message if game is ready to start but has scenes (retry scenario)
  const showRetryMessage = gameStatus === 'game_ReadyToStart' && gameId;
  
  if (!isProcessing && !isWaitingForSSEResponse && gameStatus !== 'error_GameSetupFailed' && !showRetryMessage) {
    return null;
  }

  // Get the status message from centralized function
  const statusMessage = getStatusMessage(gameStatus, gameId);

  return (
    <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}>
      {statusMessage && <p>{statusMessage}</p>}
      {gameStatus === 'error_GameSetupFailed' && !error && <p style={{color: 'orange'}}>Game setup encountered an issue. Please check other error messages or try again.</p>}
      {showRetryMessage && <p style={{color: '#2196F3'}}>Game ready to start. Click <b>Start Game</b> to begin or retry if needed.</p>}
    </div>
  );
};