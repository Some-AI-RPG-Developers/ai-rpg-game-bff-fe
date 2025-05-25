import {Game} from "@/types/api-alias";

export interface GameUpdateEvent {
    type: 'GAME_UPDATE' | 'GAME_DELETE' | 'GAME_INSERT';
    gameId: string;
    data: Game;
    timestamp: Date;
}