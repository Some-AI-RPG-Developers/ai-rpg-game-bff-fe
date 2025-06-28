import React from 'react';
import { GameStatus } from '@/client/types/game.types';
import { isProcessingStatus, isWaitingForSSEStatus, getStatusMessage } from '@/client/hooks/useGameState';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { Loader2, AlertTriangle } from 'lucide-react';

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
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  // Determine if any critical loading/processing is happening
  const isProcessing = isProcessingStatus(gameStatus);

  // Determine if we are waiting for SSE to deliver game content/updates
  const isWaitingForSSEResponse = isWaitingForSSEStatus(gameStatus);

  // Only show status indicator if we have processing, waiting, or error states
  if (!isProcessing && !isWaitingForSSEResponse && gameStatus !== 'error_GameSetupFailed') {
    return null;
  }

  // Get the status message from centralized function
  const statusMessage = getStatusMessage(gameStatus, gameId);

  const isError = gameStatus === 'error_GameSetupFailed';

  return (
    <div className="flex flex-col items-center mt-6">
      <div className={`rounded-3xl p-6 max-w-lg text-center`}
           style={{
             backgroundColor: theme === 'matrix' ? 
               (isError ? 'rgba(51, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)') : undefined,
             border: theme === 'matrix' ? 
               (isError ? '1px solid rgba(255, 68, 68, 0.5)' : '1px solid rgba(0, 255, 65, 0.3)') : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          {isError ? (
            <AlertTriangle size={24} className={theme !== 'matrix' ? styles.text : ''}
                          style={{ color: theme === 'matrix' ? '#ff6666' : undefined }} />
          ) : (
            <Loader2 size={24} className={`animate-spin ${theme !== 'matrix' ? styles.text : ''}`}
                     style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
          )}
          <h4 className={`text-lg font-bold ${theme !== 'matrix' ? styles.text : ''}`}
              style={{ color: theme === 'matrix' ? (isError ? '#ff6666' : '#00ff41') : undefined }}>
            {isError ? 'Status Update' : 'Processing'}
          </h4>
        </div>
        {statusMessage && (
          <p className={`text-lg ${theme !== 'matrix' ? styles.text : ''}`}
             style={{ 
               color: theme === 'matrix' ? (isError ? '#ff6666' : '#00ff41') : undefined,
               opacity: theme === 'matrix' ? 0.9 : 0.8
             }}>
            {statusMessage}
          </p>
        )}
        {gameStatus === 'error_GameSetupFailed' && !error && (
          <p className={`mt-3 text-lg ${theme !== 'matrix' ? styles.text : ''}`}
             style={{ 
               color: theme === 'matrix' ? '#ff6666' : 'orange',
               opacity: theme === 'matrix' ? 0.9 : 0.8
             }}>
            Game setup encountered an issue. Please check other error messages or try again.
          </p>
        )}
      </div>
    </div>
  );
};