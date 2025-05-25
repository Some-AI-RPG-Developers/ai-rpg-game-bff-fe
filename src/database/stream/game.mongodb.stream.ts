import {ChangeStream, ChangeStreamDocument as MongoChangeStreamDocument, Collection} from 'mongodb';
import {Game} from '@/types/api-alias';
import {ChangeStreamConfig, ChangeStreamDocument, GameDocument, MongodbClient} from '@/database/mongodb.client';
import {GameChangeStream} from "@/database/stream/game.stream";

export class GameMongodbChangeStream implements GameChangeStream{
  private readonly dbClient: MongodbClient;
  private readonly collectionName: string;
  private changeStream: ChangeStream<Game>| null = null;
  private watching: boolean = false;

  public constructor(dbClient: MongodbClient, collectionName: string = 'games') {
    this.dbClient = dbClient;
    this.collectionName = collectionName;
  }

  public isWatching(): boolean {
    return this.watching
  }

  public getResumeToken(): string | undefined {
    return this.changeStream?.resumeToken as string
  }

  public async *getGamesChangeEvents(config: ChangeStreamConfig = {}): AsyncGenerator<ChangeStreamDocument<Game>> {
    if (!this.watching) {
      await this.initChangeStream(config)
    }
    if(!this.changeStream) {
      throw new Error("Change stream is not initialized!")
    }
    try {
      for await (const changeEvent of this.changeStream) {
        const fullDocument: Game = this.getFullDocument(changeEvent)
        const fullDocumentBeforeChange: Game | undefined = this.getFullDocumentBeforeChange(changeEvent)
        yield {
          resumeToken: changeEvent._id as string,
          operationType: changeEvent.operationType,
          fullDocument: fullDocument,
          ...(fullDocumentBeforeChange && {fullDocumentBeforeChange: fullDocumentBeforeChange }),
        };
      }
    } finally {
      await this.closeChangeStream();
    }
  }

  public async initChangeStream(config: ChangeStreamConfig = {}): Promise<void> {
    if (this.watching) {
      console.log('Change stream is already watching');
      return;
    }
    const gamesCollection: Collection<GameDocument> = await this.dbClient.getCollection<GameDocument>(this.collectionName);
    if (!gamesCollection) {
      throw new Error('Game collection not initialized');
    }
    console.log('Starting MongoDB change stream for games collection...');
    try {
      // Default pipeline to watch for insert, update, replace, and delete operations
      const defaultPipeline = [
        {
          $match: {
            operationType: { $in: ['insert', 'update', 'replace'] }
          }
        },
      ];
      const pipeline = config.pipeline ?? defaultPipeline;
      const options = {
        fullDocument: config.fullDocument ?? 'updateLookup' as const,
        ...(config.resumeAfter && { resumeAfter: config.resumeAfter }),
        ...(config.startAfter && { startAfter: config.startAfter })
      };
      this.changeStream = gamesCollection.watch(pipeline, options);
      // Handle errors
      this.changeStream.on('error', (error: Error) => {
        console.error('Change stream error:', error);
        this.handleError(error);
      });
      // Handle stream close
      this.changeStream.on('close', () => {
        console.log('Change stream closed');
        this.watching = false;
      });
      this.watching = true;
      console.log('MongoDB change stream started successfully for games collection!');
    } catch (error) {
      console.error('Failed to start change stream:', error);
      this.watching = false;
      throw error;
    }
  }

  public async closeChangeStream(): Promise<void> {
    console.log('Stopping MongoDB change stream for games collection...');
    if (this.changeStream) {
      try {
        await this.changeStream.close();
        this.changeStream = null;
        this.watching = false;
        console.log('Change stream stopped');
      } catch (error) {
        console.error('Error stopping change stream:', error);
      }
    }
  }

  private async handleError(error: Error): Promise<void> {
    console.error('MongoDB change stream error occurred:', error);
    if (error.message.includes('resumable')) {
      console.log('Attempting to restart MongoDB change stream...');
      await this.restartChangeStream();
    } else {
      console.error('Non-resumable error, stopping MongoDB change stream');
      await this.closeChangeStream();
    }
  }

  private async restartChangeStream(): Promise<void> {
    if (this.changeStream) {
      try {
        const resumeToken: string = this.changeStream.resumeToken as string;
        await this.closeChangeStream();
        await this.initChangeStream({ resumeAfter: resumeToken });
      } catch (error) {
        console.error('Failed to restart change stream:', error);
      }
    }
  }

  private getFullDocument(changeEvent: MongoChangeStreamDocument<Game>): Game {
    switch (changeEvent.operationType) {
      case "insert":
      case "update":
      case "replace":
        if (!changeEvent.fullDocument) {
          throw new Error(`Missing updated document from change event: ${changeEvent._id}`)
        }
        return changeEvent.fullDocument;
      default:
        throw new Error(`Unsupported operation type for change event: ${changeEvent._id}`)
    }
  }

  private getFullDocumentBeforeChange(changeEvent: MongoChangeStreamDocument<Game>): Game | undefined{
    switch (changeEvent.operationType) {
      case "insert":
        return undefined
      case "update":
      case "replace":
        if (!changeEvent.fullDocumentBeforeChange) {
          throw new Error(`Missing document before update from change event: ${changeEvent._id}`)
        }
        return changeEvent.fullDocumentBeforeChange;
      default:
        throw new Error(`Unsupported operation type for change event: ${changeEvent._id}`)
    }
  }
} 