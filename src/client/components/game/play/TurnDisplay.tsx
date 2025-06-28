import React from 'react';
import {PlayPageTurn, GameStatus} from '@/client/types/game.types';
import {TTSWrapper} from '@/client/components/tts';
import {CharacterActionForm} from './CharacterActionForm';
import {useTheme} from '@/client/context/ThemeContext';
import {getThemeStyles} from '@/client/utils/themeStyles';
import {Clock, Users, CheckCircle} from 'lucide-react';

interface TurnDisplayProps {
    /** Current turn object */
    currentTurn: PlayPageTurn;
    /** Current game status */
    gameStatus: GameStatus;
    /** Whether the game has concluded */
    isGameConcluded: boolean;
    /** Turn number (1-based) */
    turnNumber?: number;
    /** Currently selected options for each character */
    selectedOptions: Record<string, string>;
    /** Current free text inputs for each character */
    freeTextInputs: Record<string, string>;
    /** Handler for option changes */
    onOptionChange: (characterName: string, optionValue: string) => void;
    /** Handler for free text changes */
    onFreeTextChange: (characterName: string, text: string) => void;
    /** Whether any processing is currently happening */
    isProcessing: boolean;
}

/**
 * TurnDisplay shows the current turn information including description and consequences.
 * Extracted from the original monolithic component turn display logic.
 */
export const TurnDisplay: React.FC<TurnDisplayProps> = ({
                                                            currentTurn,
                                                            gameStatus,
                                                            isGameConcluded,
                                                            turnNumber,
                                                            selectedOptions,
                                                            freeTextInputs,
                                                            onOptionChange,
                                                            onFreeTextChange,
                                                            isProcessing
                                                        }) => {
    const {theme} = useTheme();
    const styles = getThemeStyles(theme);

    return (
        <div className="flex flex-col items-center mt-4">
            <div className={`rounded-2xl p-6 max-w-lg text-center`}
                 style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
                     border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.4)' : undefined,
                     backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined,
                     borderTop: theme === 'matrix' ? '1px dashed rgba(0, 255, 65, 0.5)' : '1px dashed #ccc'
                 }}>
                <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Clock size={18} className={theme !== 'matrix' ? styles.text : ''}
                               style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                        <TTSWrapper
                            text={currentTurn.description ? `Turn: ${currentTurn.turnId}, Turn ${turnNumber || currentTurn.turnNumber || 'Unknown'}. ${currentTurn.description}` : undefined}
                            buttonPosition="inline-end"
                            title="Read turn description aloud"
                        >
                            <strong className={`text-base ${theme !== 'matrix' ? styles.text : ''}`}
                                    style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                Turn: {currentTurn.turnId} (Turn {turnNumber || currentTurn.turnNumber || 'Unknown'})
                            </strong>
                        </TTSWrapper>
                    </div>
                    {currentTurn.description && (
                        <p className={`text-base leading-relaxed ${theme !== 'matrix' ? styles.text : ''}`}
                           style={{
                               color: theme === 'matrix' ? '#00ff41' : undefined,
                               opacity: theme === 'matrix' ? 0.9 : 0.8,
                               maxWidth: '90ch'
                           }}>
                            {currentTurn.description}
                        </p>
                    )}
                </div>

                {/* Chosen Options: Show if actions exist (player choices were made) */}
                {currentTurn.actions && currentTurn.actions.length > 0 && (
                    <div className={`mb-4 p-4 rounded-lg`}
                         style={{
                             backgroundColor: theme === 'matrix' ? 'rgba(255, 165, 0, 0.1)' : '#fff4e6',
                             border: theme === 'matrix' ? '1px solid rgba(255, 165, 0, 0.5)' : '1px solid #ffcc99'
                         }}>
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Users size={18} className={theme !== 'matrix' ? styles.text : ''}
                                   style={{color: theme === 'matrix' ? '#ffa500' : undefined}}/>
                            <TTSWrapper
                                text={`Chosen Options: ${currentTurn.actions.map(action => `${action.name}: ${action.message}`).join('. ')}`}
                                buttonPosition="inline-end"
                                title="Read chosen options aloud"
                            >
                                <strong className={`text-base ${theme !== 'matrix' ? styles.text : ''}`}
                                        style={{color: theme === 'matrix' ? '#ffa500' : undefined}}>
                                    Chosen Options:
                                </strong>
                            </TTSWrapper>
                        </div>
                        <div className="space-y-2">
                            {currentTurn.actions.map((action, index) => (
                                <p key={index}
                                   className={`text-sm leading-relaxed ${theme !== 'matrix' ? styles.text : ''}`}
                                   style={{
                                       color: theme === 'matrix' ? '#ffa500' : undefined,
                                       opacity: theme === 'matrix' ? 0.9 : 0.8,
                                       maxWidth: '90ch'
                                   }}>
                                    <strong>{action.name}:</strong> {action.message}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {currentTurn.consequences && (
                    <div className={`mb-4 p-4 rounded-lg`}
                         style={{
                             backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.15)' : '#e6ffed',
                             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.6)' : '1px solid #b2fab4'
                         }}>
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <CheckCircle size={18} className={theme !== 'matrix' ? styles.text : ''}
                                         style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                            <TTSWrapper
                                text={`Resolution: ${currentTurn.consequences}`}
                                buttonPosition="inline-end"
                                title="Read turn resolution aloud"
                            >
                                <strong className={`text-base ${theme !== 'matrix' ? styles.text : ''}`}
                                        style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                    Resolution:
                                </strong>
                            </TTSWrapper>
                        </div>
                        <p className={`text-base leading-relaxed ${theme !== 'matrix' ? styles.text : ''}`}
                           style={{
                               color: theme === 'matrix' ? '#00ff41' : undefined,
                               opacity: theme === 'matrix' ? 0.9 : 0.8,
                               maxWidth: '90ch'
                           }}>
                            {currentTurn.consequences}
                        </p>
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
                        isProcessing={isProcessing}
                    />
                )}
            </div>
        </div>
    );
};
