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
      bg: 'bg-gradient-to-br from-gray-900 to-black',
      card: 'bg-gray-800/90 backdrop-blur-md shadow-2xl',
      text: 'text-gray-100',
      border: 'border-gray-700',
      accent: 'bg-purple-600 hover:bg-purple-700',
      secondary: 'bg-pink-600 hover:bg-pink-700'
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