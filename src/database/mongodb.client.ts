import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import {DatabaseClient} from "@/database/database.client";

export class MongodbClient implements DatabaseClient {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly uri: string;
  private readonly dbName: string;
  private connected: boolean = false;

  constructor(connectionString: string = 'mongodb://localhost:27017', dbName: string = 'ai-rpg') {
    this.uri = connectionString;
    this.dbName = dbName;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }
    try {
      this.client = new MongoClient(this.uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.connected = true;
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.connected = false;
      console.log('MongoDB connection closed');
    }
  }
}