import React from 'react';
import { PlayPageScene } from '@/client/types/game.types';
import { TTSWrapper } from '@/client/components/tts';

interface SceneDisplayProps {
  /** Current scene object */
  currentScene: PlayPageScene;
  /** Children components (typically TurnDisplay) */
  children?: React.ReactNode;
}

/**
 * SceneDisplay shows the current scene information including description and consequences.
 * Extracted from the original monolithic component scene display logic.
 */
export const SceneDisplay: React.FC<SceneDisplayProps> = ({
  currentScene,
  children
}) => {
  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <div>
        <TTSWrapper
          text={`Scene: ${currentScene.sceneId}, Scene ${currentScene.sceneNumber}. ${currentScene.description}`}
          buttonPosition="inline-end"
          title="Read scene description aloud"
        >
          <strong>Scene: {currentScene.sceneId} (Scene {currentScene.sceneNumber})</strong>
        </TTSWrapper>
        <p style={{ margin: '5px 0 10px 0', maxWidth: '90ch' }}>{currentScene.description}</p>
      </div>

      {children}

      {/* Scene Conclusion: Show if scene has consequences */}
      {currentScene.consequences && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #b3e0ff', borderRadius: '3px' }}>
          <TTSWrapper
            text={`Scene Conclusion: ${currentScene.consequences}`}
            buttonPosition="inline-end"
            title="Read scene conclusion aloud"
          >
            <strong>Scene Conclusion:</strong>
          </TTSWrapper>
          <p style={{ margin: '5px 0 0 0', maxWidth: '90ch' }}>{currentScene.consequences}</p>
        </div>
      )}
    </div>
  );
};