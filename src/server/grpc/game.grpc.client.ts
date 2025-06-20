import * as grpc from '@grpc/grpc-js';
import * as retry from 'retry';
import {NewGame, NewTurn} from '@/server/types/rest/api.alias.types';
import {GameServiceClient} from '@/server/types/proto/game_service';
import {RetryOperation} from "retry";

export interface GRPCClientConfig {
  serverAddress: string;
  serverPort: number;
  useSSL?: boolean;
  timeout?: number;
  maxRetries?: number;
  retryDelayMs?: number;
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

  async createGame(gameId: string, newGame: NewGame): Promise<void> {
    const request = {
      gameId: gameId,
      gamePrompt: newGame.gamePrompt,
      maxScenesNumber: newGame.maxScenesNumber,
      characters: newGame.characters.map(character => ({
        name: character.name,
        characterPrompt: character.characterPrompt,
      })),
    };
    return this.retryGrpcCall(
      'Create game',
      callback  => this.client.createGame(request, callback)
    );
  }

  async startGame(gameId: string): Promise<void> {
    const request = {
      gameId: gameId,
    };
    return this.retryGrpcCall(
        'Start game',
        callback => this.client.startGame(request, callback)
    );
  }

  async submitTurn(gameId: string, newTurn: NewTurn): Promise<void> {
    const request = {
      gameId: gameId,
      characterActions: newTurn.characterActions.map(action => ({
        characterName: action.characterName,
        chosenOption: action.chosenOption,
      })),
    };
    return this.retryGrpcCall(
      'Submit turn',
      callback => this.client.submitTurn(request, callback)
    );
  }

  close(): void {
    if (this.client) {
      grpc.closeClient(this.client);
    }
  }

  private createClient(): GameServiceClient {
    const serverAddress = `${this.config.serverAddress}:${this.config.serverPort}`;
    const credentials = this.config.useSSL
        ? grpc.credentials.createSsl()
        : grpc.credentials.createInsecure();
    return new GameServiceClient(serverAddress, credentials);
  }

  private async retryGrpcCall(
      operationName: string,
      grpcOperation: (callback: (error: grpc.ServiceError | null) => void) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const operation: RetryOperation = retry.operation({
        retries: this.config.maxRetries ?? 3,
        factor: 2,
        minTimeout: this.config.retryDelayMs ?? 1000,
        maxTimeout: 30000,
        randomize: true,
      });
      operation.attempt((currentAttempt: number) => {
        grpcOperation((error: grpc.ServiceError | null) => {
          if (!error) {
            resolve();
            return;
          }
          const errorMessage = String(error);
          const isConnectionError = errorMessage.includes('UNAVAILABLE')
              || errorMessage.includes('ECONNRESET')
              || errorMessage.includes('ECONNREFUSED');

          if (isConnectionError && operation.retry(new Error(errorMessage))) {
            console.warn(`${operationName} failed (attempt ${currentAttempt}), retrying...`);
            return;
          }
          reject(operation.mainError() || new Error(`${operationName} failed: ${errorMessage}`));
        });
      });
    });
  }
}
