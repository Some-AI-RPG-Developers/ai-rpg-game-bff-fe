import React from 'react';
import {PlayPageTurn} from '@/client/types/game.types';
import {CharacterOptions as GameCharacterOption} from '@/server/types/rest/api.alias.types';
import {TruncatedText} from '@/client/components/ui/TruncatedText';
import {useTheme} from '@/client/context/ThemeContext';
import {getThemeStyles} from '@/client/utils/themeStyles';
import {Users, Edit3} from 'lucide-react';

interface CharacterActionFormProps {
    /** Current turn with options */
    currentTurn: PlayPageTurn;
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
 * CharacterActionForm displays the character action selection interface with radio buttons and free text input.
 * Rewritten from scratch to match the styling and structure of other components like SceneDisplay and TurnDisplay.
 */
export const CharacterActionForm: React.FC<CharacterActionFormProps> = ({
                                                                            currentTurn,
                                                                            selectedOptions,
                                                                            freeTextInputs,
                                                                            onOptionChange,
                                                                            onFreeTextChange,
                                                                            isProcessing
                                                                        }) => {
    const {theme} = useTheme();
    const styles = getThemeStyles(theme);

    if (!currentTurn.options) {
        return null;
    }

    return (
        <div className="flex flex-col items-center mt-6">
            <div className={`rounded-3xl p-8 w-full text-center ${
                theme === 'light' ? 'magical-scroll magical-scroll-corners' : 
                theme === 'dark' ? 'dark-fantasy-option-select' :
                theme === 'performance' ? 'performance-option-select' :
                theme !== 'matrix' ? styles.card : ''
            }`}
                 style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
                     border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
                     backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
                 }}>
                <div className={theme === 'light' ? 'magical-scroll-content' : ''}>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Users size={20} className={theme !== 'matrix' ? styles.text : ''}
                               style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                        <strong className={`text-lg ${
                            theme === 'light' ? 'spell-title' : 
                            theme !== 'matrix' ? styles.text : ''
                        }`}
                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                            {theme === 'light' ? '⚔️ Choose Character Actions ⚔️' : 'Choose Character Actions'}
                        </strong>
                    </div>

                <div className="space-y-6">
                    {currentTurn.options.map((charOption: GameCharacterOption) => (
                        <div key={charOption.name}
                             className={`p-4 rounded-lg w-11/12 mx-auto ${
                                theme === 'light' ? 'magical-scroll' : 
                                theme === 'dark' ? 'dark-fantasy-option-select' :
                                theme === 'performance' ? 'performance-option-select' :
                                theme !== 'matrix' ? styles.border : ''
                             }`}
                             style={{
                                 backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                                 border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.4)' : undefined
                             }}>
                            <div className="mb-4">
                                <strong className={`text-base ${
                                    theme === 'light' ? 'spell-text' : 
                                    theme !== 'matrix' ? styles.text : ''
                                }`}
                                        style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                    {theme === 'light' ? `⚔️ ${charOption.name} ⚔️` : charOption.name}
                                </strong>
                            </div>

                            <div className="space-y-3 mb-4">
                                {charOption.descriptions.map((optionDesc: string, index: number) => (
                                    <label key={index}
                                           className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-all duration-200 w-11/12 mx-auto ${
                                               theme === 'light' ? 'spell-writing-area' : 
                                               theme === 'dark' ? 'dark-fantasy-option-select' :
                                               theme === 'performance' ? 'performance-option-select' :
                                               theme !== 'matrix' ? styles.text : ''
                                           }`}
                                           style={{
                                               backgroundColor: selectedOptions[charOption.name] === optionDesc ? 
                                                   (theme === 'matrix' ? 'rgba(0, 255, 65, 0.2)' : 
                                                    theme === 'light' ? 'rgba(212, 175, 55, 0.3)' : undefined) : 
                                                   (theme === 'matrix' ? 'rgba(0, 0, 0, 0.3)' : undefined),
                                               border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
                                               color: theme === 'matrix' ? '#00ff41' : undefined,
                                               opacity: theme === 'matrix' ? 0.9 : 1
                                           }}>
                                        <input
                                            type="radio"
                                            name={`option-${charOption.name}`}
                                            value={optionDesc}
                                            checked={selectedOptions[charOption.name] === optionDesc}
                                            onChange={() => onOptionChange(charOption.name, optionDesc)}
                                            disabled={!!freeTextInputs[charOption.name] || isProcessing}
                                            className="mt-1 flex-shrink-0"
                                            style={{
                                                accentColor: theme === 'matrix' ? '#00ff41' : 
                                                           theme === 'light' ? '#d4af37' : undefined
                                            }}
                                        />
                                        <TruncatedText
                                            text={optionDesc}
                                            textId={`option-${charOption.name}-${index}`}
                                            className={`text-sm leading-relaxed ${
                                                theme === 'light' ? 'spell-text' : 
                                                theme === 'dark' ? 'dark-fantasy-text-light' :
                                                theme === 'performance' ? 'performance-text-light' :
                                                theme !== 'matrix' ? styles.text : ''
                                            }`}
                                            style={{
                                                color: theme === 'matrix' ? '#00ff41' : undefined,
                                                opacity: theme === 'matrix' ? 0.9 : 0.8
                                            }}
                                            as="span"
                                        />
                                    </label>
                                ))}
                            </div>

                            <div className={`p-3 rounded-md w-11/12 mx-auto ${
                                theme === 'light' ? 'magical-scroll' : 
                                theme === 'dark' ? 'dark-fantasy-character' :
                                theme === 'performance' ? 'performance-character' : ''
                            }`}
                                 style={{
                                     backgroundColor: theme === 'matrix' ? 'rgba(255, 165, 0, 0.1)' : undefined,
                                     border: theme === 'matrix' ? '1px solid rgba(255, 165, 0, 0.5)' : undefined
                                 }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Edit3 size={16} className={theme !== 'matrix' ? styles.text : ''}
                                           style={{color: theme === 'matrix' ? '#ffa500' : undefined}}/>
                                    <span className={`text-sm font-medium ${
                                        theme === 'light' ? 'spell-text' : 
                                        theme === 'dark' ? 'dark-fantasy-text-accent' :
                                        theme !== 'matrix' ? styles.text : ''
                                    }`}
                                          style={{color: theme === 'matrix' ? '#ffa500' : undefined}}>
                                        {theme === 'light' ? '✍️ Custom Spell:' : 
                                         theme === 'dark' ? '🗡️ CUSTOM HERO ACTION:' :
                                         'Custom Action:'}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder={theme === 'light' ? 
                                        "Or inscribe thy own mystical action upon this enchanted parchment..." :
                                        theme === 'dark' ?
                                        ">> FORGE CUSTOM HERO ACTION..." :
                                        "Or type a custom action for this character..."
                                    }
                                    value={freeTextInputs[charOption.name] || ''}
                                    onChange={(e) => onFreeTextChange(charOption.name, e.target.value)}
                                    disabled={isProcessing}
                                    className={`w-full p-3 rounded-md text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                                        theme === 'light' ? 'spell-writing-area' :
                                        theme === 'dark' ? 'dark-fantasy-input' :
                                        theme !== 'matrix' ? `${styles.bg} ${styles.text} ${styles.border}` : ''
                                    }`}
                                    style={{
                                        backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
                                        color: theme === 'matrix' ? '#ffa500' : undefined,
                                        border: theme === 'matrix' ? '1px solid rgba(255, 165, 0, 0.5)' : undefined
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
};