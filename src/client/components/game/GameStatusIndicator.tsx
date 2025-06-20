import React from 'react';
import { GameStatus } from '@/client/types/game.types';

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
  const isProcessing =
    gameStatus === 'creatingGame_InProgress' ||
    gameStatus === 'loadingGame_WaitingForData' ||
    gameStatus === 'recreatingGame_InProgress' ||
    gameStatus === 'startingGame_InProgress' ||
    gameStatus === 'turn_Submitting';

  // Determine if we are waiting for SSE to deliver game content/updates
  const isWaitingForSSEResponse =
    gameStatus === 'creatingGame_WaitingForData' ||
    gameStatus === 'recreatingGame_WaitingForData' ||
    gameStatus === 'contentGen_Characters_WaitingForData' ||
    gameStatus === 'contentGen_Settings_WaitingForData' ||
    gameStatus === 'startingGame_WaitingForFirstTurn' ||
    gameStatus === 'turn_Resolving' ||
    gameStatus === 'turn_GeneratingNext' ||
    gameStatus === 'scene_GeneratingNext';

  // Only show status indicator if we have processing, waiting, or error states
  if (!isProcessing && !isWaitingForSSEResponse && gameStatus !== 'error_GameSetupFailed') {
    return null;
  }

  return (
    <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}>
      {gameStatus === 'creatingGame_InProgress' && <p>Creating your game world...</p>}
      {gameStatus === 'loadingGame_WaitingForData' && gameId && <p>Loading game data for {gameId}...</p>}
      {gameStatus === 'recreatingGame_InProgress' && <p>Re-initializing game content...</p>}
      {gameStatus === 'creatingGame_WaitingForData' && <p>Game created! Waiting for initial game data (characters, synopsis)...</p>}
      {gameStatus === 'recreatingGame_WaitingForData' && <p>Re-initialization triggered. Waiting for updated game data...</p>}
      {gameStatus === 'contentGen_Characters_WaitingForData' && <p>Generating characters...</p>}
      {gameStatus === 'contentGen_Settings_WaitingForData' && <p>Generating game setting and synopsis...</p>}
      {gameStatus === 'startingGame_InProgress' && <p>Starting your adventure...</p>}
      {gameStatus === 'startingGame_WaitingForFirstTurn' && <p>Preparing the first scene...</p>}
      {gameStatus === 'turn_Submitting' && <p>Submitting turn... Please wait.</p>}
      {gameStatus === 'turn_Resolving' && <p>Processing turn resolution...</p>}
      {gameStatus === 'turn_GeneratingNext' && <p>Generating next turn...</p>}
      {gameStatus === 'scene_GeneratingNext' && <p>Generating next scene...</p>}
      {gameStatus === 'error_GameSetupFailed' && !error && <p style={{color: 'orange'}}>Game setup encountered an issue. Please check other error messages or try again.</p>}
    </div>
  );
};