import React from 'react';
import {PlayPageTurn} from '@/client/types/game.types';
import {CharacterOptions as GameCharacterOption} from '@/server/types/rest/api.alias.types';
import {useTheme} from '@/client/context/ThemeContext';
import {getThemeStyles} from '@/client/utils/themeStyles';
import {User, Edit3} from 'lucide-react';

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
 * Submit button has been moved to a centralized location at the bottom of the page.
 * Extracted from the original monolithic component (lines 820-868).
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
            <div className={`rounded-2xl p-6 max-w-lg text-center`}
                 style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
                     border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.4)' : undefined,
                     backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
                 }}>
                <h4 className={`text-lg font-bold mb-4 ${theme !== 'matrix' ? styles.text : ''}`}
                    style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                    Choose actions for your characters:
                </h4>
                <div className="space-y-4">
                    {currentTurn.options.map((charOption: GameCharacterOption) => (
                        <div key={charOption.name}
                             className={`p-4 rounded-lg`}
                             style={{
                                 backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.4)' : undefined,
                                 border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.4)' : '1px solid #ddd',
                                 backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
                             }}>
                            <div className="flex items-center gap-2 mb-3">
                                <User size={18} className={theme !== 'matrix' ? styles.text : ''}
                                      style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                                <strong className={`text-base ${theme !== 'matrix' ? styles.text : ''}`}
                                        style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                    {charOption.name}:
                                </strong>
                            </div>

                            <div className="space-y-2 mb-4">
                                {charOption.descriptions.map((optionDesc: string, index: number) => (
                                    <label key={index}
                                           className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-all duration-200 ${theme !== 'matrix' ? styles.text : ''}`}
                                           style={{
                                               backgroundColor: selectedOptions[charOption.name] === optionDesc && theme === 'matrix' ?
                                                   'rgba(0, 255, 65, 0.1)' : undefined,
                                               color: theme === 'matrix' ? '#00ff41' : undefined,
                                               opacity: theme === 'matrix' ? 0.9 : 0.8
                                           }}>
                                        <input
                                            type="radio"
                                            name={`option-${charOption.name}`}
                                            value={optionDesc}
                                            checked={selectedOptions[charOption.name] === optionDesc}
                                            onChange={() => onOptionChange(charOption.name, optionDesc)}
                                            disabled={!!freeTextInputs[charOption.name] || isProcessing}
                                            className="mt-1"
                                            style={{
                                                accentColor: theme === 'matrix' ? '#00ff41' : undefined
                                            }}
                                        />
                                        <span className="flex-1">{optionDesc}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <Edit3 size={16} className={theme !== 'matrix' ? styles.text : ''}
                                       style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                                <input
                                    type="text"
                                    placeholder="Or type a custom action..."
                                    value={freeTextInputs[charOption.name] || ''}
                                    onChange={(e) => onFreeTextChange(charOption.name, e.target.value)}
                                    disabled={isProcessing}
                                    className={`flex-1 p-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${theme !== 'matrix' ? `${styles.bg} ${styles.text} ${styles.border}` : ''}`}
                                    style={{
                                        backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
                                        color: theme === 'matrix' ? '#00ff41' : undefined,
                                        border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.5)' : undefined,
                                        focusRingColor: theme === 'matrix' ? '#00ff41' : undefined
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};