import React from 'react';
import {PlayPageScene} from '@/client/types/game.types';
import {TTSWrapper} from '@/client/components/tts';
import {useTheme} from '@/client/context/ThemeContext';
import {getThemeStyles} from '@/client/utils/themeStyles';
import {MapPin} from 'lucide-react';

interface SceneDisplayProps {
    /** Current scene object */
    currentScene: PlayPageScene;
    /** Scene number (1-based) */
    sceneNumber?: number;
    /** Children components (typically TurnDisplay) */
    children?: React.ReactNode;
}

/**
 * SceneDisplay shows the current scene information including description and consequences.
 * Extracted from the original monolithic component scene display logic.
 */
export const SceneDisplay: React.FC<SceneDisplayProps> = ({
                                                              currentScene,
                                                              sceneNumber,
                                                              children
                                                          }) => {
    const {theme} = useTheme();
    const styles = getThemeStyles(theme);

    return (
        <div className="flex flex-col items-center mt-8">
            <div className={`rounded-2xl p-6 mb-6 w-full text-center`}
                 style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.5)' : undefined,
                     border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.4)' : undefined,
                     backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
                 }}>
                <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <MapPin size={20} className={theme !== 'matrix' ? styles.text : ''}
                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                        <TTSWrapper
                            text={`Scene: ${currentScene.sceneId}, Scene ${sceneNumber || currentScene.sceneNumber || 'Unknown'}. ${currentScene.description}`}
                            buttonPosition="inline-end"
                            title="Read scene description aloud"
                        >
                            <strong className={`text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                                    style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                Scene: {currentScene.sceneId} (Scene {sceneNumber || currentScene.sceneNumber || 'Unknown'})
                            </strong>
                        </TTSWrapper>
                    </div>
                    <p className={`text-base leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                       style={{
                           color: theme === 'matrix' ? '#00ff41' : undefined,
                           opacity: theme === 'matrix' ? 0.9 : 0.8
                       }}>
                        {currentScene.description}
                    </p>
                </div>

                {children}

                {/* Scene Conclusion: Show if scene has consequences */}
                {currentScene.consequences && (
                    <div className={`mt-6 pt-4 rounded-lg p-4`}
                         style={{
                             backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : '#e6f7ff',
                             border: theme === 'matrix' ? '1px dashed rgba(0, 255, 65, 0.5)' : '1px solid #b3e0ff',
                             borderTop: theme === 'matrix' ? '2px dashed rgba(0, 255, 65, 0.7)' : '1px dashed #ccc'
                         }}>
                        <div className="text-center mb-3">
                            <TTSWrapper
                                text={`Scene Conclusion: ${currentScene.consequences}`}
                                buttonPosition="inline-end"
                                title="Read scene conclusion aloud"
                            >
                                <strong className={`text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                                        style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                    Scene Conclusion:
                                </strong>
                            </TTSWrapper>
                        </div>
                        <p className={`mt-3 text-base leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                           style={{
                               color: theme === 'matrix' ? '#00ff41' : undefined,
                               opacity: theme === 'matrix' ? 0.9 : 0.8
                           }}>
                            {currentScene.consequences}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};