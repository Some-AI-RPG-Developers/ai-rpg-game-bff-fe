import {SSEBroadcaster, SSEBroadcasterImpl} from "@/sse/sse.broadcaster";
import {GameRepository} from "@/database/repository/game.repository";
import {GameChangeStream} from "@/database/stream/game.stream";
import {GameService} from "@/services/game.service";
import {GameMongodbChangeStream} from "@/database/stream/game.mongodb.stream";
import {MongodbClient} from "@/database/mongodb.client";
import {GameMongoDbRepository} from "@/database/repository/game.mongodb.repository";

declare global {
    let sseBroadcaster: SSEBroadcaster;
    let mongoDbClient: MongodbClient;
    let gameRepositoryInstance: GameRepository;
    let gameChangeStreamInstance: GameChangeStream;
    let gameService: GameService;
}

export function getSSEBroadcasterInstance(): SSEBroadcaster {
    if (globalThis.sseBroadcaster) {
        return globalThis.sseBroadcaster
    }
    return globalThis.sseBroadcaster = new SSEBroadcasterImpl();
}

export function getMongoDbClientInstance(): MongodbClient {
    if (globalThis.mongoDbClient) {
        return globalThis.mongoDbClient;
    }
    return globalThis.mongoDbClient = new MongodbClient(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
}

export function getMongodbGameRepositoryInstance(): GameRepository {
    if (globalThis.gameRepositoryInstance) {
        return globalThis.gameRepositoryInstance;
    }
    const mongoDbClient = getMongoDbClientInstance()
    return globalThis.gameRepositoryInstance = new GameMongoDbRepository(mongoDbClient, process.env.GAMES_COLLECTION);
}

export function getMongodbGameChangeStreamInstance(): GameChangeStream {
    if (globalThis.gameChangeStreamInstance) {
        return globalThis.gameChangeStreamInstance;
    }
    const mongoDbClient = getMongoDbClientInstance()
    return globalThis.gameChangeStreamInstance = new GameMongodbChangeStream(mongoDbClient, process.env.GAMES_COLLECTION);
}

export function getGameServiceInstance(): GameService {
    if (globalThis.gameService) {
        return globalThis.gameService
    }
    const gameRepository = getMongodbGameRepositoryInstance();
    const gameChangeStream = getMongodbGameChangeStreamInstance()
    const sseBroadcaster = getSSEBroadcasterInstance()
    return globalThis.gameService = new GameService(gameRepository, gameChangeStream, sseBroadcaster);
}