import React, { useState } from 'react';
import {GameConclusion} from "@/client/components/game/GameConclusion";
import {GameDisplay} from "@/client/components/game/play/GameDisplay";
import {CreateGameForm} from "@/client/components/game/setup/CreateGameForm";
import {ResumeGameForm} from "@/client/components/game/setup/ResumeGameForm";
import {WelcomeScreen} from "@/client/components/game/setup/WelcomeScreen";
import {GameStatusIndicator} from "@/client/components/game/GameStatusIndicator";
import {GameHeader} from "@/client/components/game/GameHeader";
import {GameActionButtons} from "@/client/components/game/GameActionButtons";
import {GameDebugModal} from "@/client/components/ui/GameDebugModal";
import {ViewMode} from "@/client/types/ui.types";
import {useGameContext} from "@/client/context/GameContext";
import {useTheme} from "@/client/context/ThemeContext";
import {getThemeStyles} from "@/client/utils/themeStyles";
import {MatrixRain} from "@/client/components/ui/MatrixRain";

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
    // Debug modal state
    const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);

    // Use the centralized game context for all state and operations
    const {
        // Theme
        theme
    } = useTheme();
    const styles = getThemeStyles(theme);
    
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

    // Handle debug modal toggle
    const handleToggleDebug = () => {
        setIsDebugModalOpen(!isDebugModalOpen);
    };

    return (
        <div className={`min-h-screen ${styles.bg} relative`}>
            {theme === 'matrix' && <MatrixRain />}
            
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <GameHeader 
                    game={game} 
                    gameId={gameId} 
                    error={error}
                    gameStatus={gameStatus}
                    onToggleDebug={handleToggleDebug}
                    isDebugOpen={isDebugModalOpen}
                />

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8 flex-1">

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

                    <GameActionButtons
                        game={game}
                        gameStatus={gameStatus}
                        allCharactersMadeChoice={allCharactersMadeChoice}
                        isProcessing={isProcessing}
                        onSubmitTurn={submitTurn}
                        onStartGame={startGame}
                        onStartNextTurn={startNextTurn}
                    />

                    <GameConclusion game={game} />

                    <GameStatusIndicator
                        gameStatus={gameStatus}
                        gameId={gameId}
                        error={error}
                    />
                </>
            )}
                </main>

                {/* Footer */}
                <footer className={`${theme !== 'matrix' ? styles.card + ' ' + styles.border : ''} border-t`}
                        style={{
                          backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.7)' : undefined,
                          borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.3)' : undefined,
                          backdropFilter: theme === 'matrix' ? 'blur(5px)' : undefined
                        }}>
                    <div className="container mx-auto px-4 py-6">
                        <p className={`text-center ${theme !== 'matrix' ? styles.text : ''}`}
                           style={{
                             color: theme === 'matrix' ? '#00ff41' : undefined,
                             opacity: theme === 'matrix' ? 0.8 : 0.7
                           }}>
                            © 2025 AI RPG Adventure - Powered by Advanced AI
                        </p>
                    </div>
                </footer>
            </div>

            {/* Debug Modal */}
            <GameDebugModal
                isOpen={isDebugModalOpen}
                onClose={() => setIsDebugModalOpen(false)}
                game={game}
                gameStatus={gameStatus}
            />
        </div>
    );
}