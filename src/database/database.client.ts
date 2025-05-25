import {MongodbClient} from "@/database/mongodb.client";

export interface DatabaseClient {

    connect(): Promise<void>;
    isConnected(): boolean;
    close(): Promise<void>;
}

let mongoDbClient: MongodbClient;
export const getMongoDbClientInstance = (): MongodbClient => {
    if (mongoDbClient) {
        return mongoDbClient;
    }
    return mongoDbClient = new MongodbClient(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
};