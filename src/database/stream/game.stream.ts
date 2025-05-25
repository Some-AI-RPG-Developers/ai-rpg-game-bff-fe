import {GameMongodbChangeStream} from "@/database/stream/game.mongodb.stream";
import {getMongoDbClientInstance} from "@/database/database.client";
import {ChangeStreamConfig, ChangeStreamDocument} from "@/database/mongodb.client";
import {Game} from "@/types/api-alias";


export interface GameChangeStream {
    isWatching(): boolean;
    getResumeToken(): string | undefined;
    initChangeStream(config?: ChangeStreamConfig): Promise<void>;
    getGamesChangeEvents(config?: ChangeStreamConfig): AsyncGenerator<ChangeStreamDocument<Game>>;
    closeChangeStream(): Promise<void>
}

let gameChangeStreamInstance: GameChangeStream;
export function getMongodbGameChangeStreamInstance(): GameChangeStream {
    if (gameChangeStreamInstance) {
        return gameChangeStreamInstance;
    }
    const mongoDbClient = getMongoDbClientInstance()
    return gameChangeStreamInstance = new GameMongodbChangeStream(mongoDbClient, process.env.GAMES_COLLECTION);
}