import {GameConclusion} from "@/client/components/game/GameConclusion";
import {GameDebugViewer} from "@/client/components/game/GameDebugViewer";
import {GameDisplay} from "@/client/components/game/play/GameDisplay";
import {CreateGameForm} from "@/client/components/game/setup/CreateGameForm";
import {ResumeGameForm} from "@/client/components/game/setup/ResumeGameForm";
import {WelcomeScreen} from "@/client/components/game/setup/WelcomeScreen";
import {GameStatusIndicator} from "@/client/components/game/GameStatusIndicator";
import {GameActionButtons} from "@/client/components/game/GameActionButtons";
import {GameHeader} from "@/client/components/game/GameHeader";
import {ViewMode} from "@/client/types/ui.types";
import {useGameContext} from "@/client/context/GameContext";

/**
 * Main Play Page Component
 *
 * - **12 focused UI components** (added GameActionButtons)
 * - **Centralized GameContext** for state management
 * - **Service layer** for all API and SSE operations
 * - **Custom hooks** for business logic
 *
 * The refactored architecture provides:
 * ✅ Clean separation of concerns
 * ✅ Testable components in isolation
 * ✅ Reusable business logic hooks
 * ✅ Centralized service layer
 * ✅ Type-safe context system
 * ✅ Maintainable codebase
 * ✅ Centralized button positioning
 */
export default function PlayPage() {
    // Use the centralized game context for all state and operations
    const {
        // Game state
        game,
        gameId,
        error,
        gameStatus,
        viewMode,

        // Processing indicators
        isProcessing,
        isWaitingForSSEResponse,

        // Form state
        gamePromptInput,
        maxScenesInput,
        charactersInput,
        resumeGameIdInput,

        // Character actions state
        selectedOptions,
        freeTextInputs,
        allCharactersMadeChoice,

        // Game operations
        createGame,
        loadGameById,
        startGame,
        submitTurn,
        startNextTurn,

        // Form operations
        setGamePromptInput,
        setMaxScenesInput,
        handleCharacterInputChange,
        handleAddCharacterInput,
        handleRemoveCharacterInput,
        setResumeGameIdInput,

        // Character action operations
        handleOptionChange,
        handleFreeTextChange,

        // UI operations
        setViewMode,
        clearError
    } = useGameContext();

    // Handle view mode changes
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
    };

    // Handle error clearing
    const handleErrorClear = () => {
        clearError();
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <GameHeader game={game} gameId={gameId} error={error} />

            {/* Initial choice: Create or Resume (only if no gameId and not processing/waiting) */}
            {viewMode === 'choice' && !gameId && !isProcessing && !isWaitingForSSEResponse && gameStatus === 'idle' && (
                <WelcomeScreen
                    onViewModeChange={handleViewModeChange}
                    isProcessing={isProcessing}
                />
            )}

            {/* Resume Game Form (only if no gameId and not processing/waiting) */}
            {viewMode === 'resume' && !gameId && !isProcessing && !isWaitingForSSEResponse && gameStatus === 'idle' && (
                <ResumeGameForm
                    resumeGameIdInput={resumeGameIdInput}
                    onResumeGameIdChange={setResumeGameIdInput}
                    onLoadGameById={loadGameById}
                    onViewModeChange={handleViewModeChange}
                    onErrorClear={handleErrorClear}
                    isProcessing={isProcessing}
                />
            )}

            {/* Create New Game Form */}
            {viewMode === 'create' && !gameId &&
                gameStatus !== 'creatingGame_WaitingForCharacters' &&
                gameStatus !== 'creatingGame_WaitingForSynopsis' &&
                gameStatus !== 'loadingGame_WaitingForData' &&
                gameStatus !== 'recreatingGame_WaitingForData' &&
                !isWaitingForSSEResponse && (
                    <CreateGameForm
                        gamePromptInput={gamePromptInput}
                        maxScenesInput={maxScenesInput}
                        charactersInput={charactersInput}
                        gameStatus={gameStatus}
                        onGamePromptChange={setGamePromptInput}
                        onMaxScenesChange={setMaxScenesInput}
                        onCharacterInputChange={handleCharacterInputChange}
                        onAddCharacterInput={handleAddCharacterInput}
                        onRemoveCharacterInput={handleRemoveCharacterInput}
                        onCreateGame={createGame}
                        onViewModeChange={handleViewModeChange}
                        onErrorClear={handleErrorClear}
                        isProcessing={isProcessing}
                    />
                )}

            {/* Game Display Area: Shown if game object exists and we are past initial view modes or gameId is set */}
            {game && gameId && (
                <>
                    <GameDisplay
                        game={game}
                        gameStatus={gameStatus}
                        selectedOptions={selectedOptions}
                        freeTextInputs={freeTextInputs}
                        onOptionChange={handleOptionChange}
                        onFreeTextChange={handleFreeTextChange}
                        isProcessing={isProcessing}
                    />

                    <GameConclusion game={game} />

                    {/* Centralized Action Buttons - positioned before status indicator */}
                    <GameActionButtons
                        game={game}
                        gameStatus={gameStatus}
                        onStartGame={startGame}
                        onSubmitTurn={submitTurn}
                        onStartNextTurn={startNextTurn}
                        allCharactersMadeChoice={allCharactersMadeChoice}
                        isProcessing={isProcessing}
                        isWaitingForSSEResponse={isWaitingForSSEResponse}
                    />

                    <GameStatusIndicator
                        gameStatus={gameStatus}
                        gameId={gameId}
                        error={error}
                    />

                    <GameDebugViewer game={game} gameStatus={gameStatus} />
                </>
            )}
        </div>
    );
}