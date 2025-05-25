import {GameService, getGameServiceInstance} from "@/services/game.service";
import {DatabaseClient, getMongoDbClientInstance} from "@/database/database.client";


export async function register() {
    const dbClient: DatabaseClient = getMongoDbClientInstance()
    const gameService: GameService = getGameServiceInstance()
    await gameService.initGamesUpdates()

    gameService.getGamesUpdates()
        .then(() => stopApplication(dbClient, gameService))
        .catch(error => stopApplication(dbClient, gameService, error));

    // Register shutdown handlers
    process.on('SIGTERM', async () => stopApplication(dbClient, gameService, 'SIGTERM'));
    process.on('SIGINT', () => stopApplication(dbClient, gameService, 'SIGINT'));

    // Log initialization success
    console.log('🔄 Change stream is active and ready to broadcast updates');
    console.log('✅ Application initialized successfully');
}

async function stopApplication(
    dbClient: DatabaseClient,
    gameService: GameService,
    reason?: string,
    error?: Error): Promise<void> {

    if(!reason && !error) {
        console.log(`Stopping application.`)
    }
    if(reason) {
        console.error(`Stopping application, reason: ${reason}`)
    }
    if(error) {
        console.error(`Stopping application, error: ${error.message}`)
        console.error(error)
    }
    await gameService.stopGamesUpdates()
    await dbClient.close()
}