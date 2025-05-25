import {v4 as uuid} from 'uuid';
import {CharacterAction, Game, GameId, NewGame, NewTurn} from '@/types/api-alias';
import {GameRepository, getMongodbGameRepository} from "@/database/repository/game.repository";
import {GameChangeStream, getMongodbGameChangeStreamInstance} from "@/database/stream/game.stream";
import {getSSEBroadcasterInstance, SSEBroadcaster} from "@/sse/sse.broadcaster";


const gamesStore: Record<string, Game> = {};

const DEFAULT_MAX_SCENES = 5;

export class GameService {
  private readonly gameRepository: GameRepository
  private readonly gameChangeStream: GameChangeStream
  private readonly sseBroadcaster: SSEBroadcaster

  constructor(
      gameRepository: GameRepository,
      gameChangeStream: GameChangeStream,
      sseBroadcaster: SSEBroadcaster) {
    this.gameRepository = gameRepository;
    this.gameChangeStream = gameChangeStream;
    this.sseBroadcaster = sseBroadcaster;
  }

  async createGame(newGame: NewGame): Promise<GameId> {
    const gameId = uuid();

    gamesStore[gameId] = {
      gameId,
      gamePrompt: newGame.gamePrompt,
      synopsis: `A brave band of heroes embarks on a journey based on: ${newGame.gamePrompt}`,
      maxScenesNumber: DEFAULT_MAX_SCENES,
      characters: newGame.characters.map(character => ({
        name: character.name,
        description: `A character based on: ${character.characterPrompt}`,
        prompt: character.characterPrompt,
        status: 'active'
      })),
      scenes: [],
      objectives: [
        {
          description: "Complete the first objective",
          progress: "0/3 steps completed",
          requiredSteps: ["Step 1", "Step 2", "Step 3"],
          completed: false
        }
      ],
      finalObjective: {
        description: "Complete the final objective",
        progress: "Not started",
        requiredSteps: ["Step 1", "Step 2", "Step 3"],
        completed: false
      }
    };
    return { gameId };
  }

  async getGame(gameId: string): Promise<Game | null> {
      return this.gameRepository.getGame(gameId);
  }

  async startGame(gameId: string): Promise<boolean> {
    const game = gamesStore[gameId];
    if (!game) {
      return false;
    }
    
    // Add a first scene when starting the game
    game.scenes.push({
      sceneId: uuid(),
      description: "The adventure begins...",
      turns: [
        {
          turnId: uuid(),
          description: "The heroes must decide their first move",
          options: game.characters.map(character => ({
            name: character.name,
            descriptions: [
              "Option 1 for this character",
              "Option 2 for this character",
              "Option 3 for this character"
            ]
          })),
          actions: []
        }
      ]
    });
    
    return true;
  }

  async submitTurn(gameId: string, newTurn: NewTurn): Promise<boolean> {
    const game = gamesStore[gameId];
    if (!game || game.scenes.length === 0) {
      return false;
    }
    
    // Get the current scene
    const currentScene = game.scenes[game.scenes.length - 1];
    const currentTurn = currentScene.turns[currentScene.turns.length - 1];
    
    // Record the actions from this turn
    newTurn.characterActions.forEach((action: CharacterAction) => {
      currentTurn.actions.push({
        name: action.characterName,
        message: `${action.characterName} chooses to ${action.chosenOption}`
      });
    });
    
    // Add consequences
    currentTurn.consequences = "The heroes' actions have consequences...";
    
    // Add a new turn if we're not at the end of the game
    const maxScenes = game.maxScenesNumber ?? DEFAULT_MAX_SCENES;
    if (game.scenes.length < maxScenes) {
      currentScene.turns.push({
        turnId: uuid(),
        description: "The adventure continues...",
        options: game.characters.map(character => ({
          name: character.name,
          descriptions: [
            "New option 1 for this character",
            "New option 2 for this character",
            "New option 3 for this character"
          ]
        })),
        actions: []
      });
    } else {
      // Finish the game
      game.conclusion = "The heroes completed their adventure!";
      game.finalObjective.completed = true;
    }
    return true;
  }

  async getGamesUpdates(): Promise<void>{
    // Configure change stream with custom pipeline for better filtering
    for await (const gameUpdate of this.gameChangeStream.getGamesChangeEvents()) {
      const game: Game = gameUpdate.fullDocument
      this.sseBroadcaster.broadcastEventToClient(JSON.stringify(game), game.gameId);
    }
  }

  async initGamesUpdates(): Promise<void> {
    await this.gameChangeStream.initChangeStream();
  }

  async stopGamesUpdates(): Promise<void> {
    await this.gameChangeStream.closeChangeStream();
    this.sseBroadcaster.stopBroadcastingEventsToClients()
  }
}

let gameService: GameService;
export function getGameServiceInstance(): GameService {
  if (gameService) {
    return gameService
  }
  const gameRepository = getMongodbGameRepository();
  const gameChangeStream = getMongodbGameChangeStreamInstance()
  const sseBroadcaster = getSSEBroadcasterInstance()
  return gameService = new GameService(gameRepository, gameChangeStream, sseBroadcaster);
}
