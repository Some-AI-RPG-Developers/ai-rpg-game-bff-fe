import React from 'react';
import { ViewMode } from '@/client/types/ui.types';

interface ResumeGameFormProps {
  /** Current value of the game ID input */
  resumeGameIdInput: string;
  /** Handler for game ID input changes */
  onResumeGameIdChange: (value: string) => void;
  /** Handler for loading a game by ID */
  onLoadGameById: () => void;
  /** Handler for changing view mode */
  onViewModeChange: (mode: ViewMode) => void;
  /** Handler for clearing errors */
  onErrorClear: () => void;
  /** Whether any processing is currently happening */
  isProcessing: boolean;
}

/**
 * ResumeGameForm displays the form for resuming an existing game by entering its ID.
 * Extracted from the original monolithic component (lines 652-678).
 */
export const ResumeGameForm: React.FC<ResumeGameFormProps> = ({
  resumeGameIdInput,
  onResumeGameIdChange,
  onLoadGameById,
  onViewModeChange,
  onErrorClear,
  isProcessing
}) => {
  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h3>Resume Game</h3>
      <div>
        <label htmlFor="resumeGameId" style={{ display: 'block', marginBottom: '5px' }}>Enter Game ID:</label>
        <input
          type="text"
          id="resumeGameId"
          value={resumeGameIdInput}
          onChange={(e) => onResumeGameIdChange(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', minWidth: '250px' }}
          disabled={isProcessing}
        />
        <button
          onClick={onLoadGameById}
          disabled={isProcessing || !resumeGameIdInput.trim()}
          style={{ padding: '8px 15px', fontSize: '16px' }}
        >
          Load Game
        </button>
      </div>
      <button 
        onClick={() => { 
          onViewModeChange('choice'); 
          onErrorClear(); 
        }} 
        style={{ marginTop: '15px', fontSize: '14px' }} 
        disabled={isProcessing}
      >
        Back to choices
      </button>
    </div>
  );
};