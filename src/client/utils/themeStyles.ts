// Theme Styles
export const getThemeStyles = (theme: string) => {
  const themes = {
    light: {
      bg: 'bg-gradient-to-br from-blue-50 to-purple-50',
      card: 'bg-white/90 backdrop-blur-md shadow-xl',
      text: 'text-gray-800',
      border: 'border-gray-200',
      accent: 'bg-blue-500 hover:bg-blue-600',
      secondary: 'bg-purple-500 hover:bg-purple-600'
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