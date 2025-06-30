import React, { useState } from 'react';
import {PlayPageScene} from '@/client/types/game.types';
import {TTSWrapper} from '@/client/components/tts';
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
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isResolutionExpanded, setIsResolutionExpanded] = useState(false);

    return (
        <div className="flex flex-col items-center mt-8">
            <div className={`rounded-2xl w-full text-center`}
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
                        <strong className={`text-xl ${theme !== 'matrix' ? styles.text : ''}`}
                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                            Scene {sceneNumber || currentScene.sceneNumber || 'Unknown'}: {currentScene.sceneId}
                        </strong>
                    </div>
                    <button
                        className={`transition-all duration-200 hover:opacity-80 p-1 ${theme !== 'matrix' ? styles.text : ''}`}
                        style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
                    >
                        {isSceneExpanded ? (
                            <ChevronDown size={24} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                        ) : (
                            <ChevronRight size={24} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                        )}
                    </button>
                </div>

                {/* Scene Content - Only show when expanded */}
                {isSceneExpanded && (
                    <div className="p-6">
                        {/* Scene Description Section */}
                        <div className="mb-6">
                            {/* Scene Description Header - Clickable */}
                            <div className="flex items-center justify-center gap-2 mb-3 cursor-pointer" 
                                 onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                                <FileText size={18} className={theme !== 'matrix' ? styles.text : ''}
                                          style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                                <div className="flex items-center gap-3 flex-1 justify-center">
                                    <TTSWrapper
                                        text={`Scene Description: ${currentScene.description}`}
                                        buttonPosition="inline-end"
                                        title="Read scene description aloud"
                                    >
                                        <strong className={`text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                                            Scene Description:
                                        </strong>
                                    </TTSWrapper>
                                </div>
                                <button
                                    className={`transition-all duration-200 hover:opacity-80 p-1 ${theme !== 'matrix' ? styles.text : ''}`}
                                    style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
                                >
                                    {isDescriptionExpanded ? (
                                        <ChevronDown size={20} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                                    ) : (
                                        <ChevronRight size={20} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                                    )}
                                </button>
                            </div>
                            
                            {/* Scene Description Content - Expandable */}
                            {isDescriptionExpanded && (
                                <div className="border-t pt-3"
                                     style={{ borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.2)' : undefined }}>
                                    <p className={`text-base leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                                       style={{
                                           color: theme === 'matrix' ? '#00ff41' : undefined,
                                           opacity: theme === 'matrix' ? 0.9 : 0.8
                                       }}>
                                        {currentScene.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Turns Content */}
                        {children}

                        {/* Scene Conclusion: Show if scene has consequences */}
                        {currentScene.consequences && (
                            <div className={`mt-6 pt-4 rounded-lg p-4`}
                                 style={{
                                     backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : '#e6f7ff',
                                     border: theme === 'matrix' ? '1px dashed rgba(0, 255, 65, 0.5)' : '1px solid #b3e0ff',
                                     borderTop: theme === 'matrix' ? '2px dashed rgba(0, 255, 65, 0.7)' : '1px dashed #ccc'
                                 }}>
                                {/* Scene Resolution Header - Clickable */}
                                <div className="flex items-center justify-center gap-2 mb-3 cursor-pointer"
                                     onClick={() => setIsResolutionExpanded(!isResolutionExpanded)}>
                                    <div className="flex items-center gap-3 flex-1 justify-center">
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
                                    <button
                                        className={`transition-all duration-200 hover:opacity-80 p-1 ${theme !== 'matrix' ? styles.text : ''}`}
                                        style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
                                    >
                                        {isResolutionExpanded ? (
                                            <ChevronDown size={20} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                                        ) : (
                                            <ChevronRight size={20} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Scene Resolution Content - Expandable */}
                                {isResolutionExpanded && (
                                    <div className="border-t pt-3"
                                         style={{ borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.2)' : undefined }}>
                                        <p className={`text-base leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                                           style={{
                                               color: theme === 'matrix' ? '#00ff41' : undefined,
                                               opacity: theme === 'matrix' ? 0.9 : 0.8
                                           }}>
                                            {currentScene.consequences}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};