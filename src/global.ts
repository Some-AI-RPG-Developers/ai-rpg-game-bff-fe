import {SSEBroadcaster, SSEBroadcasterImpl} from "@/server/sse/sse.broadcaster";
import {GameRepository} from "@/server/database/repository/game.repository";
import {GameChangeStream} from "@/server/database/stream/game.stream";
import {GameService} from "@/server/services/game.service";
import {GameMongodbChangeStream} from "@/server/database/stream/game.mongodb.stream";
import {MongodbClient} from "@/server/database/mongodb.client";
import {GameMongoDbRepository} from "@/server/database/repository/game.mongodb.repository";
import {GRPCGameClient, GRPCClientConfig, GRPCGameClientImpl} from "@/server/grpc/game.grpc.client";

const SERVICE_REGISTRY_SYMBOL = Symbol.for('app.service.registry');

interface ServiceRegistry {
    sseBroadcaster: SSEBroadcaster;
    mongoDbClient: MongodbClient;
    gameRepositoryInstance: GameRepository;
    gameChangeStreamInstance: GameChangeStream;
    grpcGameClient: GRPCGameClient;
    gameService: GameService;
}

function getServiceRegistry(): ServiceRegistry {
    const globalScope = globalThis as Record<symbol, ServiceRegistry>;
    globalScope[SERVICE_REGISTRY_SYMBOL] ??= {} as ServiceRegistry;
    return globalScope[SERVICE_REGISTRY_SYMBOL];
}

export function getSSEBroadcasterInstance(): SSEBroadcaster {
    const serviceRegistry: ServiceRegistry = getServiceRegistry();
    serviceRegistry.sseBroadcaster ??= new SSEBroadcasterImpl()
    return serviceRegistry.sseBroadcaster;
}

export function getMongoDbClientInstance(): MongodbClient {
    const serviceRegistry: ServiceRegistry = getServiceRegistry();
    serviceRegistry.mongoDbClient ??= new MongodbClient(
        process.env.MONGODB_URI,
        process.env.MONGODB_DATABASE);
    return serviceRegistry.mongoDbClient;
}

export function getMongodbGameRepositoryInstance(): GameRepository {
    const serviceRegistry: ServiceRegistry = getServiceRegistry();
    serviceRegistry.gameRepositoryInstance ??= new GameMongoDbRepository(
        getMongoDbClientInstance(),
        process.env.GAMES_COLLECTION);
    return serviceRegistry.gameRepositoryInstance;
}

export function getMongodbGameChangeStreamInstance(): GameChangeStream {
    const serviceRegistry: ServiceRegistry = getServiceRegistry();
    serviceRegistry.gameChangeStreamInstance ??= new GameMongodbChangeStream(
        getMongoDbClientInstance(),
        process.env.GAMES_COLLECTION);
    return serviceRegistry.gameChangeStreamInstance;
}

export function getGrpcGameClientInstance(): GRPCGameClient {
    const serviceRegistry: ServiceRegistry = getServiceRegistry();
    const config: GRPCClientConfig = {
        serverAddress: process.env.GRPC_GAME_MANAGER_HOST ?? 'localhost',
        serverPort: parseInt(process.env.GRPC_GAME_MANAGER_PORT ?? '50051'),
        useSSL: process.env.GRPC_USE_SSL === 'true',
        timeout: parseInt(process.env.GRPC_TIMEOUT ?? '30000'),
    };
    serviceRegistry.grpcGameClient ??= new GRPCGameClientImpl(config);
    return serviceRegistry.grpcGameClient;
}

export function getGameServiceInstance(): GameService {
    const serviceRegistry: ServiceRegistry = getServiceRegistry();
    serviceRegistry.gameService ??= new GameService(
        getMongodbGameRepositoryInstance(),
        getMongodbGameChangeStreamInstance(),
        getSSEBroadcasterInstance(),
        getGrpcGameClientInstance()
    );
    return serviceRegistry.gameService
}