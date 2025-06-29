import React from 'react';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { X, Bug } from 'lucide-react';
import { GameDebugViewer } from '@/client/components/game/GameDebugViewer';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';

interface GameDebugModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Current game object */
  game: PlayPageGame | null;
  /** Current game status */
  gameStatus: GameStatus;
}

/**
 * GameDebugModal displays the game debug information in a centered modal overlay.
 */
export const GameDebugModal: React.FC<GameDebugModalProps> = ({
  isOpen,
  onClose,
  game,
  gameStatus
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close modal - must be called before any early returns
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.95)' : '#ffffff',
          border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.5)' : '1px solid #e5e7eb',
          boxShadow: theme === 'matrix' ? '0 0 30px rgba(0, 255, 65, 0.3)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{
            borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.3)' : '#e5e7eb',
            backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : '#f9fafb'
          }}
        >
          <div className="flex items-center gap-3">
            <Bug 
              size={24} 
              style={{ color: theme === 'matrix' ? '#00ff41' : '#6b7280' }}
            />
            <h2 
              className={`text-2xl font-bold ${theme !== 'matrix' ? styles.text : ''}`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
            >
              Game Debug Information
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${theme !== 'matrix' ? 'hover:bg-gray-100' : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
              color: theme === 'matrix' ? '#00ff41' : '#6b7280',
              border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div 
          className="overflow-y-auto p-6"
          style={{ 
            maxHeight: 'calc(90vh - 120px)',
            backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.8)' : undefined
          }}
        >
          {game && <GameDebugViewer game={game} gameStatus={gameStatus} />}
        </div>
      </div>
    </div>
  );
};