import React from 'react';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { Send, Play, RotateCcw } from 'lucide-react';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';

interface GameActionButtonsProps {
  /** Current game object */
  game?: PlayPageGame | null;
  /** Current game status */
  gameStatus: GameStatus;
  /** Whether all characters have made their choices */
  allCharactersMadeChoice: boolean;
  /** Whether any processing is currently happening */
  isProcessing: boolean;
  /** Handler for submitting the current turn */
  onSubmitTurn: () => Promise<void>;
  /** Handler for starting the game */
  onStartGame: () => Promise<void>;
  /** Handler for starting the next turn */
  onStartNextTurn: () => Promise<void>;
}

/**
 * GameActionButtons displays the centralized action buttons for game operations.
 * This component handles submit turn, start game, and other game action buttons.
 */
export const GameActionButtons: React.FC<GameActionButtonsProps> = ({
  game,
  gameStatus,
  allCharactersMadeChoice,
  isProcessing,
  onSubmitTurn,
  onStartGame,
  onStartNextTurn
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  // Don't render if no game exists
  if (!game) {
    return null;
  }

  // Check if we have a current turn that needs actions
  const currentScene = game.scenes?.[game.scenes.length - 1];
  const currentTurn = currentScene?.turns?.[currentScene.turns.length - 1];
  const hasUnresolvedTurn = currentTurn && currentTurn.options && !currentTurn.consequences;
  const hasResolvedTurn = currentTurn && currentTurn.consequences;

  // Determine which button to show based on game state
  const showSubmitTurnButton = hasUnresolvedTurn && allCharactersMadeChoice && gameStatus === 'idle';
  const showStartGameButton = gameStatus === 'game_ReadyToStart';
  const showStartNextTurnButton = hasResolvedTurn && gameStatus === 'idle' && !game.conclusion;

  // Don't render if no buttons should be shown
  if (!showSubmitTurnButton && !showStartGameButton && !showStartNextTurnButton) {
    return null;
  }

  return (
    <div className="flex justify-center mt-8">
      {showSubmitTurnButton && (
        <button
          onClick={onSubmitTurn}
          disabled={isProcessing}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 
            hover:shadow-2xl flex items-center gap-3 disabled:opacity-50 ${theme !== 'matrix' ? `${styles.accent} ${styles.text}` : ''}`}
          style={{
            backgroundColor: theme === 'matrix' ? '#004d00' : undefined,
            color: theme === 'matrix' ? '#00ff41' : undefined,
            border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
            boxShadow: theme === 'matrix' ? '0 0 15px rgba(0, 255, 65, 0.4)' : undefined
          }}
        >
          <Send size={24} />
          {isProcessing ? 'Submitting Turn...' : 'Submit Turn'}
        </button>
      )}

      {showStartGameButton && (
        <button
          onClick={onStartGame}
          disabled={isProcessing}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 
            hover:shadow-2xl flex items-center gap-3 disabled:opacity-50 ${theme !== 'matrix' ? `${styles.accent} ${styles.text}` : ''}`}
          style={{
            backgroundColor: theme === 'matrix' ? '#004d00' : undefined,
            color: theme === 'matrix' ? '#00ff41' : undefined,
            border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
            boxShadow: theme === 'matrix' ? '0 0 15px rgba(0, 255, 65, 0.4)' : undefined
          }}
        >
          <Play size={24} />
          {isProcessing ? 'Starting Game...' : 'Start Game'}
        </button>
      )}

      {showStartNextTurnButton && (
        <button
          onClick={onStartNextTurn}
          disabled={isProcessing}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 
            hover:shadow-2xl flex items-center gap-3 disabled:opacity-50 ${theme !== 'matrix' ? `${styles.accent} ${styles.text}` : ''}`}
          style={{
            backgroundColor: theme === 'matrix' ? '#004d00' : undefined,
            color: theme === 'matrix' ? '#00ff41' : undefined,
            border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
            boxShadow: theme === 'matrix' ? '0 0 15px rgba(0, 255, 65, 0.4)' : undefined
          }}
        >
          <RotateCcw size={24} />
          {isProcessing ? 'Starting Next Turn...' : 'Start Next Turn'}
        </button>
      )}
    </div>
  );
};