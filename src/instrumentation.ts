import {GameService} from "@/server/services/game.service";
import {getGameServiceInstance, getMongoDbClientInstance, getSSEBroadcasterInstance} from "@/global";

export async function register() {
    const gameService: GameService = getGameServiceInstance()
    await gameService.initGamesUpdates()

    gameService.getGamesUpdates()
        .then(() => stopApplication())
        .catch(error => stopApplication(error));

    // Register shutdown handlers
    process.on('SIGTERM', async () => stopApplication('SIGTERM'));
    process.on('SIGINT', async () => stopApplication('SIGINT'));

    // Log initialization success
    console.info('🔄 Change stream is active and ready to broadcast updates');
    console.info('✅ Application initialized successfully');
}

async function stopApplication(reason?: string, error?: Error): Promise<void> {
    if(!reason && !error) {
        console.info(`Stopping application.`)
    }
    if(reason) {
        console.error(`Stopping application, reason: ${reason}.`)
    }
    if(error) {
        console.error(`Stopping application, error: ${error.message}.`)
        console.error(error)
    }
    await getGameServiceInstance().stopGamesUpdates()
    await getMongoDbClientInstance().close()
    getSSEBroadcasterInstance().removeAllClientsSubscriptions();
    process.exit(1)
}