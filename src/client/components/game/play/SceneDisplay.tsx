import React from 'react';
import { PlayPageGame, PlayPageScene } from '@/client/types/game.types';

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
      <h4>Current Scene: {currentScene.sceneId} (Scene {currentScene.sceneNumber})</h4>
      <p style={{ margin: '0 0 10px 0', maxWidth: '90ch' }}>{currentScene.description}</p>

      {children}

      {/* Scene Conclusion: Show if scene has consequences and we're not showing turn options */}
      {currentScene.consequences && !game.conclusion && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #b3e0ff', borderRadius: '3px' }}>
          <strong>Scene Conclusion:</strong> {currentScene.consequences}
        </div>
      )}
    </div>
  );
};