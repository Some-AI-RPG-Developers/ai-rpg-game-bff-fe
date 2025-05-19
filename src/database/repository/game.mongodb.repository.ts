import {Collection} from 'mongodb';
import {Game} from '@/types/api-alias';
import {MongodbClient} from "@/database/mongodb.client";
import {GameRepository} from "@/database/repository/game.repository";

export class GameMongoDbRepository implements GameRepository {
  private gamesCollection: Collection<Game> | null = null;
  private readonly collectionName: string;
  private readonly dbClient: MongodbClient;

  constructor(dbClient: MongodbClient, collectionName: string = 'games') {
    this.dbClient = dbClient;
    this.collectionName = collectionName;
  }

  async init(): Promise<void> {
    if (this.gamesCollection) {
      return;
    }
    try {
      if (!this.dbClient.isConnected()) {
        await this.dbClient.connect();
      }
      const db = this.dbClient.getDatabase();
      this.gamesCollection = db.collection<Game>(this.collectionName);
      console.log(`Game collection '${this.collectionName}' initialized`);
    } catch (error) {
      console.error(`Failed to initialize game collection '${this.collectionName}'`, error);
      throw error;
    }
  }

  async getGame(gameId: string): Promise<Game | null> {
    if (!this.gamesCollection) {
      await this.init();
    }
    if (!this.gamesCollection) {
      throw new Error('Game collection not initialized');
    }
    try {
      return await this.gamesCollection.findOne({ gameId });
    } catch (error) {
      console.error(`Error retrieving game with ID ${gameId}:`, error);
      throw error;
    }
  }
}