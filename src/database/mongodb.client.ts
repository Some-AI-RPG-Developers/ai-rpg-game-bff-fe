import {Collection, Db, MongoClient, ResumeToken, ServerApiVersion} from 'mongodb';
import {DatabaseClient} from "@/database/database.client";
import {Game} from "@/types/rest/api.alias.types";

export type GameDocument = Game & Document

export interface ChangeStreamConfig {
  pipeline?: Document[];
  fullDocument?: 'default' | 'updateLookup' | 'whenAvailable' | 'required';
  fullDocumentBeforeChange?: 'whenAvailable' | 'required' | 'off';
  resumeAfter?: ResumeToken;
  startAfter?: ResumeToken;
}

export interface ChangeStreamDocument<T> {
  resumeToken: ResumeToken
  operationType: string
  fullDocument: T
  fullDocumentBeforeChange?: T
}

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
        },
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        retryWrites: true,
        writeConcern: {
          w: "majority"
        }
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.connected = true;
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
      await this.close()
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected && this.client !== undefined;
  }

  async getDatabase(): Promise<Db | null> {
    if (!this.db) {
      await this.connect();
    }
    return this.db;
  }

  async getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
    if (!this.client || !this.connected) {
      await this.connect();
    }
    const database: Db | null = await this.getDatabase();
    if (!database) {
      throw Error("Database is not connected!")
    }
    const collection: Collection<T> = database.collection<T>(collectionName);
    console.log(`Game collection '${collectionName}' initialized.`);
    return collection;
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