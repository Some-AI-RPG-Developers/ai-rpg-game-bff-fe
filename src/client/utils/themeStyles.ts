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
    }
  };
  return themes[theme as keyof typeof themes] || themes.matrix;
};