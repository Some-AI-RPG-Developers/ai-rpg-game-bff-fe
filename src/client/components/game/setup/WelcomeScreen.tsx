import React from 'react';
import { ViewMode } from '@/client/types/ui.types';

interface WelcomeScreenProps {
  /** Handler for changing view mode */
  onViewModeChange: (mode: ViewMode) => void;
  /** Whether any processing is currently happening */
  isProcessing: boolean;
}

/**
 * WelcomeScreen displays the initial choice between creating a new game or resuming an existing one.
 * Extracted from the original monolithic component (lines 640-650).
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onViewModeChange,
  isProcessing
}) => {
  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Welcome!</h2>
      <button 
        onClick={() => onViewModeChange('create')} 
        style={{ padding: '10px 15px', fontSize: '16px', marginRight: '10px' }} 
        disabled={isProcessing}
      >
        Create New Game
      </button>
      <button 
        onClick={() => onViewModeChange('resume')} 
        style={{ padding: '10px 15px', fontSize: '16px' }} 
        disabled={isProcessing}
      >
        Resume Game
      </button>
    </div>
  );
};