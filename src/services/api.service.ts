import {v4 as uuidv4} from 'uuid';
import {CharacterAction, Game, GameId, NewGame, NewTurn} from '@/types/api-alias';
import {GameRepository, getGameRepository} from "@/database/repository/game.repository";
import {DatabaseType} from "@/database/database.client";

export interface IGameService {
  createGame(newGame: NewGame): Promise<GameId>;
  getGame(gameId: string): Promise<Game | null>;
  startGame(gameId: string): Promise<boolean>;
  submitTurn(gameId: string, newTurn: NewTurn): Promise<boolean>;
}

const gamesStore: Record<string, Game> = {};

const DEFAULT_MAX_SCENES = 5;

export class GameService implements IGameService {
  private gameRepository: GameRepository

  constructor(gameRepository: GameRepository) {
    this.gameRepository = gameRepository;
  }

  async createGame(newGame: NewGame): Promise<GameId> {
    const gameId = uuidv4();

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
      sceneId: uuidv4(),
      description: "The adventure begins...",
      turns: [
        {
          turnId: uuidv4(),
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
    const maxScenes = game.maxScenesNumber || DEFAULT_MAX_SCENES;
    if (game.scenes.length < maxScenes) {
      currentScene.turns.push({
        turnId: uuidv4(),
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
}

// Export singleton instance of the service
const gameRepository = getGameRepository(DatabaseType.MONGODB);
export const gameService = new GameService(gameRepository);