'use client';

import { useEffect, useState } from 'react';
import {
  Game,
  NewGame,
  NewTurn,
  ChosenCharacterAction,
  Scene, // Added import
  Turn,  // Added import
  CharacterOptions as GameCharacterOption
} from '@/types/rest/api.alias.types';
import { JsonViewer } from '@textea/json-viewer';

// Locally augmented types for internal state management
interface PlayPageTurn extends Turn {
  turnNumber?: number;
}
interface PlayPageScene extends Scene {
  sceneNumber?: number;
  turns: PlayPageTurn[]; // Ensure turns within PlayPageScene are also PlayPageTurn
}
interface PlayPageGame extends Game {
  scenes: PlayPageScene[]; // Ensure scenes within PlayPageGame are also PlayPageScene
}

export default function PlayPage() {
  const [game, setGame] = useState<PlayPageGame | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState<boolean>(false); // Replaced by gameStatus
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [freeTextInputs, setFreeTextInputs] = useState<Record<string, string>>({});
  // const [isWaitingForFirstEvent, setIsWaitingForFirstEvent] = useState<boolean>(false); // Replaced by gameStatus
  // const [isStartingGame, setIsStartingGame] = useState<boolean>(false); // Replaced by gameStatus
  // const [isRecreatingGame, setIsRecreatingGame] = useState<boolean>(false); // Replaced by gameStatus
  const [viewMode, setViewMode] = useState<'choice' | 'create' | 'resume'>('choice');
  const [resumeGameIdInput, setResumeGameIdInput] = useState<string>('');

  // Unified Game Status
  type GameStatus =
    | 'idle' // Default, or ready for user input on a new turn
    | 'creatingGame_InProgress' // POST /api/v1/games (client-side loading)
    | 'creatingGame_WaitingForData' // After POST /api/v1/games, waiting for SSE for synopsis/initial content
    | 'loadingGame_WaitingForData' // Game ID known (e.g. resume), waiting for SSE for game data
    | 'recreatingGame_InProgress' // POST /api/v1/games?gameId=... (client-side loading)
    | 'recreatingGame_WaitingForData' // After recreation trigger, waiting for SSE for synopsis
    | 'startingGame_InProgress' // POST /api/v1/games/{id} (to start it, client-side loading)
    | 'startingGame_WaitingForFirstTurn' // After POST to start, waiting for first turn options via SSE
    | 'turn_Submitting' // Player submitted turn, POST /turns in progress (client-side loading)
    | 'turn_Resolving' // Turn submitted (POST complete), waiting for consequences via SSE
    | 'turn_GeneratingNext' // Consequences received, waiting for next turn's options via SSE
    | 'scene_GeneratingNext' // Scene consequences received, waiting for next scene's options via SSE
    | 'contentGen_Characters_WaitingForData' // Game loaded, but characters missing, waiting for SSE
    | 'contentGen_Settings_WaitingForData' // Game loaded, characters present, but synopsis missing, waiting for SSE
    | 'error_GameSetupFailed' // An error occurred that prevents game from starting/continuing
    | 'game_Over'; // Game has concluded

  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');

  // State for New Game Inputs
  const [gamePromptInput, setGamePromptInput] = useState<string>('A fantasy adventure in a dark forest.');
  const [maxScenesInput, setMaxScenesInput] = useState<number>(5);
  const [charactersInput, setCharactersInput] = useState<{ name: string; characterPrompt: string }[]>([
    { name: 'Sir Roland', characterPrompt: 'A noble knight who values honor and courage above all else' },
    { name: 'Lady Elara', characterPrompt: 'A wise mage seeking to protect the realm with her magical powers' },
  ]);

  const handleAddCharacterInput = () => {
    setCharactersInput([...charactersInput, { name: '', characterPrompt: '' }]);
  };

  const handleRemoveCharacterInput = (index: number) => {
    const newCharacters = charactersInput.filter((_, i) => i !== index);
    setCharactersInput(newCharacters);
  };

  const handleCharacterInputChange = (index: number, field: 'name' | 'characterPrompt', value: string) => {
    const newCharacters = charactersInput.map((char, i) => {
      if (i === index) {
        return { ...char, [field]: value };
      }
      return char;
    });
    setCharactersInput(newCharacters);
  };


  const handleCreateGame = async () => {
    setError(null);
    setGameStatus('creatingGame_InProgress');
    try {
      if (!gamePromptInput.trim()) {
        setError("Game Prompt cannot be empty.");
        setGameStatus('idle'); // Reset status on validation failure
        return;
      }
      if (maxScenesInput <= 0) {
        setError("Max Scenes Number must be greater than 0.");
        setGameStatus('idle'); // Reset status on validation failure
        return;
      }
      if (charactersInput.some(c => !c.name.trim() || !c.characterPrompt.trim())) {
        setError("All characters must have a name and a prompt.");
        setGameStatus('idle'); // Reset status on validation failure
        return;
      }

      const newGameData: NewGame = {
        gamePrompt: gamePromptInput,
        characters: charactersInput,
        maxScenesNumber: maxScenesInput,
      };
      const response = await fetch('/api/v1/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGameData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error creating game: ${response.statusText}`);
      }
      const result: { gameId: string } = await response.json();
      setGameId(result.gameId);
      setGameStatus('creatingGame_WaitingForData');
    } catch (e) {
      if (e instanceof Error) {
        console.error('Failed to create game:', e);
        setError(e.message);
      } else {
        console.error('Failed to create game (unknown error):', e);
        setError('An unknown error occurred while creating the game.');
      }
      setGameStatus('error_GameSetupFailed');
    }
  };

  const handleLoadGameById = () => {
    if (!resumeGameIdInput.trim()) {
      setError("Please enter a Game ID to resume.");
      return;
    }
    setError(null);
    setGame(null); // Clear any existing game data
    const newGameId = resumeGameIdInput.trim();
    setGameId(newGameId); // Set the gameId to trigger loading/SSE
    setGameStatus('loadingGame_WaitingForData'); // Expect SSE to deliver the game
    // No need to change viewMode here, UI will react to gameId
  };

  useEffect(() => { // Main SSE Setup and Game State/Status Management
    if (!gameId) {
      // If gameId is cleared, reset status to idle unless it's already in a creation or error state.
      if (gameStatus !== 'idle' && gameStatus !== 'creatingGame_InProgress' && gameStatus !== 'error_GameSetupFailed') {
        // console.log('GameStatus useEffect: No gameId, resetting status to idle.');
        setGameStatus('idle');
      }
      return;
    }

    // console.log(`GameStatus useEffect: Subscribing to SSE for gameId: ${gameId}. Current status: ${gameStatus}`);
    const eventSourceUrl = `/api/v1/games/${gameId}/updates`;
    let eventSource: EventSource;

    try {
      eventSource = new EventSource(eventSourceUrl);
      // console.log(`GameStatus useEffect: EventSource object created for ${eventSourceUrl}. ReadyState: ${eventSource.readyState}`);
    } catch (e) {
      console.error(`GameStatus useEffect: Error creating EventSource for ${eventSourceUrl}:`, e);
      setError(`Failed to initialize connection to game updates. Error: ${e instanceof Error ? e.message : String(e)}`);
      setGameStatus('error_GameSetupFailed');
      return;
    }

    eventSource.onopen = () => {
      // console.log(`GameStatus EventSource: SSE connection opened for gameId: ${gameId}. ReadyState: ${eventSource.readyState}`);
      // Transition status if we were in a 'InProgress' state for network calls
      if (gameStatus === 'creatingGame_InProgress') {
        // This was a client-side loading state, now connection is open, wait for data
        // setGameStatus('creatingGame_WaitingForData'); // Already set by handleCreateGame
      } else if (gameStatus === 'recreatingGame_InProgress') {
        // setGameStatus('recreatingGame_WaitingForData'); // Already set by recreation trigger
      } else if (gameStatus === 'startingGame_InProgress') {
        // setGameStatus('startingGame_WaitingForFirstTurn'); // Already set by handleStartGame
      }
      // If loading an existing game, handleLoadGameById sets 'loadingGame_WaitingForData'
    };

    eventSource.onmessage = (event) => {
      try {
        // console.log(`SSE event for ${gameId} (status ${gameStatus}):`, event.data);
        const gameData = JSON.parse(event.data) as PlayPageGame; // Use augmented type
        
        if (gameData && typeof gameData === 'object') {
          const oldGame = game; // Capture old game state for comparison
          setGame(gameData); // Update game state first

          const newCurrentScene: PlayPageScene | null = gameData.scenes?.slice(-1)[0] || null;
          const newCurrentTurn: PlayPageTurn | null = newCurrentScene?.turns?.slice(-1)[0] || null;
          const oldCurrentScene: PlayPageScene | null = oldGame?.scenes?.slice(-1)[0] || null;
          const oldCurrentTurn: PlayPageTurn | null = oldCurrentScene?.turns?.slice(-1)[0] || null;

          // console.log("New game data received via SSE:", gameData);
          // console.log("Current gameStatus before update:", gameStatus);

          if (gameData.conclusion) {
            if (gameStatus !== 'game_Over') {
              // console.log(`GameStatus Update: Game ${gameId} concluded. Setting status to game_Over.`);
              setGameStatus('game_Over');
            }
            return;
          }

          // Logic to transition gameStatus based on incoming gameData and current gameStatus
          switch (gameStatus) {
            case 'creatingGame_WaitingForData':
            case 'loadingGame_WaitingForData':
            case 'recreatingGame_WaitingForData':
              // In these states, we are waiting for the game data to fully arrive.
              // The next state depends on what's missing.
              if (!gameData.characters || gameData.characters.length === 0) {
                // console.log(`GameStatus Update: Game ${gameId} - characters missing. Transitioning to contentGen_Characters_WaitingForData`);
                setGameStatus('contentGen_Characters_WaitingForData');
              } else if (!gameData.synopsis) {
                // console.log(`GameStatus Update: Game ${gameId} - synopsis missing. Transitioning to contentGen_Settings_WaitingForData`);
                setGameStatus('contentGen_Settings_WaitingForData');
              } else {
                // console.log(`GameStatus Update: Game ${gameId} - characters and synopsis present. Transitioning to idle.`);
                setGameStatus('idle');
              }
              break;
            
            case 'contentGen_Characters_WaitingForData':
              if (gameData.characters && gameData.characters.length > 0) {
                if (!gameData.synopsis) {
                  // console.log(`GameStatus Update: Game ${gameId} - characters arrived, synopsis missing. Status: contentGen_Settings_WaitingForData`);
                  setGameStatus('contentGen_Settings_WaitingForData');
                } else {
                  // console.log(`GameStatus Update: Game ${gameId} - characters and synopsis now present. Status: idle.`);
                  setGameStatus('idle');
                }
              }
              break;

            case 'contentGen_Settings_WaitingForData':
              if (gameData.synopsis) {
                // console.log(`GameStatus Update: Game ${gameId} - synopsis arrived. Status: idle.`);
                setGameStatus('idle');
              }
              break;

            case 'startingGame_WaitingForFirstTurn':
              if (newCurrentTurn?.options && !newCurrentTurn.consequences) {
                // console.log(`GameStatus Update: Game ${gameId} - first turn options arrived. Status: idle.`);
                setGameStatus('idle');
              }
              break;

            case 'turn_Submitting': // Player has submitted their turn, POST /turns was called
              // Expecting SSE with consequences for the *same* turn number, or new options for next turn
              if (newCurrentTurn?.consequences && newCurrentTurn.turnNumber === oldCurrentTurn?.turnNumber) {
                // console.log(`GameStatus Update: Game ${gameId} - turn consequences arrived. Status: turn_Resolving.`);
                setGameStatus('turn_Resolving');
              } else if (newCurrentTurn?.options && !newCurrentTurn.consequences && newCurrentTurn.turnNumber !== oldCurrentTurn?.turnNumber) {
                // This implies the backend processed the submission and immediately sent the *next* turn's options
                // console.log(`GameStatus Update: Game ${gameId} - new turn options arrived after submission. Status: idle.`);
                setGameStatus('idle');
              } else if (newCurrentTurn?.options && !newCurrentTurn.consequences && newCurrentTurn.turnNumber === oldCurrentTurn?.turnNumber) {
                // This could happen if submission failed validation server-side and options are re-sent for the same turn
                // console.log(`GameStatus Update: Game ${gameId} - same turn options re-sent after submission (possible error/retry). Status: idle.`);
                setGameStatus('idle');
              }
              // If only game state updates without consequences or new options, stay in turn_Submitting (unlikely for long)
              break;

            case 'turn_Resolving': // Displaying turn consequences, waiting for next turn's options or scene end
              if (newCurrentTurn?.options && !newCurrentTurn.consequences && newCurrentTurn.turnNumber !== oldCurrentTurn?.turnNumber) {
                // console.log(`GameStatus Update: Game ${gameId} - next turn options arrived. Status: idle.`);
                setGameStatus('idle');
              } else if (newCurrentScene?.consequences && newCurrentScene.sceneNumber !== oldCurrentScene?.sceneNumber) {
                // console.log(`GameStatus Update: Game ${gameId} - scene ended (new scene has consequences). Status: scene_GeneratingNext.`);
                setGameStatus('scene_GeneratingNext');
              } else if (newCurrentScene?.consequences && !newCurrentTurn?.options && newCurrentScene.sceneNumber === oldCurrentScene?.sceneNumber) {
                 // console.log(`GameStatus Update: Game ${gameId} - current scene ended (consequences added). Status: scene_GeneratingNext.`);
                 setGameStatus('scene_GeneratingNext');
              }
              break;
            
            case 'scene_GeneratingNext': // Displaying scene consequences, waiting for next scene's first turn
              if (newCurrentTurn?.options && !newCurrentTurn.consequences &&
                  (newCurrentScene?.sceneNumber !== oldCurrentScene?.sceneNumber || !oldCurrentScene) ) {
                // console.log(`GameStatus Update: Game ${gameId} - new scene's first turn arrived. Status: idle.`);
                setGameStatus('idle');
              }
              break;
            
            case 'idle':
              // If in idle and game data changes (e.g. external update, or initial load completing to idle)
              // ensure UI reflects playability. If new turn options appear, it's fine.
              // If game becomes unplayable (e.g. synopsis disappears), recreation logic might kick in.
              // No specific status change needed here usually, unless data implies a problem.
              if (!gameData.synopsis && gameData.gamePrompt) { // Game lost synopsis but has prompt
                // console.log(`GameStatus Idle Check: Game ${gameId} lost synopsis. Re-evaluating for recreation.`);
                // The recreation useEffect will handle this.
              }
              break;

            // No default case needed if all active statuses are handled.
          }

        } else {
          console.warn('Received SSE data did not parse to a valid object:', event.data);
        }
      } catch (e) {
        console.error('Error parsing SSE data:', e);
        setError('Error processing game update.');
        setGameStatus('error_GameSetupFailed');
      }
    };

    eventSource.onerror = (errorEvent) => {
      console.error(`GameStatus EventSource: Error occurred with SSE connection for gameId: ${gameId}. Event:`, errorEvent, `ReadyState: ${eventSource.readyState}`);
      let errorMessage = 'Connection to game updates failed.';
      if (eventSource.readyState === EventSource.CLOSED) {
        errorMessage += ' The connection was closed.';
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        errorMessage += ' Attempting to reconnect...'; // EventSource handles this
      }
      setError(errorMessage + ' Please try refreshing if the issue persists.');
      
      if (eventSource.readyState === EventSource.CLOSED) {
        // console.log(`GameStatus EventSource: Closing SSE connection for gameId: ${gameId} due to error and closed state.`);
        eventSource.close();
        // If connection is closed and we were in an active waiting state, it's an error.
        const activeWaitingStatuses: GameStatus[] = [
            'creatingGame_WaitingForData', 'loadingGame_WaitingForData', 'recreatingGame_WaitingForData',
            'startingGame_WaitingForFirstTurn', 'turn_Resolving', 'turn_GeneratingNext', 'scene_GeneratingNext',
            'contentGen_Characters_WaitingForData', 'contentGen_Settings_WaitingForData', 'turn_Submitting',
            'startingGame_InProgress', 'recreatingGame_InProgress' // also include in-progress states for network calls
        ];
        if (activeWaitingStatuses.includes(gameStatus)) {
            console.warn(`SSE connection closed while in active status: ${gameStatus}. Setting to error_GameSetupFailed.`);
            setGameStatus('error_GameSetupFailed');
        }
      }
    };

    return () => {
      // console.log(`GameStatus useEffect Cleanup: Closing SSE for gameId: ${gameId}. ReadyState before close: ${eventSource?.readyState}`);
      eventSource.close();
    };
  }, [gameId, gameStatus, setGameStatus, setError, setGame, game]); // `game` is needed for oldGame comparison

  // useEffect for triggering game recreation if necessary (e.g., loaded game is incomplete)
  useEffect(() => {
    if (!game || !gameId) return;

    // Only consider recreation if the game is loaded but incomplete,
    // and we are in a state where recreation makes sense (e.g. idle, or specific content waiting states).
    const canConsiderRecreation =
      gameStatus === 'idle' ||
      gameStatus === 'contentGen_Characters_WaitingForData' ||
      gameStatus === 'contentGen_Settings_WaitingForData' ||
      gameStatus === 'error_GameSetupFailed'; // Allow retry from failed setup

    if (!game.synopsis && canConsiderRecreation) {
      // Check if we have the necessary data from the 'game' object to make the call
      if (game.gamePrompt && typeof game.maxScenesNumber === 'number' && game.characters && game.characters.length > 0) {
        console.log(`Recreation Trigger useEffect: Game ${game.gameId} incomplete (no synopsis), status ${gameStatus}. Triggering recreation.`);
        setGameStatus('recreatingGame_InProgress');

        const newGamePayload: NewGame = {
          gamePrompt: game.gamePrompt,
          maxScenesNumber: game.maxScenesNumber,
          characters: game.characters.map(c => ({ // Assuming c.prompt is the original creation prompt
            name: c.name,
            characterPrompt: c.prompt || `Default prompt for ${c.name}`,
          })),
        };

        fetch(`/api/v1/games?gameId=${game.gameId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGamePayload),
        })
        .then(response => {
          if (!response.ok) {
            response.text().then(text => console.error("Recreation error response body:", text));
            throw new Error(`Failed to trigger game content re-generation: ${response.status}`);
          }
          console.log(`Recreation Trigger useEffect: Game content re-generation triggered successfully for ${game.gameId}.`);
          setGameStatus('recreatingGame_WaitingForData'); // Now wait for SSE
        })
        .catch(triggerError => {
          console.error(`Recreation Trigger useEffect: Error for ${game.gameId}:`, triggerError);
          setError(prevError => prevError ? `${prevError}\nError re-initializing game content.` : 'Error re-initializing game content.');
          setGameStatus('error_GameSetupFailed');
        });
      } else {
        console.warn(`Recreation Trigger useEffect: Cannot re-trigger game ${game.gameId}, missing initial data. Current gameStatus: ${gameStatus}`);
        // Optionally set an error or a specific status if critical data for recreation is missing from 'game' object
        // setError('Cannot re-initialize game: essential starting information is missing from the current game state.');
        // setGameStatus('error_GameSetupFailed'); // Or a more specific error
      }
    } else if (game.synopsis && gameStatus === 'recreatingGame_WaitingForData') {
      // If synopsis arrived while we were waiting for recreation data, transition to idle.
      // The main SSE useEffect might also handle this, but this is a safeguard.
      console.log(`Recreation Trigger useEffect: Synopsis received for ${game.gameId} while waiting for recreation. Transitioning to idle.`);
      setGameStatus('idle');
    }
  }, [game, gameId, gameStatus, setGameStatus, setError]); // Dependencies for recreation logic


  // This useEffect was for the old `generatingPhase`. It's now merged into the main SSE/GameStatus useEffect.
  // useEffect(() => {
  //   // console.log(`GeneratingPhase useEffect: game changed. Current phase: ${generatingPhase}, isLoading: ${isLoading}`);
  //   if (!game || !game.scenes || game.scenes.length === 0) {
  //     if (generatingPhase !== null) {
  //       // console.log("GeneratingPhase useEffect: No game/scenes, resetting phase.");
  //       setGeneratingPhase(null);
  //     }
  //     return;
  //   }
    
  //   if (game.conclusion) {
  //     if (generatingPhase !== null) {
  //       // console.log("GeneratingPhase useEffect: Game concluded, resetting phase.");
  //       setGeneratingPhase(null);
  //     }
  //     return;
  //   }

  //   const currentScene = game.scenes[game.scenes.length - 1];
  //   const currentTurn = currentScene.turns && currentScene.turns.length > 0
  //                       ? currentScene.turns[currentScene.turns.length - 1]
  //                       : null;

  //   if (generatingPhase === 'turnResolution') {
  //     // We are waiting for the current turn's consequences.
  //     // This phase is set when handleSubmitTurn starts.
  //     // isLoading becomes false when the fetch in handleSubmitTurn completes.
  //     // Then, SSE will deliver the game state with consequences for currentTurn.
  //     if (currentTurn?.consequences && !isLoading) {
  //       // console.log("GeneratingPhase useEffect: Turn consequences arrived AND fetch completed. Setting phase to 'nextTurn'.");
  //       setGeneratingPhase('nextTurn');
  //     } else {
  //       // console.log(`GeneratingPhase useEffect: Still 'turnResolution'. currentTurn?.consequences: ${!!currentTurn?.consequences}, isLoading: ${isLoading}`);
  //     }
  //   } else if (generatingPhase === 'nextTurn') {
  //     // We displayed turn consequences and are waiting for the next turn or scene end.
  //     // If a new turn (options, no consequences) appears in the *same* scene:
  //     if (currentTurn?.options && !currentTurn.consequences) {
  //       // console.log("GeneratingPhase useEffect: New turn options arrived. Clearing generating phase.");
  //       setGeneratingPhase(null);
  //     } else if (currentScene.consequences) {
  //       // Or, if the current scene has ended (has consequences):
  //       // console.log("GeneratingPhase useEffect: Scene consequences arrived. Setting phase to 'nextScene'.");
  //       setGeneratingPhase('nextScene');
  //     } else {
  //       // console.log(`GeneratingPhase useEffect: Still 'nextTurn'. currentTurn?.options: ${!!currentTurn?.options}, currentScene.consequences: ${!!currentScene.consequences}`);
  //     }
  //   } else if (generatingPhase === 'nextScene') {
  //     // We displayed scene consequences and are waiting for the next scene or game end.
  //     // If a new scene appears (new currentScene with a first turn that has options):
  //     if (currentTurn?.options && !currentTurn.consequences) {
  //       // console.log("GeneratingPhase useEffect: New scene with options arrived. Clearing generating phase.");
  //       setGeneratingPhase(null);
  //     } else {
  //       // console.log(`GeneratingPhase useEffect: Still 'nextScene'. currentTurn?.options: ${!!currentTurn?.options}`);
  //     }
  //   }
  // }, [game, generatingPhase, isLoading, setGeneratingPhase]);


  const handleStartGame = async () => {
    if (!gameId) return;
    setError(null);
    setGameStatus('startingGame_InProgress');

    try {
      const response = await fetch(`/api/v1/games/${gameId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        setGameStatus('idle'); // Or 'error_GameSetupFailed'
        throw new Error(errorData.message || `Error starting game: ${response.statusText}`);
      }
      // Game state will be updated via SSE. The main useEffect will set:
      setGameStatus('startingGame_WaitingForFirstTurn');
    } catch (e) {
      if (e instanceof Error) {
        console.error('Failed to start game:', e);
        setError(e.message);
      } else {
        console.error('Failed to start game (unknown error):', e);
        setError('An unknown error occurred while starting the game.');
      }
      setGameStatus('error_GameSetupFailed'); // Or 'idle'
    }
  };

  const handleOptionChange = (characterName: string, optionValue: string) => {
    setSelectedOptions(prev => ({ ...prev, [characterName]: optionValue }));
    // If a radio option is selected, clear the free text for that character
    setFreeTextInputs(prev => ({ ...prev, [characterName]: '' }));
  };

  const handleFreeTextChange = (characterName: string, text: string) => {
    setFreeTextInputs(prev => ({ ...prev, [characterName]: text }));
    // If free text is used, it overrides the selected option
    if (text.trim() !== '') { // Only consider it an override if there's actual text
      setSelectedOptions(prev => ({ ...prev, [characterName]: `freeText:${text}` }));
    } else {
      // If free text is cleared, remove it as the selected option
      // This allows radio buttons to be re-selected if desired.
      setSelectedOptions(prev => {
        const newSelected = { ...prev };
        // Only delete if the current selection was from this free text field
        if (newSelected[characterName]?.startsWith('freeText:')) {
          delete newSelected[characterName];
        }
        return newSelected;
      });
    }
  };

  const handleSubmitTurn = async () => {
    const currentScene = game && game.scenes && game.scenes.length > 0 ? game.scenes[game.scenes.length - 1] : null;
    const turnToSubmit = currentScene && currentScene.turns && currentScene.turns.length > 0 ? currentScene.turns[currentScene.turns.length - 1] : null;

    if (!gameId || !game || !turnToSubmit || !turnToSubmit.options) return;
    
    setError(null);
    setGameStatus('turn_Submitting');

    const characterActions: ChosenCharacterAction[] = [];
    turnToSubmit.options.forEach((charOption: GameCharacterOption) => {
      const characterName = charOption.name;
      const actionValue = selectedOptions[characterName]; // This is the selected radio button value or "freeText:..."

      if (actionValue) { // If an option was selected or free text was entered
        if (actionValue.startsWith('freeText:')) {
          characterActions.push({ characterName, chosenOption: actionValue.substring('freeText:'.length) });
        } else {
          characterActions.push({ characterName, chosenOption: actionValue });
        }
      }
    });

    // Ensure all characters who had options made a choice
    if (characterActions.length !== turnToSubmit.options.length) {
        setError("All characters with options must select an action or provide free text input.");
        // setIsLoading(false); // Replaced by gameStatus
        setGameStatus('idle'); // Or a specific error state for validation failure
        return;
    }

    const newTurnData: NewTurn = { characterActions };

    try {
      const response = await fetch(`/api/v1/games/${gameId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTurnData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error submitting turn: ${response.statusText}`);
      }
      setSelectedOptions({});
      setFreeTextInputs({});
    } catch (e) {
      if (e instanceof Error) {
        console.error('Failed to submit turn:', e);
        setError(e.message);
      } else {
        console.error('Failed to submit turn (unknown error):', e);
        setError('An unknown error occurred while submitting the turn.');
      }
      setGameStatus('error_GameSetupFailed'); // More specific error for submission failure
    }
    // If the POST request in handleSubmitTurn is successful,
    // gameStatus remains 'turn_Submitting'.
    // The main useEffect watching `game` and `gameStatus` will then transition
    // to 'turn_Resolving' when the SSE event with consequences arrives,
    // or to 'idle' if new options arrive directly.
  };
  
  const currentScene = game && game.scenes && game.scenes.length > 0 ? game.scenes[game.scenes.length - 1] : null;
  const currentTurn = currentScene && currentScene.turns && currentScene.turns.length > 0 ? currentScene.turns[currentScene.turns.length - 1] : null;
  
  const allCharactersMadeChoice = currentTurn?.options?.every(
    (charOpt: GameCharacterOption) => selectedOptions[charOpt.name] // This covers radio and free text due to handleFreeTextChange logic
  );

  // Determine if any critical loading/processing is happening for disabling UI elements
  const isProcessing =
    gameStatus === 'creatingGame_InProgress' ||
    gameStatus === 'loadingGame_WaitingForData' || // Keep this as a general "network active" for resume
    gameStatus === 'recreatingGame_InProgress' ||
    gameStatus === 'startingGame_InProgress' ||
    gameStatus === 'turn_Submitting';

  // Determine if we are waiting for SSE to deliver game content/updates
  const isWaitingForSSEResponse =
    gameStatus === 'creatingGame_WaitingForData' ||
    gameStatus === 'recreatingGame_WaitingForData' ||
    gameStatus === 'contentGen_Characters_WaitingForData' ||
    gameStatus === 'contentGen_Settings_WaitingForData' ||
    gameStatus === 'startingGame_WaitingForFirstTurn' ||
    gameStatus === 'turn_Resolving' ||
    gameStatus === 'turn_GeneratingNext' ||
    gameStatus === 'scene_GeneratingNext';

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>{game ? `AI RPG GAME - ${game.gameId}` : (gameId ? `AI RPG GAME - ${gameId}` : 'AI RPG Game')}</h1>

      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>Error: {error}</p>}

      {/* Centralized Status Messages */}
      {(isProcessing || isWaitingForSSEResponse || gameStatus === 'error_GameSetupFailed') && (
        <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}>
          {gameStatus === 'creatingGame_InProgress' && <p>Creating your game world...</p>}
          {gameStatus === 'loadingGame_WaitingForData' && gameId && <p>Loading game data for {gameId}...</p>}
          {gameStatus === 'recreatingGame_InProgress' && <p>Re-initializing game content...</p>}
          {gameStatus === 'creatingGame_WaitingForData' && <p>Game created! Waiting for initial game data (characters, synopsis)...</p>}
          {gameStatus === 'recreatingGame_WaitingForData' && <p>Re-initialization triggered. Waiting for updated game data...</p>}
          {gameStatus === 'contentGen_Characters_WaitingForData' && <p>Generating characters...</p>}
          {gameStatus === 'contentGen_Settings_WaitingForData' && <p>Generating game setting and synopsis...</p>}
          {gameStatus === 'startingGame_InProgress' && <p>Starting your adventure...</p>}
          {gameStatus === 'startingGame_WaitingForFirstTurn' && <p>Preparing the first scene...</p>}
          {gameStatus === 'turn_Submitting' && <p>Submitting turn... Please wait.</p>}
          {gameStatus === 'turn_Resolving' && <p>Processing turn resolution...</p>}
          {gameStatus === 'turn_GeneratingNext' && <p>Generating next turn...</p>}
          {gameStatus === 'scene_GeneratingNext' && <p>Generating next scene...</p>}
          {gameStatus === 'error_GameSetupFailed' && !error && <p style={{color: 'orange'}}>Game setup encountered an issue. Please check other error messages or try again.</p>}
        </div>
      )}


      {/* Initial choice: Create or Resume (only if no gameId and not processing/waiting) */}
      {viewMode === 'choice' && !gameId && !isProcessing && !isWaitingForSSEResponse && gameStatus === 'idle' && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2>Welcome!</h2>
          <button onClick={() => setViewMode('create')} style={{ padding: '10px 15px', fontSize: '16px', marginRight: '10px' }} disabled={isProcessing}>
            Create New Game
          </button>
          <button onClick={() => setViewMode('resume')} style={{ padding: '10px 15px', fontSize: '16px' }} disabled={isProcessing}>
            Resume Game
          </button>
        </div>
      )}

      {/* Resume Game Form (only if no gameId and not processing/waiting) */}
      {viewMode === 'resume' && !gameId && !isProcessing && !isWaitingForSSEResponse && gameStatus === 'idle' && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Resume Game</h3>
          <div>
            <label htmlFor="resumeGameId" style={{ display: 'block', marginBottom: '5px' }}>Enter Game ID:</label>
            <input
              type="text"
              id="resumeGameId"
              value={resumeGameIdInput}
              onChange={(e) => setResumeGameIdInput(e.target.value)}
              style={{ padding: '8px', marginRight: '10px', minWidth: '250px' }}
              disabled={isProcessing}
            />
            <button
              onClick={handleLoadGameById}
              disabled={isProcessing || !resumeGameIdInput.trim()}
              style={{ padding: '8px 15px', fontSize: '16px' }}
            >
              Load Game
            </button>
          </div>
          <button onClick={() => { setViewMode('choice'); setError(null); }} style={{ marginTop: '15px', fontSize: '14px' }} disabled={isProcessing}>
            Back to choices
          </button>
        </div>
      )}
      
      {/* Create New Game Form (only if viewMode is 'create', no gameId, and not in a conflicting gameStatus) */}
      {viewMode === 'create' && !gameId &&
       gameStatus !== 'creatingGame_WaitingForData' &&
       gameStatus !== 'loadingGame_WaitingForData' && // Should not be possible if !gameId, but for safety
       gameStatus !== 'recreatingGame_WaitingForData' && // Should not be possible if !gameId
       !isWaitingForSSEResponse && // General check
      (
        <div style={{ border: '1px solid #eee', padding: '15px', marginBottom: '20px' }}>
          <h3>Create New Game</h3>
          <button onClick={() => { setViewMode('choice'); setError(null); }} style={{ marginBottom: '15px', fontSize: '14px' }} disabled={isProcessing}>
            Back to choices
          </button>
          <div>
            <label htmlFor="gamePrompt" style={{ display: 'block', marginBottom: '5px' }}>Game Prompt:</label>
            <textarea
              id="gamePrompt"
              value={gamePromptInput}
              onChange={(e) => setGamePromptInput(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              disabled={isProcessing}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="maxScenes" style={{ display: 'block', marginBottom: '5px' }}>Max Scenes Number:</label>
            <input
              type="number"
              id="maxScenes"
              value={maxScenesInput}
              onChange={(e) => setMaxScenesInput(parseInt(e.target.value, 10))}
              style={{ padding: '8px' }}
              disabled={isProcessing}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <h4>Characters:</h4>
            {charactersInput.map((char, index) => (
              <div key={index} style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px' }}>
                <div>
                  <label htmlFor={`charName-${index}`} style={{ display: 'block', marginBottom: '3px' }}>Name:</label>
                  <input
                    type="text"
                    id={`charName-${index}`}
                    value={char.name}
                    onChange={(e) => handleCharacterInputChange(index, 'name', e.target.value)}
                    style={{ padding: '8px', width: 'calc(100% - 100px)', marginRight: '10px' }}
                    disabled={isProcessing}
                  />
                </div>
                <div style={{ marginTop: '5px' }}>
                  <label htmlFor={`charPrompt-${index}`} style={{ display: 'block', marginBottom: '3px' }}>Prompt:</label>
                  <textarea
                    id={`charPrompt-${index}`}
                    value={char.characterPrompt}
                    onChange={(e) => handleCharacterInputChange(index, 'characterPrompt', e.target.value)}
                    rows={2}
                    style={{ width: 'calc(100% - 100px)', padding: '8px', boxSizing: 'border-box', marginRight: '10px' }}
                    disabled={isProcessing}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCharacterInput(index)}
                  style={{ marginTop: '5px', color: 'red' }}
                  disabled={isProcessing}
                >
                  Remove Character
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCharacterInput}
              style={{ marginTop: '10px' }}
              disabled={isProcessing}
            >
              Add Character
            </button>
          </div>
          <button
            onClick={handleCreateGame}
            disabled={isProcessing}
            style={{ marginTop: '20px', padding: '10px 15px', fontSize: '16px' }}
          >
            {gameStatus === 'creatingGame_InProgress' ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      )}

      {/* Game Display Area: Shown if game object exists and we are past initial view modes or gameId is set */}
      {game && gameId && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
            <h4>Game Details:</h4>
            <p><strong>ID:</strong> {game.gameId}</p>
            {game.synopsis && <p><strong>Synopsis:</strong> {game.synopsis}</p>}
            {/* Specific messages for content generation are handled by the centralized status messages now */}
          </div>

          {/* Start Game Button: if synopsis exists, no current turn, not concluded, and status is idle */}
          {game.synopsis && !currentTurn && !game.conclusion && gameStatus === 'idle' && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <button
                onClick={handleStartGame}
                disabled={isProcessing || isWaitingForSSEResponse} // Disable if any processing or waiting for SSE
                style={{
                  padding: '15px 25px',
                  fontSize: '18px',
                  backgroundColor: (isProcessing || isWaitingForSSEResponse) ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: (isProcessing || isWaitingForSSEResponse) ? 'not-allowed' : 'pointer'
                }}
              >
                Start Game
              </button>
            </div>
          )}

          {/* Current Scene and Turn Display */}
          {currentScene && gameStatus !== 'game_Over' && ( // Don't show scene/turn if game is over
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
              <h4>Current Scene: {currentScene.sceneId} (Scene {currentScene.sceneNumber})</h4>
              <p style={{ margin: '0 0 10px 0', maxWidth: '90ch' }}>{currentScene.description}</p>

              {currentTurn && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
                  <h5>Current Turn: {currentTurn.turnId} (Turn {currentTurn.turnNumber})</h5>
                  {currentTurn.description && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 10px 0', maxWidth: '90ch' }}>{currentTurn.description}</p>
                    </div>
                  )}
                  {currentTurn.consequences && (
                    <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e6ffed', border: '1px solid #b2fab4', borderRadius: '3px' }}>
                      <strong>Resolution:</strong> {currentTurn.consequences}
                    </div>
                  )}

                  {/* Character Options/Input: Show if options exist, no consequences yet, game not over, and status is idle */}
                  {currentTurn.options && !currentTurn.consequences && !game.conclusion && gameStatus === 'idle' && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>Choose actions for your characters:</strong>
                      {currentTurn.options.map((charOption: GameCharacterOption) => (
                        <div key={charOption.name} style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '3px' }}>
                          <strong>{charOption.name}:</strong>
                          {charOption.descriptions.map((optionDesc: string, index: number) => (
                            <label key={index} style={{ display: 'block', margin: '5px 0' }}>
                              <input
                                type="radio"
                                name={`option-${charOption.name}`}
                                value={optionDesc}
                                checked={selectedOptions[charOption.name] === optionDesc}
                                onChange={() => handleOptionChange(charOption.name, optionDesc)}
                                disabled={!!freeTextInputs[charOption.name] || isProcessing} // Disable radio if free text or processing
                                style={{ marginRight: '8px' }}
                              />
                              {optionDesc}
                            </label>
                          ))}
                          <input
                            type="text"
                            placeholder="Or type a custom action..."
                            value={freeTextInputs[charOption.name] || ''}
                            onChange={(e) => handleFreeTextChange(charOption.name, e.target.value)}
                            disabled={isProcessing}
                            style={{ marginTop: '5px', width: 'calc(100% - 18px)', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
                          />
                        </div>
                      ))}
                      <div style={{textAlign: 'center', marginTop: '20px'}}>
                        <button
                          onClick={handleSubmitTurn}
                          disabled={!allCharactersMadeChoice || isProcessing || isWaitingForSSEResponse}
                          style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            backgroundColor: (isProcessing || isWaitingForSSEResponse) ? '#ccc' : (!allCharactersMadeChoice ? '#ccc' : '#007bff'),
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: (isProcessing || isWaitingForSSEResponse || !allCharactersMadeChoice) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Submit Turn
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Scene Conclusion: Show if scene has consequences, not showing turn options, and game not over */}
              {currentScene.consequences &&
               !(currentTurn?.options && !currentTurn.consequences && gameStatus === 'idle') &&
               !game.conclusion && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #b3e0ff', borderRadius: '3px' }}>
                  <strong>Scene Conclusion:</strong> {currentScene.consequences}
                </div>
              )}
            </div>
          )}
          {/* Game Conclusion Display */}
          {game.conclusion && ( // Show conclusion if it exists, game_Over status will also be true
             <div style={{ border: '1px solid #ddd', padding: '15px', marginTop: '20px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
              <h3>Game Over!</h3>
              <p><strong>Conclusion:</strong> {game.conclusion}</p>
            </div>
          )}
        </div>
      )}

      {/* Game Object Viewer (for debugging, shown if game object exists) */}
      {game && (
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #ccc' }}>
          <h4>Game State (Debug):</h4>
          <p>Current Game Status: <strong>{gameStatus}</strong></p>
          <div style={{ maxHeight: '500px', overflowY: 'auto', marginBottom: '0px' }}>
            <JsonViewer value={game} theme="light" indentWidth={2} displayDataTypes={false} />
          </div>
        </div>
      )}
    </div>
  );
}