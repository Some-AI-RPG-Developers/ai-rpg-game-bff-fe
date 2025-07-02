import React, { useState } from 'react';
import {PlayPageTurn} from '@/client/types/game.types';
import {TTSWrapper} from '@/client/components/tts';
import {useTheme} from '@/client/context/ThemeContext';
import {getThemeStyles} from '@/client/utils/themeStyles';
import {Clock, Users, CheckCircle, ChevronDown, ChevronRight, FileText} from 'lucide-react';

interface TurnDisplayProps {
    /** Current turn object */
    currentTurn: PlayPageTurn;
    /** Turn number (1-based) */
    turnNumber?: number;
}

/**
 * TurnDisplay shows the current turn information including description and consequences.
 * Extracted from the original monolithic component turn display logic.
 */
export const TurnDisplay: React.FC<TurnDisplayProps> = ({
                                                            currentTurn,
                                                            turnNumber
                                                        }) => {
    const {theme} = useTheme();
    const styles = getThemeStyles(theme);
    
    // State for toggleable sections
    const [isTurnExpanded, setIsTurnExpanded] = useState(false);
    const [expandedCharacters, setExpandedCharacters] = useState<Record<string, boolean>>({});
    
    const toggleCharacter = (characterId: string) => {
        setExpandedCharacters(prev => ({
            ...prev,
            [characterId]: !prev[characterId]
        }));
    };

    return (
        <div className="flex flex-col items-center mt-4">
            <div className={`rounded-2xl w-11/12 mx-auto text-center ${
                theme === 'light' ? 'magical-scroll' : 
                theme !== 'matrix' ? styles.card : ''
            }`}
                 style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
                     border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.4)' : undefined,
                     backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined,
                     borderTop: theme === 'matrix' ? '1px dashed rgba(0, 255, 65, 0.5)' : 
                               theme === 'light' ? undefined : '1px dashed #ccc'
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
                        className={`transition-all duration-200 hover:opacity-80 p-1`}
                        style={{ 
                          color: theme === 'matrix' ? '#00ff41' : 
                                 theme === 'dark' ? '#cc4444' : 
                                 '#374151'
                        }}
                    >
                        {isTurnExpanded ? (
                            <ChevronDown size={20} style={{ 
                              color: theme === 'matrix' ? '#00ff41' : 
                                     theme === 'dark' ? '#cc4444' : 
                                     '#374151'
                            }} />
                        ) : (
                            <ChevronRight size={20} style={{ 
                              color: theme === 'matrix' ? '#00ff41' : 
                                     theme === 'dark' ? '#cc4444' : 
                                     '#374151'
                            }} />
                        )}
                    </button>
                </div>

                {/* Turn Content - Only show when expanded */}
                {isTurnExpanded && (
                    <div className="p-6">
                        {/* Turn Description */}
                        {currentTurn.description && (
                            <div className="mb-6">
                                <div className={`rounded-lg p-4 ${
                                  theme === 'dark' ? 'dark-fantasy-turn-description' :
                                  theme !== 'matrix' ? styles.border : ''
                                }`}
                                     style={{
                                         backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : undefined,
                                         border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.2)' : undefined
                                     }}>
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <FileText size={18} className={theme !== 'matrix' ? styles.text : ''}
                                                  style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                                        <TTSWrapper
                                            text={`Turn Description: ${currentTurn.description}`}
                                            buttonPosition="inline-end"
                                            title="Read turn description aloud"
                                        >
                                            <h6 className={`text-lg font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                                Turn Description
                                            </h6>
                                        </TTSWrapper>
                                    </div>
                                    <p className={`text-base leading-relaxed text-center ${
                                      theme === 'dark' ? 'dark-fantasy-text-light' :
                                      theme !== 'matrix' ? styles.text : ''
                                    }`}
                                       style={{
                                           color: theme === 'matrix' ? '#00ff41' : undefined,
                                           opacity: theme === 'matrix' ? 0.9 : 0.8
                                       }}>
                                        {currentTurn.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Chosen Options: Show if actions exist (player choices were made) */}
                        {currentTurn.actions && currentTurn.actions.length > 0 && (
                            <div className="mb-8">
                                <div className={`rounded-lg p-4 ${
                                  theme === 'dark' ? 'dark-fantasy-option-select' :
                                  theme !== 'matrix' ? styles.border : ''
                                }`}
                                     style={{
                                         backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : (theme === 'dark' ? undefined : '#fff4e6'),
                                         border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.5)' : (theme === 'dark' ? undefined : '1px solid #ffcc99')
                                     }}>
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <Users size={18} className={theme !== 'matrix' ? styles.text : ''}
                                               style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                                        <h6 className={`text-lg font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                                            style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                            Chosen Options
                                        </h6>
                                    </div>
                                    <div className="space-y-2">
                                        {currentTurn.actions.map((action, index) => {
                                            const characterId = action.characterId || `action-${index}`;
                                            const isExpanded = expandedCharacters[characterId];
                                            
                                            return (
                                                <div key={characterId} 
                                                     className={`rounded-lg w-11/12 mx-auto ${
                                                       theme === 'dark' ? 'dark-fantasy-character' :
                                                       theme !== 'matrix' ? styles.border : ''
                                                     }`}
                                                     style={{
                                                         backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : (theme === 'dark' ? undefined : '#fefcf5'),
                                                         border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.2)' : (theme === 'dark' ? undefined : '1px solid #fed7aa')
                                                     }}>
                                                    {/* Character Name - Clickable Header with TTS */}
                                                    <div className="p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3 flex-1 justify-center">
                                                            <TTSWrapper
                                                                text={`${action.name}: ${action.message}`}
                                                                buttonPosition="inline-end"
                                                                title={`Read ${action.name}'s choice aloud`}
                                                            >
                                                                <span className={`font-bold text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                                                                      style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                                                                    {action.name}
                                                                </span>
                                                            </TTSWrapper>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleCharacter(characterId)}
                                                            className={`transition-all duration-200 hover:opacity-80 p-1`}
                                                            style={{ 
                                                              color: theme === 'matrix' ? '#00ff41' : 
                                                                     theme === 'dark' ? '#cc4444' : 
                                                                     '#374151'
                                                            }}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown size={20} style={{ 
                                                                  color: theme === 'matrix' ? '#00ff41' : 
                                                                         theme === 'dark' ? '#cc4444' : 
                                                                         '#374151'
                                                                }} />
                                                            ) : (
                                                                <ChevronRight size={20} style={{ 
                                                                  color: theme === 'matrix' ? '#00ff41' : 
                                                                         theme === 'dark' ? '#cc4444' : 
                                                                         '#374151'
                                                                }} />
                                                            )}
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Character Choice - Expandable Content */}
                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 border-t"
                                                             style={{ borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.2)' : undefined }}>
                                                            <div className="mt-3">
                                                                <p className={`text-sm leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                                                                   style={{ 
                                                                     color: theme === 'matrix' ? '#00ff41' : undefined,
                                                                     opacity: theme === 'matrix' ? 0.9 : 0.8
                                                                   }}>
                                                                    {action.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Turn Resolution */}
                        {currentTurn.consequences && (
                            <div className="mb-6">
                                <div className={`rounded-lg p-4 ${
                                  theme === 'dark' ? 'dark-fantasy-turn-conclusion' :
                                  theme !== 'matrix' ? styles.border : ''
                                }`}
                                     style={{
                                         backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.15)' : 
                                                         theme === 'dark' ? undefined : '#e6ffed',
                                         border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.6)' : 
                                                theme === 'dark' ? undefined : '1px solid #b2fab4'
                                     }}>
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <CheckCircle size={18} className={theme !== 'matrix' ? styles.text : ''}
                                                     style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                                        <TTSWrapper
                                            text={`Turn Resolution: ${currentTurn.consequences}`}
                                            buttonPosition="inline-end"
                                            title="Read turn resolution aloud"
                                        >
                                            <h6 className={`text-lg font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                                Turn Resolution
                                            </h6>
                                        </TTSWrapper>
                                    </div>
                                    <p className={`text-base leading-relaxed text-center ${
                                      theme === 'dark' ? 'dark-fantasy-text-light' :
                                      theme !== 'matrix' ? styles.text : ''
                                    }`}
                                       style={{
                                           color: theme === 'matrix' ? '#00ff41' : undefined,
                                           opacity: theme === 'matrix' ? 0.9 : 0.8
                                       }}>
                                        {currentTurn.consequences}
                                    </p>
                                </div>
                            </div>
                        )}


                    </div>
                )}
            </div>
        </div>
    );
};