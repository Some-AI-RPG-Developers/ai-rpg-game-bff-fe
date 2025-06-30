import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { X, Bug, Copy, Check } from 'lucide-react';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';
import { JsonViewer } from '@textea/json-viewer';
import { stringify as yamlStringify } from 'yaml';

// Color scheme for YAML syntax highlighting
const getYamlColors = (theme: string) => ({
  key: '#ff9500', // Orange for keys
  string: '#32d74b', // Green for strings
  number: '#64d2ff', // Light blue for numbers
  boolean: '#ff9500', // Orange for booleans
  null: '#ff453a', // Red for null values
  default: theme === 'matrix' ? '#00ff41' : theme === 'dark' ? '#f3f4f6' : '#374151'
});

// Component to render colorized YAML
interface YamlColorizedViewerProps {
  data: PlayPageGame;
  theme: string;
}

const YamlColorizedViewer: React.FC<YamlColorizedViewerProps> = ({ data, theme }) => {
  const colors = getYamlColors(theme);
  
  const colorizeYamlLine = (line: string): React.ReactNode => {
    // Handle empty lines
    if (!line.trim()) {
      return <>&nbsp;</>;
    }
    
    // Match key-value pairs
    const keyValueMatch = line.match(/^(\s*)([\w-]+):\s*(.*)$/);
    if (keyValueMatch) {
      const [, indent, key, value] = keyValueMatch;
      return (
        <>
          <span style={{ color: colors.default }}>{indent}</span>
          <span style={{ color: colors.key }}>{key}</span>
          <span style={{ color: colors.default }}>: </span>
          {colorizeValue(value, colors)}
        </>
      );
    }
    
    // Match array items with key-value pairs (- key: value)
    const arrayKeyValueMatch = line.match(/^(\s*)-\s*([\w-]+):\s*(.*)$/);
    if (arrayKeyValueMatch) {
      const [, indent, key, value] = arrayKeyValueMatch;
      return (
        <>
          <span style={{ color: colors.default }}>{indent}- </span>
          <span style={{ color: colors.key }}>{key}</span>
          <span style={{ color: colors.default }}>: </span>
          {colorizeValue(value, colors)}
        </>
      );
    }
    
    // Match array items without key-value pairs
    const arrayMatch = line.match(/^(\s*)-\s*(.*)$/);
    if (arrayMatch) {
      const [, indent, value] = arrayMatch;
      return (
        <>
          <span style={{ color: colors.default }}>{indent}- </span>
          {colorizeValue(value, colors)}
        </>
      );
    }
    
    // Match nested keys (keys without values on same line)
    const nestedKeyMatch = line.match(/^(\s*)([\w-]+):\s*$/);
    if (nestedKeyMatch) {
      const [, indent, key] = nestedKeyMatch;
      return (
        <>
          <span style={{ color: colors.default }}>{indent}</span>
          <span style={{ color: colors.key }}>{key}</span>
          <span style={{ color: colors.default }}>:</span>
        </>
      );
    }
    
    // Default case
    return <span style={{ color: colors.default }}>{line}</span>;
  };
  
  const colorizeValue = (value: string, colors: ReturnType<typeof getYamlColors>): React.ReactNode => {
    const trimmedValue = value.trim();
    
    // Check for quoted strings
    if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
      return <span style={{ color: colors.string }}>{value}</span>;
    }
    
    // Check for single quoted strings
    if (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")) {
      return <span style={{ color: colors.string }}>{value}</span>;
    }
    
    // Check for null
    if (trimmedValue === 'null' || trimmedValue === '~') {
      return <span style={{ color: colors.null }}>{value}</span>;
    }
    
    // Check for booleans
    if (trimmedValue === 'true' || trimmedValue === 'false') {
      return <span style={{ color: colors.boolean }}>{value}</span>;
    }
    
    // Check for numbers
    if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
      return <span style={{ color: colors.number }}>{value}</span>;
    }
    
    // Check for unquoted strings (everything else)
    if (trimmedValue && !trimmedValue.includes(':') && !trimmedValue.startsWith('-')) {
      return <span style={{ color: colors.string }}>{value}</span>;
    }
    
    // Default
    return <span style={{ color: colors.default }}>{value}</span>;
  };
  
  const yamlString = yamlStringify(data);
  const lines = yamlString.split('\n');
  
  return (
    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
      {lines.map((line, index) => (
        <div key={index}>
          {colorizeYamlLine(line)}
        </div>
      ))}
    </div>
  );
};

interface GameDebugModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Current game object */
  game: PlayPageGame | null;
  /** Current game status */
  gameStatus: GameStatus;
}

/**
 * GameDebugModal displays the game debug information in a centered modal overlay.
 */
export const GameDebugModal: React.FC<GameDebugModalProps> = ({
  isOpen,
  onClose,
  game
}) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [copiedSSE, setCopiedSSE] = useState(false);
  const [copiedGameId, setCopiedGameId] = useState(false);
  const [debugFormat, setDebugFormat] = useState<'json' | 'yaml'>('json');

  // Copy Game ID to clipboard
  const copyGameId = async () => {
    if (!game?.gameId) return;
    
    try {
      await navigator.clipboard.writeText(game.gameId);
      setCopiedGameId(true);
      setTimeout(() => setCopiedGameId(false), 2000);
    } catch (err) {
      console.error('Failed to copy Game ID:', err);
    }
  };

  // Copy SSE URL to clipboard
  const copySSEUrl = async () => {
    if (!game?.gameId) return;
    
    const sseUrl = `${window.location.origin}/api/v1/games/${game.gameId}/updates`;
    try {
      await navigator.clipboard.writeText(sseUrl);
      setCopiedSSE(true);
      setTimeout(() => setCopiedSSE(false), 2000);
    } catch (err) {
      console.error('Failed to copy SSE URL:', err);
    }
  };

  // Copy debug data to clipboard
  const copyDebugData = async () => {
    if (!game) return;
    
    try {
      let data: string;
      
      if (debugFormat === 'json') {
        data = JSON.stringify(game, null, 2);
      } else {
        data = yamlStringify(game);
      }
      
      await navigator.clipboard.writeText(data);
    } catch (err) {
      console.error('Failed to copy debug data:', err);
    }
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close modal - must be called before any early returns
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  console.log('GameDebugModal render - isOpen:', isOpen, 'game:', !!game);
  
  if (!isOpen) {
    console.log('GameDebugModal: Modal not open, returning null');
    return null;
  }

  console.log('GameDebugModal: Rendering modal with z-index 50');
  
  const modalContent = (
    <div 
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.95)' : '#ffffff',
          border: theme === 'matrix' ? '2px solid rgba(0, 255, 65, 0.5)' : '1px solid #e5e7eb',
          boxShadow: theme === 'matrix' ? '0 0 30px rgba(0, 255, 65, 0.3)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{
            borderColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.3)' : '#e5e7eb',
            backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : '#f9fafb'
          }}
        >
          <div className="flex items-center gap-3">
            <Bug 
              size={24} 
              style={{ color: theme === 'matrix' ? '#00ff41' : '#6b7280' }}
            />
            <h2 
              className={`text-2xl font-bold text-center flex-1 ${theme !== 'matrix' ? styles.text : ''}`}
              style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
            >
              Game Debug Information
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${theme !== 'matrix' ? 'hover:bg-gray-100' : ''}`}
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
              color: theme === 'matrix' ? '#00ff41' : '#6b7280',
              border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div 
          className="overflow-y-auto p-8"
          style={{ 
            maxHeight: 'calc(90vh - 120px)',
            backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.8)' : undefined
          }}
        >
          <div className="flex flex-col items-center space-y-8">
            {/* Game ID Section */}
            <div className="text-center">
              <h3 
                className={`text-xl font-bold mb-4 ${theme !== 'matrix' ? styles.text : ''}`}
                style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
              >
                Game ID
              </h3>
              <div className="flex items-center gap-3">
                <p 
                  className={`text-lg font-mono p-4 rounded-lg ${theme !== 'matrix' ? 'bg-gray-100' : ''}`}
                  style={{ 
                    color: theme === 'matrix' ? '#00ff41' : '#374151',
                    backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                    border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined
                  }}
                >
                  {game?.gameId || 'No game loaded'}
                </p>
                {game?.gameId && (
                  <button
                    onClick={copyGameId}
                    className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${theme !== 'matrix' ? 'hover:bg-gray-200' : ''}`}
                    style={{
                      backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : '#f3f4f6',
                      color: theme === 'matrix' ? '#00ff41' : '#374151',
                      border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : '1px solid #d1d5db'
                    }}
                    title="Copy Game ID"
                  >
                    {copiedGameId ? (
                      <>
                        <Check size={16} />
                        <span className="text-sm font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span className="text-sm font-medium">Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* SSE URL Section */}
            {game?.gameId && (
              <div className="text-center">
                <h3 
                  className={`text-xl font-bold mb-4 ${theme !== 'matrix' ? styles.text : ''}`}
                  style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
                >
                  SSE Subscription URL
                </h3>
                <div className="flex items-center gap-3">
                  <p 
                    className={`text-sm font-mono p-3 rounded-lg ${theme !== 'matrix' ? 'bg-gray-100' : ''}`}
                    style={{ 
                      color: theme === 'matrix' ? '#00ff41' : '#374151',
                      backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                      border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : undefined
                    }}
                  >
                    {`${window.location.origin}/api/v1/games/${game.gameId}/updates`}
                  </p>
                  <button
                    onClick={copySSEUrl}
                    className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${theme !== 'matrix' ? 'hover:bg-gray-200' : ''}`}
                    style={{
                      backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : '#f3f4f6',
                      color: theme === 'matrix' ? '#00ff41' : '#374151',
                      border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : '1px solid #d1d5db'
                    }}
                    title="Copy SSE URL"
                  >
                    {copiedSSE ? (
                      <>
                        <Check size={16} />
                        <span className="text-sm font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span className="text-sm font-medium">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Advanced Debug Information with JSON/YAML toggle */}
          {game && (
            <details className="mt-8">
              <summary 
                className={`cursor-pointer text-lg font-semibold p-2 rounded text-center ${theme !== 'matrix' ? styles.text : ''}`}
                style={{ color: theme === 'matrix' ? '#00ff41' : undefined }}
              >
                Advanced Debug Information
              </summary>
              <div className="mt-6 text-center">
                {/* Format Toggle Buttons */}
                <div className="flex justify-center gap-2 mb-4">
                  <button
                    onClick={() => setDebugFormat('json')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      debugFormat === 'json' ? 'scale-105' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: debugFormat === 'json' 
                        ? (theme === 'matrix' ? 'rgba(0, 255, 65, 0.2)' : '#3b82f6')
                        : (theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : '#f3f4f6'),
                      color: debugFormat === 'json'
                        ? (theme === 'matrix' ? '#00ff41' : '#ffffff')
                        : (theme === 'matrix' ? '#00ff41' : '#374151'),
                      border: theme === 'matrix' 
                        ? `1px solid ${debugFormat === 'json' ? 'rgba(0, 255, 65, 0.5)' : 'rgba(0, 255, 65, 0.3)'}` 
                        : `1px solid ${debugFormat === 'json' ? '#3b82f6' : '#d1d5db'}`
                    }}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setDebugFormat('yaml')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      debugFormat === 'yaml' ? 'scale-105' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: debugFormat === 'yaml' 
                        ? (theme === 'matrix' ? 'rgba(0, 255, 65, 0.2)' : '#3b82f6')
                        : (theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : '#f3f4f6'),
                      color: debugFormat === 'yaml'
                        ? (theme === 'matrix' ? '#00ff41' : '#ffffff')
                        : (theme === 'matrix' ? '#00ff41' : '#374151'),
                      border: theme === 'matrix' 
                        ? `1px solid ${debugFormat === 'yaml' ? 'rgba(0, 255, 65, 0.5)' : 'rgba(0, 255, 65, 0.3)'}` 
                        : `1px solid ${debugFormat === 'yaml' ? '#3b82f6' : '#d1d5db'}`
                    }}
                  >
                    YAML
                  </button>
                </div>

                {/* Debug Data Display with Copy Button */}
                <div className="relative">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={copyDebugData}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2`}
                      style={{
                        backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : '#f3f4f6',
                        color: theme === 'matrix' ? '#00ff41' : '#374151',
                        border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : '1px solid #d1d5db'
                      }}
                      title="Copy debug data"
                    >
                      <Copy size={14} />
                      Copy {debugFormat.toUpperCase()}
                    </button>
                  </div>
                  
                  <div 
                    className="rounded-lg max-h-96 overflow-y-auto"
                    style={{
                      backgroundColor: theme === 'matrix' ? 'rgba(0, 0, 0, 0.8)' : '#f8f9fa',
                      border: theme === 'matrix' ? '1px solid rgba(0, 255, 65, 0.3)' : '1px solid #e5e7eb'
                    }}
                  >
                    {debugFormat === 'json' ? (
                      <div 
                        className="text-left"
                        style={{
                          '--json-key-color': '#ff9500',
                          '--json-string-color': '#32d74b',
                          '--json-number-color': '#64d2ff',
                          '--json-boolean-color': '#ff9500',
                          '--json-null-color': '#ff453a'
                        } as React.CSSProperties}
                      >
                        <JsonViewer 
                          value={game}
                          theme={theme === 'light' ? 'light' : 'dark'}
                        />
                      </div>
                    ) : (
                      <div className="text-left p-4 text-sm font-mono">
                        <YamlColorizedViewer 
                          data={game} 
                          theme={theme}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal using portal to bypass container padding/margins
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};