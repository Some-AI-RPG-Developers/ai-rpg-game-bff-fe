import {Game, GameId} from "@/server/types/rest/api.alias.types";

export interface GameRepository {
    getGame(gameId: string): Promise<Game | null>;
    createGame(game: Game): Promise<GameId>;
    updateGame(gameId: string, game: Game): Promise<boolean>;
}
