// Theme Styles - Updated with Fantasy Theme
export const getThemeStyles = (theme: string) => {
  const themes = {
    light: {
      bg: 'magical-scroll-background',
      card: 'magical-scroll backdrop-blur-md shadow-xl border border-amber-300 fantasy-card',
      text: 'text-amber-900 spell-text',
      border: 'border-amber-300',
      accent: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 fantasy-button',
      secondary: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700'
    },
    dark: {
      bg: 'dark-fantasy-bg',
      card: 'dark-fantasy-card dark-fantasy-glow',
      text: 'dark-fantasy-text',
      border: 'dark-fantasy-border',
      accent: 'dark-fantasy-button-primary dark-fantasy-glitch',
      secondary: 'dark-fantasy-button-secondary dark-fantasy-pulse'
    },
    matrix: {
      bg: 'bg-black',
      card: 'bg-black backdrop-blur-md shadow-2xl border border-green-500/50',
      text: 'text-green-400',
      border: 'border-green-500/50',
      accent: 'bg-green-600 hover:bg-green-700',
      secondary: 'bg-green-800 hover:bg-green-900'
    },
    performance: {
      bg: 'performance-bg',
      card: 'performance-card',
      text: 'performance-text',
      border: 'performance-border',
      accent: 'performance-button bg-gray-700 hover:bg-gray-600',
      secondary: 'performance-button bg-gray-600 hover:bg-gray-500',
      header: 'performance-header',
      gameSection: 'performance-game-section',
      characterSection: 'performance-character-section',
      sceneSection: 'performance-scene-section',
      actionSection: 'performance-action-section',
      input: 'performance-input',
      character: 'performance-character',
      characterName: 'performance-character-name',
      characterStats: 'performance-character-stats',
      scene: 'performance-scene',
      sceneDescription: 'performance-scene-description',
      sceneConclusion: 'performance-scene-conclusion',
      turn: 'performance-turn',
      turnDescription: 'performance-turn-description',
      turnConclusion: 'performance-turn-conclusion',
      optionSelect: 'performance-option-select',
      synopsis: 'performance-synopsis',
      gameConclusion: 'performance-game-conclusion',
      statusIndicator: 'performance-status-indicator',
      formGroup: 'performance-form-group',
      textarea: 'performance-textarea',
      select: 'performance-select',
      debugModal: 'performance-debug-modal',
      debugSection: 'performance-debug-section',
      ttsControls: 'performance-tts-controls',
      ttsButton: 'performance-tts-button',
      footer: 'performance-footer',
      navItem: 'performance-nav-item'
    }
  };
  return themes[theme as keyof typeof themes] || themes.performance;
};