import React, { useState } from 'react';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';
import { SceneDisplay } from './SceneDisplay';
import { TurnDisplay } from './TurnDisplay';
import { TTSWrapper } from '@/client/components/tts';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface GameDisplayProps {
  /** Current game object */
  game: PlayPageGame;
  /** Current game status */
  gameStatus: GameStatus;
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
 * GameDisplay shows the main game area including game details and current scene/turn.
 * Buttons have been moved to a centralized location at the bottom of the page.
 * Extracted from the original monolithic component (lines 770-890).
 */
export const GameDisplay: React.FC<GameDisplayProps> = ({
  game,
  gameStatus,
  selectedOptions,
  freeTextInputs,
  onOptionChange,
  onFreeTextChange,
  isProcessing
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  
  // State for expanded characters
  const [expandedCharacters, setExpandedCharacters] = useState<Record<string, boolean>>({});
  
  const toggleCharacter = (characterId: string) => {
    setExpandedCharacters(prev => ({
      ...prev,
      [characterId]: !prev[characterId]
    }));
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <div className={`rounded-3xl p-8 w-2/3 max-w-2xl mb-8 text-center mx-auto`}
           style={{
             backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <h4 className={`text-2xl font-bold mb-6 text-center ${theme !== 'matrix' ? styles.text : ''}`}
            style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
          Game Details
        </h4>
        <p className={`mb-4 text-lg text-center ${theme !== 'matrix' ? styles.text : ''}`}
           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
          <strong>ID:</strong> {game.gameId}
        </p>
        
        {/* Characters Section */}
        {game.characters && game.characters.length > 0 && (
          <div className="mt-6">
            <div className={`rounded-xl p-6 ${theme !== 'matrix' ? styles.border : ''}`}
                 style={{
                   backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.08)' : undefined,
                   border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.3)' : undefined
                 }}>
              <h5 className={`text-xl font-bold mb-4 text-center ${theme !== 'matrix' ? styles.text : ''}`}
                  style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                Characters
              </h5>
              <div className="space-y-2">
                {game.characters.map((character, index) => {
                  const characterId = character.characterId || `char-${index}`;
                  const isExpanded = expandedCharacters[characterId];
                  
                  return (
                    <div key={characterId} 
                         className={`rounded-lg ${theme !== 'matrix' ? styles.border : ''}`}
                         style={{
                           backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : undefined,
                           border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.2)' : undefined
                         }}>
                      {/* Character Name - Clickable Header with TTS */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <TTSWrapper
                            text={`${character.name}: ${character.description}`}
                            buttonPosition="inline-end"
                            title={`Read ${character.name}'s description aloud`}
                          >
                            <span className={`font-bold text-lg ${theme !== 'matrix' ? styles.text : ''}`}
                                  style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                              {character.name}
                            </span>
                          </TTSWrapper>
                        </div>
                        <button
                          onClick={() => toggleCharacter(characterId)}
                          className={`transition-all duration-200 hover:opacity-80 p-1 ${theme !== 'matrix' ? styles.text : ''}`}
                          style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
                        >
                          {isExpanded ? (
                            <ChevronDown size={20} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                          ) : (
                            <ChevronRight size={20} style={{ color: theme === 'matrix' ? '#00ff41' : undefined }} />
                          )}
                        </button>
                      </div>
                      
                      {/* Character Description - Expandable Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t"
                             style={{ borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.2)' : undefined }}>
                          <div className="mt-3">
                            <p className={`text-sm leading-relaxed ${theme !== 'matrix' ? styles.text : ''}`}
                               style={{ 
                                 color: theme === 'matrix' ? '#00ff41' : undefined,
                                 opacity: theme === 'matrix' ? 0.9 : 0.8
                               }}>
                              {character.description}
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
        
        {game.synopsis && (
          <div className="mt-6 text-center">
            <div className="text-center mb-3">
              <TTSWrapper
                text={`Synopsis: ${game.synopsis}`}
                buttonPosition="inline-end"
                title="Read synopsis aloud"
              >
                <strong className={theme !== 'matrix' ? styles.text : ''}
                        style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                  Synopsis:
                </strong>
              </TTSWrapper>
            </div>
            <p className={`mt-3 text-lg leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
               style={{ 
                 color: theme === 'matrix' ? '#00ff41' : undefined,
                 opacity: theme === 'matrix' ? 0.9 : 0.8
               }}>
              {game.synopsis}
            </p>
          </div>
        )}
      </div>

      {/* All Scenes and Turns Display */}
      {game.scenes && game.scenes.length > 0 && (
        <div className="w-2/3 max-w-2xl mx-auto space-y-6">
          {game.scenes.map((scene, sceneIndex) => (
            <SceneDisplay
              key={scene.sceneId || sceneIndex}
              currentScene={scene}
              sceneNumber={sceneIndex + 1}
            >
              {scene.turns && scene.turns.length > 0 && (
                <div className="space-y-4">
                  {scene.turns.map((turn, turnIndex) => (
                    <TurnDisplay
                      key={turn.turnId || turnIndex}
                      currentTurn={turn}
                      gameStatus={gameStatus}
                      isGameConcluded={!!game.conclusion}
                      turnNumber={turnIndex + 1}
                      selectedOptions={selectedOptions}
                      freeTextInputs={freeTextInputs}
                      onOptionChange={onOptionChange}
                      onFreeTextChange={onFreeTextChange}
                      isProcessing={isProcessing}
                    />
                  ))}
                </div>
              )}
            </SceneDisplay>
          ))}
        </div>
      )}
    </div>
  );
}; 