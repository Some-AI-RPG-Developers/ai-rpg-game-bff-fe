import {DatabaseType, getMongoDbClient} from "@/database/database.client";
import {GameMongoDbRepository} from "@/database/repository/game.mongodb.repository";
import {Game} from "@/types/api-alias";

export interface GameRepository {

    init(): Promise<void>;
    getGame(gameId: string): Promise<Game | null>;
}

let gameRepositoryInstance: GameRepository | null = null;
export const getGameRepository = (dbType: DatabaseType): GameRepository => {
    if (gameRepositoryInstance) {
        return gameRepositoryInstance;
    }
    switch (dbType) {
        case DatabaseType.MONGODB: {
            const mongoDbClient = getMongoDbClient()
            return gameRepositoryInstance = new GameMongoDbRepository(mongoDbClient, process.env.GAMES_COLLECTION);
        }
        default:
            throw new Error(`DB client not handled ${dbType}.`)
    }
};