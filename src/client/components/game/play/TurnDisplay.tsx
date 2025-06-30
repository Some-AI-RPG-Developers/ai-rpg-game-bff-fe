import React, { useState } from 'react';
import {PlayPageTurn, GameStatus} from '@/client/types/game.types';
import {TTSWrapper} from '@/client/components/tts';
import {CharacterActionForm} from './CharacterActionForm';
import {useTheme} from '@/client/context/ThemeContext';
import {getThemeStyles} from '@/client/utils/themeStyles';
import {Clock, Users, CheckCircle, ChevronDown, ChevronRight, FileText} from 'lucide-react';

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
    
    // State for toggleable sections
    const [isTurnExpanded, setIsTurnExpanded] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isResolutionExpanded, setIsResolutionExpanded] = useState(false);
    const [isChosenOptionsExpanded, setIsChosenOptionsExpanded] = useState(false);

    return (
        <div className="flex flex-col items-center mt-4">
            <div className={`rounded-2xl w-full text-center`}
                 style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
                     border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.4)' : undefined,
                     backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined,
                     borderTop: theme === 'matrix' ? '1px dashed rgba(0, 255, 65, 0.5)' : '1px dashed #ccc'
                 }}>
                {/* Turn Main Header - Controls entire turn visibility */}
                <div className="flex items-center justify-center gap-2 p-3 cursor-pointer border-b"
                     style={{ borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.3)' : undefined }}
                     onClick={() => setIsTurnExpanded(!isTurnExpanded)}>
                    <Clock size={20} className={theme !== 'matrix' ? styles.text : ''}
                           style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                    <div className="flex items-center gap-3 flex-1 justify-center">
                        <strong className={`text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                            Turn {turnNumber || currentTurn.turnNumber || 'Unknown'}: {currentTurn.turnId}
                        </strong>
                    </div>
                    <button
                        className={`transition-all duration-200 hover:opacity-80 p-1 ${theme !== 'matrix' ? styles.text : ''}`}
                        style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
                    >
                        {isTurnExpanded ? (
                            <ChevronDown size={20} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                        ) : (
                            <ChevronRight size={20} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                        )}
                    </button>
                </div>

                {/* Turn Content - Only show when expanded */}
                {isTurnExpanded && (
                    <div className="p-6">
                        {/* Turn Description Section */}
                        {currentTurn.description && (
                            <div className="mb-6">
                                {/* Turn Description Header - Clickable */}
                                <div className="flex items-center justify-center gap-2 mb-3 cursor-pointer"
                                     onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                                    <FileText size={18} className={theme !== 'matrix' ? styles.text : ''}
                                              style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                                    <div className="flex items-center gap-3 flex-1 justify-center">
                                        <TTSWrapper
                                            text={`Turn Description: ${currentTurn.description}`}
                                            buttonPosition="inline-end"
                                            title="Read turn description aloud"
                                        >
                                            <strong className={`text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                                                    style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                                Turn Description:
                                            </strong>
                                        </TTSWrapper>
                                    </div>
                                    <button
                                        className={`transition-all duration-200 hover:opacity-80 p-1 ${theme !== 'matrix' ? styles.text : ''}`}
                                        style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
                                    >
                                        {isDescriptionExpanded ? (
                                            <ChevronDown size={18} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                                        ) : (
                                            <ChevronRight size={18} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Turn Description Content - Expandable */}
                                {isDescriptionExpanded && (
                                    <div className="border-t pt-3"
                                         style={{ borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.2)' : undefined }}>
                                        <p className={`text-base leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                                           style={{
                                               color: theme === 'matrix' ? '#00ff41' : undefined,
                                               opacity: theme === 'matrix' ? 0.9 : 0.8
                                           }}>
                                            {currentTurn.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Chosen Options: Show if actions exist (player choices were made) */}
                        {currentTurn.actions && currentTurn.actions.length > 0 && (
                            <div className={`mb-6 p-4 rounded-lg`}
                                 style={{
                                     backgroundColor: theme === 'matrix' ? 'rgba(255, 165, 0, 0.1)' : '#fff4e6',
                                     border: theme === 'matrix' ? '1px solid rgba(255, 165, 0, 0.5)' : '1px solid #ffcc99'
                                 }}>
                                {/* Chosen Options Header - Clickable */}
                                <div className="flex items-center justify-center gap-2 mb-3 cursor-pointer"
                                     onClick={() => setIsChosenOptionsExpanded(!isChosenOptionsExpanded)}>
                                    <Users size={18} className={theme !== 'matrix' ? styles.text : ''}
                                           style={{color: theme === 'matrix' ? '#ffa500' : undefined}}/>
                                    <div className="flex items-center gap-3 flex-1 justify-center">
                                        <strong className={`text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                                                style={{color: theme === 'matrix' ? '#ffa500' : undefined}}>
                                            Chosen Options:
                                        </strong>
                                    </div>
                                    <button
                                        className={`transition-all duration-200 hover:opacity-80 p-1 ${theme !== 'matrix' ? styles.text : ''}`}
                                        style={{ color: theme === 'matrix' ? '#ffa500' : undefined }}
                                    >
                                        {isChosenOptionsExpanded ? (
                                            <ChevronDown size={18} style={{ color: theme === 'matrix' ? '#ffa500' : undefined }} />
                                        ) : (
                                            <ChevronRight size={18} style={{ color: theme === 'matrix' ? '#ffa500' : undefined }} />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Chosen Options Content - Expandable */}
                                {isChosenOptionsExpanded && (
                                    <div className="border-t pt-3 space-y-3"
                                         style={{ borderColor: theme === 'matrix' ? 'rgba(255, 165, 0, 0.3)' : undefined }}>
                                        {currentTurn.actions.map((action, index) => (
                                            <div key={index} className="flex items-center justify-center gap-3">
                                                <TTSWrapper
                                                    text={`${action.name}: ${action.message}`}
                                                    buttonPosition="inline-end"
                                                    title={`Read ${action.name}'s choice aloud`}
                                                >
                                                    <div className={`text-sm leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                                                         style={{
                                                             color: theme === 'matrix' ? '#ffa500' : undefined,
                                                             opacity: theme === 'matrix' ? 0.9 : 0.8
                                                         }}>
                                                        <strong>{action.name}:</strong> {action.message}
                                                    </div>
                                                </TTSWrapper>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Turn Resolution */}
                        {currentTurn.consequences && (
                            <div className={`mb-6 p-4 rounded-lg`}
                                 style={{
                                     backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.15)' : '#e6ffed',
                                     border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.6)' : '1px solid #b2fab4'
                                 }}>
                                {/* Turn Resolution Header - Clickable */}
                                <div className="flex items-center justify-center gap-2 mb-3 cursor-pointer"
                                     onClick={() => setIsResolutionExpanded(!isResolutionExpanded)}>
                                    <CheckCircle size={18} className={theme !== 'matrix' ? styles.text : ''}
                                                 style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                                    <div className="flex items-center gap-3 flex-1 justify-center">
                                        <TTSWrapper
                                            text={`Turn Resolution: ${currentTurn.consequences}`}
                                            buttonPosition="inline-end"
                                            title="Read turn resolution aloud"
                                        >
                                            <strong className={`text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                                                    style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                                Turn Resolution:
                                            </strong>
                                        </TTSWrapper>
                                    </div>
                                    <button
                                        className={`transition-all duration-200 hover:opacity-80 p-1 ${theme !== 'matrix' ? styles.text : ''}`}
                                        style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
                                    >
                                        {isResolutionExpanded ? (
                                            <ChevronDown size={18} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                                        ) : (
                                            <ChevronRight size={18} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Turn Resolution Content - Expandable */}
                                {isResolutionExpanded && (
                                    <div className="border-t pt-3"
                                         style={{ borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.2)' : undefined }}>
                                        <p className={`text-base leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                                           style={{
                                               color: theme === 'matrix' ? '#00ff41' : undefined,
                                               opacity: theme === 'matrix' ? 0.9 : 0.8
                                           }}>
                                            {currentTurn.consequences}
                                        </p>
                                    </div>
                                )}
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
                )}
            </div>
        </div>
    );
};