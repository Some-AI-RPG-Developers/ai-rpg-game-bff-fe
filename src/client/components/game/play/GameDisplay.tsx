import React, { useState } from 'react';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';
import { SceneDisplay } from './SceneDisplay';
import { TurnDisplay } from './TurnDisplay';
import { CharacterActionForm } from './CharacterActionForm';
import { GameActionButtons } from '../GameActionButtons';
import { TTSWrapper } from '@/client/components/tts';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { ChevronDown, ChevronRight, FileText, CheckCircle } from 'lucide-react';

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
  /** Whether all characters have made their choices */
  allCharactersMadeChoice: boolean;
  /** Handler for submitting the current turn */
  onSubmitTurn: () => Promise<void>;
  /** Handler for starting the game */
  onStartGame: () => Promise<void>;
  /** Handler for starting the next turn */
  onStartNextTurn: () => Promise<void>;
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
  isProcessing,
  allCharactersMadeChoice,
  onSubmitTurn,
  onStartGame,
  onStartNextTurn
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  
  // State for expanded characters
  const [expandedCharacters, setExpandedCharacters] = useState<Record<string, boolean>>({});
  
  // State for expanded text sections
  const [expandedTexts, setExpandedTexts] = useState<Record<string, boolean>>({
    synopsis: false,
    sceneContext: false,
    previousTurnResult: false,
    currentSituation: false
  });
  
  const toggleCharacter = (characterId: string) => {
    setExpandedCharacters(prev => ({
      ...prev,
      [characterId]: !prev[characterId]
    }));
  };

  const toggleText = (textId: string) => {
    setExpandedTexts(prev => ({
      ...prev,
      [textId]: !prev[textId]
    }));
  };

  // Find the current active turn that needs player input
  const getCurrentActiveTurnInfo = () => {
    if (!game.scenes) return null;
    
    for (let sceneIndex = 0; sceneIndex < game.scenes.length; sceneIndex++) {
      const scene = game.scenes[sceneIndex];
      if (scene.turns) {
        for (let turnIndex = 0; turnIndex < scene.turns.length; turnIndex++) {
          const turn = scene.turns[turnIndex];
          // A turn needs input if it has options but no consequences (unresolved)
          // and the game is in a state that allows player input
          if (turn.options && !turn.consequences && !game.conclusion && 
              (gameStatus === 'idle' || gameStatus === 'startingGame_WaitingForFirstTurn' || gameStatus === 'submittingTurn_WaitingForNewTurn')) {
            return {
              turn,
              scene,
              isFirstTurnOfScene: turnIndex === 0,
              previousTurn: turnIndex > 0 ? scene.turns[turnIndex - 1] : null
            };
          }
        }
      }
    }
    return null;
  };

  const activeTurnInfo = getCurrentActiveTurnInfo();

  // Helper component for truncated text
  const TruncatedText = ({ text, textId, className, style }: { 
    text: string; 
    textId: string; 
    className: string; 
    style: React.CSSProperties;
  }) => {
    const isExpanded = expandedTexts[textId];
    const shouldTruncate = text.length > 200; // Approximate length for 3 lines
    
    return (
      <p 
        className={`${className} ${shouldTruncate ? 'cursor-pointer' : ''} transition-all duration-200`}
        style={{
          ...style,
          ...(shouldTruncate && !isExpanded ? {
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          } : {})
        }}
        onClick={() => shouldTruncate && toggleText(textId)}
        title={shouldTruncate ? (isExpanded ? 'Click to collapse' : 'Click to expand') : undefined}
      >
        {text}
      </p>
    );
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <div className={`rounded-3xl p-8 w-2/3 max-w-2xl mb-8 text-center mx-auto ${
        theme === 'light' ? 'magical-scroll magical-scroll-corners' : 
        theme !== 'matrix' ? styles.card : ''
      }`}
           style={{
             backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
             border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined,
             backdropFilter: theme === 'matrix' ? 'blur(8px)' : undefined
           }}>
        <div className={theme === 'light' ? 'magical-scroll-content' : ''}>
          <h4 className={`text-2xl font-bold mb-6 text-center ${
            theme === 'light' ? 'spell-title' : 
            theme !== 'matrix' ? styles.text : ''
          }`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
            {theme === 'light' ? '⚔️ Quest Chronicle ⚔️' : 'Game Details'}
          </h4>
        <p className={`mb-8 text-lg text-center ${theme !== 'matrix' ? styles.text : ''}`}
           style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
          <strong>ID:</strong> {game.gameId}
        </p>
        
        {/* Characters Section */}
        {game.characters && game.characters.length > 0 && (
          <div className="mb-8">
            <div className={`rounded-xl p-6 w-11/12 mx-auto ${
              theme === 'light' ? 'magical-scroll' : 
              theme === 'dark' ? 'dark-fantasy-character' :
              theme !== 'matrix' ? styles.border : ''
            }`}
                 style={{
                   backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.08)' : undefined,
                   border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.3)' : undefined
                 }}>
              <h5 className={`text-xl font-bold mb-4 text-center ${
                theme === 'light' ? 'spell-title' : 
                theme !== 'matrix' ? styles.text : ''
              }`}
                  style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                {theme === 'light' ? '👥 Heroes of the Realm 👥' : 'Characters'}
              </h5>
              <div className="space-y-2">
                {game.characters.map((character, index) => {
                  const characterId = character.characterId || `char-${index}`;
                  const isExpanded = expandedCharacters[characterId];
                  
                  return (
                    <div key={characterId} 
                         className={`rounded-lg w-11/12 mx-auto ${
                           theme === 'dark' ? 'dark-fantasy-character' :
                           theme !== 'matrix' ? styles.border : ''
                         }`}
                         style={{
                           backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : undefined,
                           border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.2)' : undefined
                         }}>
                      {/* Character Name - Clickable Header with TTS */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 justify-center">
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
                          className={`transition-all duration-200 hover:opacity-80 p-1`}
                          style={{ 
                            color: theme === 'matrix' ? '#00ff41' : 
                                   theme === 'dark' ? '#f3f4f6' : 
                                   '#374151'
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown size={20} style={{ 
                              color: theme === 'matrix' ? '#00ff41' : 
                                     theme === 'dark' ? '#f3f4f6' : 
                                     '#374151'
                            }} />
                          ) : (
                            <ChevronRight size={20} style={{ 
                              color: theme === 'matrix' ? '#00ff41' : 
                                     theme === 'dark' ? '#f3f4f6' : 
                                     '#374151'
                            }} />
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
        
        {/* Synopsis Section */}
        {game.synopsis && (
          <div className="mb-8">
            <div className={`rounded-xl p-6 w-11/12 mx-auto ${
              theme === 'dark' ? 'dark-fantasy-synopsis' :
              theme !== 'matrix' ? styles.border : ''
            }`}
                 style={{
                   backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.08)' : undefined,
                   border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.3)' : undefined
                 }}>
              <div className="text-center mb-3">
                <TTSWrapper
                  text={`Synopsis: ${game.synopsis}`}
                  buttonPosition="inline-end"
                  title="Read synopsis aloud"
                >
                  <h5 className={`text-xl font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                      style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                    Synopsis
                  </h5>
                </TTSWrapper>
              </div>
              <TruncatedText
                text={game.synopsis}
                textId="synopsis"
                className={`text-lg leading-relaxed text-center ${
                  theme === 'dark' ? 'dark-fantasy-text-light' :
                  theme !== 'matrix' ? styles.text : ''
                }`}
                style={{ 
                  color: theme === 'matrix' ? '#00ff41' : undefined,
                  opacity: theme === 'matrix' ? 0.9 : 0.8
                }}
              />
            </div>
          </div>
        )}

        {/* Game Scenes Section */}
        {game.scenes && game.scenes.length > 0 && (
          <div className="mb-8">
            <div className={`rounded-xl p-6 w-11/12 mx-auto ${theme !== 'matrix' ? styles.border : ''}`}
                 style={{
                   backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.08)' : undefined,
                   border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.3)' : undefined
                 }}>
              <h5 className={`text-xl font-bold mb-4 text-center ${theme !== 'matrix' ? styles.text : ''}`}
                  style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                Game Scenes
              </h5>
              <div className="space-y-6">
                {game.scenes.map((scene, sceneIndex) => (
                  <SceneDisplay
                    key={scene.sceneId || sceneIndex}
                    currentScene={scene}
                    sceneNumber={sceneIndex + 1}
                  >
                    {scene.turns && scene.turns.length > 0 && (
                      <div className="mt-6">
                        <div className={`rounded-lg p-4 ${theme !== 'matrix' ? styles.border : ''}`}
                             style={{
                               backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : undefined,
                               border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.2)' : undefined
                             }}>
                          <h6 className={`text-lg font-bold mb-4 text-center ${theme !== 'matrix' ? styles.text : ''}`}
                              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                            Scene Turns
                          </h6>
                          <div className="space-y-4">
                            {scene.turns.map((turn, turnIndex) => (
                              <TurnDisplay
                                key={turn.turnId || turnIndex}
                                currentTurn={turn}
                                turnNumber={turnIndex + 1}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </SceneDisplay>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Current Context Section - Show contextual information for active turn */}
        {activeTurnInfo && (
          <div className="mb-8">
            <div className={`rounded-xl p-6 w-11/12 mx-auto ${theme !== 'matrix' ? styles.border : ''}`}
                 style={{
                   backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.08)' : undefined,
                   border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.3)' : undefined
                 }}>
              <h5 className={`text-xl font-bold mb-4 text-center ${theme !== 'matrix' ? styles.text : ''}`}
                  style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                Current Context
              </h5>
              
              <div className="space-y-4">
                {/* Show Scene Description if this is the first turn of the scene */}
                {activeTurnInfo.isFirstTurnOfScene && activeTurnInfo.scene.description && (
                  <div className={`rounded-lg p-4 w-11/12 mx-auto ${theme !== 'matrix' ? styles.border : ''}`}
                       style={{
                         backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : undefined,
                         border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.2)' : undefined
                       }}>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <FileText size={18} className={theme !== 'matrix' ? styles.text : ''}
                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                      <TTSWrapper
                        text={`Scene Context: ${activeTurnInfo.scene.description}`}
                        buttonPosition="inline-end"
                        title="Read scene context aloud"
                      >
                        <h6 className={`text-lg font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                            style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                          Scene Context
                        </h6>
                      </TTSWrapper>
                    </div>
                    <TruncatedText
                      text={activeTurnInfo.scene.description}
                      textId="sceneContext"
                      className={`text-base leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                      style={{
                        color: theme === 'matrix' ? '#00ff41' : undefined,
                        opacity: theme === 'matrix' ? 0.9 : 0.8
                      }}
                    />
                  </div>
                )}

                {/* Show Previous Turn Resolution if NOT the first turn */}
                {!activeTurnInfo.isFirstTurnOfScene && activeTurnInfo.previousTurn?.consequences && (
                  <div className={`rounded-lg p-4 w-11/12 mx-auto ${theme !== 'matrix' ? styles.border : ''}`}
                       style={{
                         backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : '#ffeaa7',
                         border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.5)' : '1px solid #fdcb6e'
                       }}>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <CheckCircle size={18} className={theme !== 'matrix' ? styles.text : ''}
                                   style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                      <TTSWrapper
                        text={`Previous Turn Resolution: ${activeTurnInfo.previousTurn.consequences}`}
                        buttonPosition="inline-end"
                        title="Read previous turn resolution aloud"
                      >
                        <h6 className={`text-lg font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                            style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                          Previous Turn Resolution
                        </h6>
                      </TTSWrapper>
                    </div>
                    <TruncatedText
                      text={activeTurnInfo.previousTurn.consequences}
                      textId="previousTurnResult"
                      className={`text-base leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                      style={{
                        color: theme === 'matrix' ? '#00ff41' : undefined,
                        opacity: theme === 'matrix' ? 0.9 : 0.8
                      }}
                    />
                  </div>
                )}

                {/* Always show current turn description if it exists */}
                {activeTurnInfo.turn.description && (
                  <div className={`rounded-lg p-4 w-11/12 mx-auto ${theme !== 'matrix' ? styles.border : ''}`}
                       style={{
                         backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : undefined,
                         border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.2)' : undefined
                       }}>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <FileText size={18} className={theme !== 'matrix' ? styles.text : ''}
                                style={{color: theme === 'matrix' ? '#00ff41' : undefined}}/>
                      <TTSWrapper
                        text={`Current Situation: ${activeTurnInfo.turn.description}`}
                        buttonPosition="inline-end"
                        title="Read current situation aloud"
                      >
                        <h6 className={`text-lg font-bold ${theme !== 'matrix' ? styles.text : ''}`}
                            style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                          Current Situation
                        </h6>
                      </TTSWrapper>
                    </div>
                    <TruncatedText
                      text={activeTurnInfo.turn.description}
                      textId="currentSituation"
                      className={`text-base leading-relaxed text-center ${theme !== 'matrix' ? styles.text : ''}`}
                      style={{
                        color: theme === 'matrix' ? '#00ff41' : undefined,
                        opacity: theme === 'matrix' ? 0.9 : 0.8
                      }}
                    />
                  </div>
                )}

                {/* Character Actions: Show if this turn has options and no consequences (needs input) */}
                {activeTurnInfo.turn.options && !activeTurnInfo.turn.consequences && !game.conclusion && (
                  <div className="w-11/12 mx-auto">
                    <CharacterActionForm
                      currentTurn={activeTurnInfo.turn}
                      selectedOptions={selectedOptions}
                      freeTextInputs={freeTextInputs}
                      onOptionChange={onOptionChange}
                      onFreeTextChange={onFreeTextChange}
                      isProcessing={isProcessing}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Game Conclusion Section */}
        {game.conclusion && (
          <div className="mb-8">
            <div className={`rounded-xl p-6 w-11/12 mx-auto ${
              theme === 'light' ? 'magical-scroll' : 
              theme === 'dark' ? 'dark-fantasy-game-conclusion' :
              theme !== 'matrix' ? styles.border : ''
            }`}
                 style={{
                   backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.08)' : undefined,
                   border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.3)' : undefined
                 }}>
              <div className={`rounded-lg p-4 ${
                theme === 'light' ? 'magical-scroll' : 
                theme !== 'matrix' ? styles.border : ''
              }`}
                   style={{
                     backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : 
                                     theme === 'light' ? undefined : '#e6f7ff',
                     border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.5)' : 
                            theme === 'light' ? undefined : '1px solid #b3e0ff'
                   }}>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="text-3xl">🏆</span>
                  <h5 className={`text-xl font-bold text-center ${
                    theme === 'light' ? 'spell-title' : 
                    theme !== 'matrix' ? styles.text : ''
                  }`}
                      style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}>
                    {theme === 'light' ? '🎭 Quest Complete! 🎭' : 'Game Over!'}
                  </h5>
                  <span className="text-3xl">🏆</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <TTSWrapper
                    text={`Game Over! Game Conclusion: ${game.conclusion}`}
                    buttonPosition="inline-end"
                    title="Read game conclusion aloud"
                  >
                    <h6 className={`text-lg font-bold ${
                      theme === 'light' ? 'spell-text' : 
                      theme !== 'matrix' ? styles.text : ''
                    }`}
                        style={{color: theme === 'matrix' ? '#00ff41' : undefined}}>
                      {theme === 'light' ? '📜 Tale\'s End' : 'Game Conclusion'}
                    </h6>
                  </TTSWrapper>
                </div>
                <p className={`text-base leading-relaxed text-center ${
                  theme === 'light' ? 'spell-text' : 
                  theme === 'dark' ? 'dark-fantasy-text-light' :
                  theme !== 'matrix' ? styles.text : ''
                }`}
                   style={{
                     color: theme === 'matrix' ? '#00ff41' : undefined,
                     opacity: theme === 'matrix' ? 0.9 : 0.8
                   }}>
                  {game.conclusion}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Game Action Buttons - Always at the bottom */}
        <div className="mt-8">
          <GameActionButtons
            game={game}
            gameStatus={gameStatus}
            allCharactersMadeChoice={allCharactersMadeChoice}
            isProcessing={isProcessing}
            onSubmitTurn={onSubmitTurn}
            onStartGame={onStartGame}
            onStartNextTurn={onStartNextTurn}
          />
        </div>
        </div>
      </div>
    </div>
  );
}; 