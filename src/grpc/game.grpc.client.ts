import * as grpc from '@grpc/grpc-js';
import {NewGame, NewTurn} from '@/types/rest/api.alias.types';
import {GameServiceClient} from '@/types/proto/game_service';

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
    const serverAddress = `${this.config.serverAddress}:${this.config.serverPort}`;
    const credentials = this.config.useSSL 
      ? grpc.credentials.createSsl()
      : grpc.credentials.createInsecure();
    return new GameServiceClient(serverAddress, credentials);
  }

  async createGame(gameId: string, newGame: NewGame): Promise<void> {
    const request = {
      gameId: gameId,
      gamePrompt: newGame.gamePrompt,
      characters: newGame.characters.map(character => ({
        name: character.name,
        characterPrompt: character.characterPrompt,
      })),
    };
    this.client.createGame(
        request,
        (error, _): void => {
          if (error) {
            throw new Error(`Failed to create game via gRPC: ${error}`);
          }
        });
  }

  async startGame(gameId: string): Promise<void> {
    const request = {
      gameId: gameId,
    };
    this.client.startGame(
        request,
        (error, _):void => {
          if (error) {
            throw new Error(`Failed to start game via gRPC: ${error}`);
          }
        });
  }

  async submitTurn(gameId: string, newTurn: NewTurn): Promise<void> {
    const request = {
      gameId: gameId,
      characterActions: newTurn.characterActions.map(action => ({
        characterName: action.characterName,
        chosenOption: action.chosenOption,
      })),
    };
    this.client.submitTurn(
        request,
        (error, _): void => {
          if (error) {
            throw new Error(`Failed to submit turn via gRPC: ${error}`);
          }
        });
  }

  close(): void {
    if (this.client) {
      grpc.closeClient(this.client as any);
    }
  }
} 