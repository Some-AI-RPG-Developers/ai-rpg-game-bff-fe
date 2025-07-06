import React, { useState } from 'react';
import {PlayPageScene} from '@/client/types/game.types';
import {TTSWrapper} from '@/client/components/tts';
import {TruncatedText} from '@/client/components/ui/TruncatedText';
import {useTheme} from '@/client/context/ThemeContext';
import {getThemeStyles} from '@/client/utils/themeStyles';
import {MapPin, ChevronDown, ChevronRight, FileText} from 'lucide-react';

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
    
    // State for toggleable sections
    const [isSceneExpanded, setIsSceneExpanded] = useState(false);

    return (
        <div className="flex flex-col items-center mt-8">
            <div className={`rounded-2xl w-11/12 mx-auto text-center ${
                theme === 'light' ? 'magical-scroll' : 
                theme === 'dark' ? 'dark-fantasy-character' :
                theme === 'performance' ? 'performance-character' :
                theme !== 'matrix' ? styles.card : ''
            }`}
                 style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.5)' : undefined,
                     border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.4)' : undefined,
                     backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
                 }}>
                {/* Scene Main Header - Controls entire scene visibility */}
                <div className="flex items-center justify-center gap-2 p-4 cursor-pointer border-b"
                     style={{ borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.3)' : undefined }}
                     onClick={() => setIsSceneExpanded(!isSceneExpanded)}>
                    <MapPin size={24} className={theme !== 'matrix' ? styles.text : ''}
                            style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                    <div className="flex items-center gap-3 flex-1 justify-center">
                        <strong className={`text-xl ${
                            theme === 'light' ? 'spell-title' : 
                            theme !== 'matrix' ? styles.text : ''
                        }`}
                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                            {theme === 'light' ? 
                                `🏰 Chapter ${sceneNumber || currentScene.sceneNumber || 'Unknown'} 🏰` : 
                                `Scene ${sceneNumber || currentScene.sceneNumber || 'Unknown'}: ${currentScene.sceneId}`
                            }
                        </strong>
                    </div>
                    <button
                        className={`transition-all duration-200 hover:opacity-80 p-1`}
                        style={{ 
                          color: theme === 'matrix' ? '#00ff41' : 
                                 theme === 'dark' ? '#cc4444' : 
                                 theme === 'performance' ? '#9ca3af' :
                                 '#374151'
                        }}
                    >
                        {isSceneExpanded ? (
                            <ChevronDown size={24} style={{ 
                              color: theme === 'matrix' ? '#00ff41' : 
                                     theme === 'dark' ? '#cc4444' : 
                                     theme === 'performance' ? '#9ca3af' :
                                     '#374151'
                            }} />
                        ) : (
                            <ChevronRight size={24} style={{ 
                              color: theme === 'matrix' ? '#00ff41' : 
                                     theme === 'dark' ? '#cc4444' : 
                                     theme === 'performance' ? '#9ca3af' :
                                     '#374151'
                            }} />
                        )}
                    </button>
                </div>

                {/* Scene Content - Only show when expanded */}
                {isSceneExpanded && (
                    <div className="p-6">
                        {/* Scene Description */}
                        <div className="mb-6">
                            <div className={`rounded-lg p-4 ${
                                theme === 'light' ? 'magical-scroll' : 
                                theme === 'dark' ? 'dark-fantasy-scene-description' :
                                theme === 'performance' ? 'performance-scene-description' :
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
                                        text={`Scene Description: ${currentScene.description}`}
                                        buttonPosition="inline-end"
                                        title="Read scene description aloud"
                                    >
                                        <h6 className={`text-lg font-bold ${
                                            theme === 'light' ? 'spell-text' : 
                                            theme !== 'matrix' ? styles.text : ''
                                        }`}
                                            style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                            {theme === 'light' ? '📖 Chapter Description' : 'Scene Description'}
                                        </h6>
                                    </TTSWrapper>
                                </div>
                                <TruncatedText
                                    text={currentScene.description}
                                    textId={`scene-description-${currentScene.sceneId || sceneNumber}`}
                                    className={`text-base leading-relaxed text-center ${
                                        theme === 'light' ? 'spell-text' : 
                                        theme === 'dark' ? 'dark-fantasy-text-light' :
                                        theme === 'performance' ? 'performance-text-light' :
                                        theme !== 'matrix' ? styles.text : ''
                                    }`}
                                    style={{
                                        color: theme === 'matrix' ? '#00ff41' : undefined,
                                        opacity: theme === 'matrix' ? 0.9 : 0.8
                                    }}
                                    as="p"
                                />
                            </div>
                        </div>

                        {/* Turns Content */}
                        {children}

                        {/* Scene Conclusion: Show if scene has consequences */}
                        {currentScene.consequences && (
                            <div className="mt-6">
                                <div className={`rounded-lg p-4 ${
                                    theme === 'light' ? 'magical-scroll' : 
                                    theme === 'dark' ? 'dark-fantasy-scene-conclusion' :
                                    theme === 'performance' ? 'performance-scene-conclusion' :
                                    theme !== 'matrix' ? styles.border : ''
                                }`}
                                     style={{
                                         backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                                         border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.5)' : undefined
                                     }}>
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <TTSWrapper
                                            text={`Scene Conclusion: ${currentScene.consequences}`}
                                            buttonPosition="inline-end"
                                            title="Read scene conclusion aloud"
                                        >
                                            <h6 className={`text-lg font-bold ${
                                                theme === 'light' ? 'spell-text' : 
                                                theme !== 'matrix' ? styles.text : ''
                                            }`}
                                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                                {theme === 'light' ? '🎬 Chapter\'s End' : 'Scene Conclusion'}
                                            </h6>
                                        </TTSWrapper>
                                    </div>
                                    <TruncatedText
                                        text={currentScene.consequences}
                                        textId={`scene-consequences-${currentScene.sceneId || sceneNumber}`}
                                        className={`text-base leading-relaxed text-center ${
                                            theme === 'light' ? 'spell-text' : 
                                            theme === 'dark' ? 'dark-fantasy-text-light' :
                                            theme !== 'matrix' ? styles.text : ''
                                        }`}
                                        style={{
                                            color: theme === 'matrix' ? '#00ff41' : undefined,
                                            opacity: theme === 'matrix' ? 0.9 : 0.8
                                        }}
                                        as="p"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};