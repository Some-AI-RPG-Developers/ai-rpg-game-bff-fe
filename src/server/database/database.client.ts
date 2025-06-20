export interface DatabaseClient {

    connect(): Promise<void>;
    isConnected(): boolean;
    close(): Promise<void>;
}
