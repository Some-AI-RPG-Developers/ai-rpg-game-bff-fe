import React from 'react';
import { PlayPageTurn, GameStatus } from '@/client/types/game.types';
import { TTSWrapper } from '@/client/components/tts';
import { CharacterActionForm } from './CharacterActionForm';

interface TurnDisplayProps {
  /** Current turn object */
  currentTurn: PlayPageTurn;
  /** Current game status */
  gameStatus: GameStatus;
  /** Whether the game has concluded */
  isGameConcluded: boolean;
  /** Currently selected options for each character */
  selectedOptions: Record<string, string>;
  /** Current free text inputs for each character */
  freeTextInputs: Record<string, string>;
  /** Handler for option changes */
  onOptionChange: (characterName: string, optionValue: string) => void;
  /** Handler for free text changes */
  onFreeTextChange: (characterName: string, text: string) => void;
  /** Handler for turn submission */
  onSubmitTurn: () => Promise<void>;
  /** Whether all characters have made a choice */
  allCharactersMadeChoice: boolean;
  /** Whether any processing is currently happening */
  isProcessing: boolean;
  /** Whether waiting for SSE response */
  isWaitingForSSEResponse: boolean;
}

/**
 * TurnDisplay shows the current turn information including description and consequences.
 * Extracted from the original monolithic component turn display logic.
 */
export const TurnDisplay: React.FC<TurnDisplayProps> = ({
  currentTurn,
  gameStatus,
  isGameConcluded,
  selectedOptions,
  freeTextInputs,
  onOptionChange,
  onFreeTextChange,
  onSubmitTurn,
  allCharactersMadeChoice,
  isProcessing,
  isWaitingForSSEResponse
}) => {
  return (
    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
      <div>
        <TTSWrapper
          text={currentTurn.description ? `Turn: ${currentTurn.turnId}, Turn ${currentTurn.turnNumber}. ${currentTurn.description}` : undefined}
          buttonPosition="inline-end"
          title="Read turn description aloud"
        >
          <strong>Turn: {currentTurn.turnId} (Turn {currentTurn.turnNumber})</strong>
        </TTSWrapper>
        {currentTurn.description && (
          <p style={{ margin: '5px 0 10px 0', maxWidth: '90ch' }}>{currentTurn.description}</p>
        )}
      </div>
      
      {/* Chosen Options: Show if actions exist (player choices were made) */}
      {currentTurn.actions && currentTurn.actions.length > 0 && (
        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fff4e6', border: '1px solid #ffcc99', borderRadius: '3px' }}>
          <TTSWrapper
            text={`Chosen Options: ${currentTurn.actions.map(action => `${action.name}: ${action.message}`).join('. ')}`}
            buttonPosition="inline-end"
            title="Read chosen options aloud"
          >
            <strong>Chosen Options:</strong>
          </TTSWrapper>
          <div style={{ margin: '5px 0 0 0' }}>
            {currentTurn.actions.map((action, index) => (
              <p key={index} style={{ margin: '2px 0', maxWidth: '90ch' }}>
                <strong>{action.name}:</strong> {action.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {currentTurn.consequences && (
        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e6ffed', border: '1px solid #b2fab4', borderRadius: '3px' }}>
          <TTSWrapper
            text={`Resolution: ${currentTurn.consequences}`}
            buttonPosition="inline-end"
            title="Read turn resolution aloud"
          >
            <strong>Resolution:</strong>
          </TTSWrapper>
          <p style={{ margin: '5px 0 0 0', maxWidth: '90ch' }}>{currentTurn.consequences}</p>
        </div>
      )}

      {/* Character Options/Input: Show if options exist, no consequences yet, game not over, and status is idle */}
      {currentTurn.options && !currentTurn.consequences && !isGameConcluded && gameStatus === 'idle' && (
        <CharacterActionForm
          currentTurn={currentTurn}
          selectedOptions={selectedOptions}
          freeTextInputs={freeTextInputs}
          onOptionChange={onOptionChange}
          onFreeTextChange={onFreeTextChange}
          onSubmitTurn={onSubmitTurn}
          allCharactersMadeChoice={allCharactersMadeChoice}
          isProcessing={isProcessing}
          isWaitingForSSEResponse={isWaitingForSSEResponse}
        />
      )}
    </div>
  );
};