// Theme Styles - Updated with Fantasy Theme
export const getThemeStyles = (theme: string) => {
  const themes = {
    light: {
      bg: 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50',
      card: 'bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-md shadow-xl border border-purple-200 fantasy-card',
      text: 'text-emerald-800',
      border: 'border-purple-200',
      accent: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 fantasy-button',
      secondary: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
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