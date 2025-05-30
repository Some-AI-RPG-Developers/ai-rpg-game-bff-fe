import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { NewGame, NewTurn } from '@/types/api.alias.types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//TODO: rivedere
interface GameServiceClient {
  CreateGame: (
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ) => void;
  StartGame: (
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ) => void;
  SubmitTurn: (
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ) => void;
}

export interface GRPCClientConfig {
  serverAddress: string;
  serverPort: number;
  useSSL?: boolean;
  timeout?: number;
} 

export interface GRPCGameClient {
  createGame(gameId: string, newGame: NewGame): Promise<void>;
  startGame(gameId: string): Promise<void>;
  submitTurn(gameId: string, newTurn: NewTurn): Promise<void>;
  close(): void;
}

export class GRPCGameClientImpl implements GRPCGameClient {
  private readonly client: GameServiceClient;
  private readonly config: GRPCClientConfig;

  constructor(config: GRPCClientConfig) {
    this.config = config;
    this.client = this.createClient();
  }

  private createClient(): GameServiceClient {
    const PROTO_PATH = path.join(__dirname, '../proto/game_service.proto');
    
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
    const gameService = protoDescriptor.airgp.game.v1.GameService;

    const serverAddress = `${this.config.serverAddress}:${this.config.serverPort}`;
    const credentials = this.config.useSSL 
      ? grpc.credentials.createSsl()
      : grpc.credentials.createInsecure();

    return new gameService(serverAddress, credentials) as GameServiceClient;
  }

  async createGame(gameId: string, newGame: NewGame): Promise<void> {
    const request = {
      game_id: gameId,
      game_prompt: newGame.gamePrompt,
      characters: newGame.characters.map(character => ({
        name: character.name,
        character_prompt: character.characterPrompt,
      })),
    };

    const createGameAsync = promisify(this.client.CreateGame.bind(this.client));
    
    try {
      await createGameAsync(request);
    } catch (error) {
      throw new Error(`Failed to create game via gRPC: ${error}`);
    }
  }

  async startGame(gameId: string): Promise<void> {
    const request = {
      game_id: gameId,
    };

    const startGameAsync = promisify(this.client.StartGame.bind(this.client));
    
    try {
      await startGameAsync(request);
    } catch (error) {
      throw new Error(`Failed to start game via gRPC: ${error}`);
    }
  }

  async submitTurn(gameId: string, newTurn: NewTurn): Promise<void> {
    const request = {
      game_id: gameId,
      character_actions: newTurn.characterActions.map(action => ({
        character_name: action.characterName,
        chosen_option: action.chosenOption,
      })),
    };

    const submitTurnAsync = promisify(this.client.SubmitTurn.bind(this.client));
    
    try {
      await submitTurnAsync(request);
    } catch (error) {
      throw new Error(`Failed to submit turn via gRPC: ${error}`);
    }
  }

  close(): void {
    if (this.client) {
      grpc.closeClient(this.client as any);
    }
  }
} 