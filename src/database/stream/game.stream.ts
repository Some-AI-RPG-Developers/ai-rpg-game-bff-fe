import {ChangeStreamConfig, ChangeStreamDocument} from "@/database/mongodb.client";
import {Game} from "@/types/rest/api.alias.types";
import {ResumeToken} from "mongodb";

export interface GameChangeStream {
    isWatching(): boolean;
    getResumeToken(): ResumeToken | undefined;
    initChangeStream(config?: ChangeStreamConfig): Promise<void>;
    getGamesChangeEvents(config?: ChangeStreamConfig): AsyncGenerator<ChangeStreamDocument<Game>>;
    closeChangeStream(isFatal?: boolean): Promise<void>
}