import {Collection} from 'mongodb';
import {Game, GameId} from '@/types/rest/api.alias.types';
import {GameDocument, MongodbClient} from "@/database/mongodb.client";
import {GameRepository} from "@/database/repository/game.repository";

export class GameMongoDbRepository implements GameRepository {
  private readonly dbClient: MongodbClient;
  private readonly collectionName: string;

  constructor(dbClient: MongodbClient, collectionName: string = 'games') {
    this.dbClient = dbClient;
    this.collectionName = collectionName;
  }

  async getGame(gameId: string): Promise<Game | null> {
    const gamesCollection: Collection<GameDocument> = await this.dbClient.getCollection<GameDocument>(this.collectionName);
    if (!gamesCollection) {
      throw new Error('Game collection not initialized');
    }
    try {
      return await gamesCollection.findOne({ gameId });
    } catch (error) {
      console.error(`Error retrieving game with ID ${gameId}:`, error);
      throw error;
    }
  }

  async createGame(game: Game): Promise<GameId> {
    const gamesCollection: Collection<GameDocument> = await this.dbClient.getCollection<GameDocument>(this.collectionName);
    if (!gamesCollection) {
      throw new Error('Game collection not initialized');
    }
    try {
      await gamesCollection.insertOne(game as GameDocument);
      return { gameId: game.gameId };
    } catch (error) {
      console.error(`Error creating game with ID ${game.gameId}:`, error);
      throw error;
    }
  }

  async updateGame(gameId: string, game: Game): Promise<boolean> {
    const gamesCollection: Collection<GameDocument> = await this.dbClient.getCollection<GameDocument>(this.collectionName);
    if (!gamesCollection) {
      throw new Error('Game collection not initialized');
    }
    try {
      const result = await gamesCollection.replaceOne({ gameId }, game as GameDocument);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error(`Error updating game with ID ${gameId}:`, error);
      throw error;
    }
  }
}