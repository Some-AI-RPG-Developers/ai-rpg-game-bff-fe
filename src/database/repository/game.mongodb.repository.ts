import {Collection} from 'mongodb';
import {Game} from '@/types/api-alias';
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
}