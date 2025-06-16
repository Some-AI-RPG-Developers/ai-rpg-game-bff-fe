import React from 'react';
import { PlayPageGame, PlayPageScene } from '@/client/types/game.types';
import { TTSWrapper } from '@/client/components/tts';

interface SceneDisplayProps {
  /** Current scene object */
  currentScene: PlayPageScene;
  /** Current game object */
  game: PlayPageGame;
  /** Children components (typically TurnDisplay) */
  children?: React.ReactNode;
}

/**
 * SceneDisplay shows the current scene information including description and consequences.
 * Extracted from the original monolithic component scene display logic.
 */
export const SceneDisplay: React.FC<SceneDisplayProps> = ({
  currentScene,
  game,
  children
}) => {
  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <TTSWrapper
        text={`Current Scene: ${currentScene.sceneId}, Scene ${currentScene.sceneNumber}. ${currentScene.description}`}
        buttonPosition="inline-end"
        title="Read scene description aloud"
      >
        <h4>Current Scene: {currentScene.sceneId} (Scene {currentScene.sceneNumber})</h4>
      </TTSWrapper>
      <p style={{ margin: '0 0 10px 0', maxWidth: '90ch' }}>{currentScene.description}</p>

      {children}

      {/* Scene Conclusion: Show if scene has consequences and we're not showing turn options */}
      {currentScene.consequences && !game.conclusion && (
        <TTSWrapper
          text={`Scene Conclusion: ${currentScene.consequences}`}
          buttonPosition="top-right"
          title="Read scene conclusion aloud"
        >
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #b3e0ff', borderRadius: '3px' }}>
            <strong>Scene Conclusion:</strong> {currentScene.consequences}
          </div>
        </TTSWrapper>
      )}
    </div>
  );
};