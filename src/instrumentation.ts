import {GameService, getGameServiceInstance} from "@/services/game.service";


export async function register() {
    console.log('Initializing instrumentation with change stream...');
    const gameService: GameService = getGameServiceInstance()
    await gameService.initGamesUpdates()
    console.log('Game change stream started successfully');

    gameService.getGamesUpdates()
        .catch(error => {
            console.error(error)
            gameService.stopGamesUpdates()
        })

    // Register shutdown handlers
    process.on('SIGTERM', () => gameService.stopGamesUpdates());
    process.on('SIGINT', () => gameService.stopGamesUpdates());

    // Log initialization success
    console.log('✅ Instrumentation initialized successfully');
    console.log('🔄 Change stream is active and ready to broadcast updates');
}