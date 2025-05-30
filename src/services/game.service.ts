import {v4 as uuid} from 'uuid';
import {Game, GameId, NewGame, NewTurn} from '@/types/api.alias.types';
import {GameRepository} from "@/database/repository/game.repository";
import {GameChangeStream} from "@/database/stream/game.stream";
import {SSEBroadcaster} from "@/sse/sse.broadcaster";
import {GRPCGameClient} from "@/grpc/game.grpc.client";

export class GameService {
  private readonly gameRepository: GameRepository
  private readonly gameChangeStream: GameChangeStream
  private readonly sseBroadcaster: SSEBroadcaster
  private readonly grpcClient: GRPCGameClient

  constructor(
      gameRepository: GameRepository,
      gameChangeStream: GameChangeStream,
      sseBroadcaster: SSEBroadcaster,
      grpcClient: GRPCGameClient) {
    this.gameRepository = gameRepository;
    this.gameChangeStream = gameChangeStream;
    this.sseBroadcaster = sseBroadcaster;
    this.grpcClient = grpcClient;
  }

  async createGame(newGame: NewGame): Promise<GameId> {
    try {
      const gameId = uuid();
      await this.grpcClient.createGame(gameId, newGame);
      return {
        gameId: gameId
      };
    } catch (error) {
      console.error('Failed to create game via gRPC:', error);
      throw new Error('Failed to create game in game manager service');
    }
  }

  async getGame(gameId: string): Promise<Game | null> {
      return this.gameRepository.getGame(gameId);
  }

  async startGame(gameId: string): Promise<void> {
    const game = await this.gameRepository.getGame(gameId);
    if (!game) {
      throw new Error(`Game with id ${gameId} not found`);
    }
    try {
      await this.grpcClient.startGame(gameId);
    } catch (error) {
      console.error('Failed to start game via gRPC:', error);
      throw new Error('Failed to start game in game manager service');
    }
  }

  async submitTurn(gameId: string, newTurn: NewTurn): Promise<void> {
    const game = await this.gameRepository.getGame(gameId);
    if (!game) {
      throw new Error(`Game with id ${gameId} not found`);
    }
    try {
      await this.grpcClient.submitTurn(gameId, newTurn);
    } catch (error) {
      console.error('Failed to submit turn via gRPC:', error);
      throw new Error('Failed to submit turn to game manager service');
    }
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
  }
}
