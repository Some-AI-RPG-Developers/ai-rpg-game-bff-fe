import {getMongoDbClientInstance} from "@/database/database.client";
import {GameMongoDbRepository} from "@/database/repository/game.mongodb.repository";
import {Game} from "@/types/api-alias";

export interface GameRepository {
    getGame(gameId: string): Promise<Game | null>;
}

let gameRepositoryInstance: GameRepository;
export function getMongodbGameRepository(): GameRepository {
    if (gameRepositoryInstance) {
        return gameRepositoryInstance;
    }
    const mongoDbClient = getMongoDbClientInstance()
    return gameRepositoryInstance = new GameMongoDbRepository(mongoDbClient, process.env.GAMES_COLLECTION);
}