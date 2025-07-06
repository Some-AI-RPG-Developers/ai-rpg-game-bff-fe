import React, {useState} from 'react';
import {GameStatus, PlayPageGame} from '@/client/types/game.types';
import {useTextToSpeech} from '@/client/hooks/useTextToSpeech';
import {useTheme} from '@/client/context/ThemeContext';
import {getThemeStyles} from '@/client/utils/themeStyles';
import {Bug, Shield, Sword} from 'lucide-react';
import {ThemeSwitcher} from '@/client/components/ui/ThemeSwitcher';

interface GameHeaderProps {
  /** Current game object */
  game?: PlayPageGame | null;
  /** Current game ID */
  gameId?: string | null;
  /** Current error message */
  error?: string | null;
  /** Current game status */
  gameStatus?: GameStatus;
  /** Handler to toggle debug modal */
  onToggleDebug?: () => void;
  /** Whether debug modal is open */
  isDebugOpen?: boolean;
}

/**
 * GameHeader displays the game title, ID, and TTS settings in a top modal layout.
 */
export const GameHeader: React.FC<GameHeaderProps> = ({
  game: _game, // eslint-disable-line @typescript-eslint/no-unused-vars
  gameId: _gameId, // eslint-disable-line @typescript-eslint/no-unused-vars
  error,
  gameStatus: _gameStatus, // eslint-disable-line @typescript-eslint/no-unused-vars
  onToggleDebug,
  isDebugOpen: _isDebugOpen // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  const tts = useTextToSpeech();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  
  const [pendingSettings, setPendingSettings] = useState({
    voice: tts.selectedVoice?.voiceURI || '',
    rate: 1,
    pitch: 1,
    volume: 1
  });

  // Update pending settings when TTS settings panel opens
  const handleOpenTTSSettings = () => {
    setPendingSettings({
      voice: tts.selectedVoice?.voiceURI || '',
      rate: 1, // These default to 1 since we can't easily get current hook state
      pitch: 1,
      volume: 1
    });
    setShowTTSSettings(true);
  };

  const handleConfirmSettings = () => {
    // Apply the voice setting
    if (pendingSettings.voice) {
      tts.setVoice(pendingSettings.voice);
    }
    
    // Apply rate, pitch, and volume as default options
    // Note: Using the hook's functions which update the internal options state
    tts.setRate(pendingSettings.rate);
    tts.setPitch(pendingSettings.pitch);
    tts.setVolume(pendingSettings.volume);
    
    console.log('Applied TTS settings:', pendingSettings);
    setShowTTSSettings(false);
    
    // Optional: Show confirmation to user
    alert('TTS settings applied successfully!');
  };

  const handleVoiceChange = (voiceURI: string) => {
    setPendingSettings(prev => ({ ...prev, voice: voiceURI }));
  };

  const handleRateChange = (rate: number) => {
    setPendingSettings(prev => ({ ...prev, rate }));
  };

  const handlePitchChange = (pitch: number) => {
    setPendingSettings(prev => ({ ...prev, pitch }));
  };

  const handleVolumeChange = (volume: number) => {
    setPendingSettings(prev => ({ ...prev, volume }));
  };

  return (
    <nav className={`sticky top-0 border-b ${
      theme === 'light' ? 'fantasy-border' : 
      theme === 'dark' ? 'dark-fantasy-header' :
      theme === 'performance' ? 'performance-card' : ''
    }`}
         style={{
           backgroundColor: theme === 'matrix' ? '#000000' : (theme === 'dark' ? 'transparent' : (theme === 'performance' ? '#1F2937' : '#ffffff')),
           borderColor: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? 'transparent' : (theme === 'performance' ? '#3b82f6' : undefined)),
           position: 'sticky',
           top: 0,
           zIndex: 9999,
           width: '100%',
           borderBottomWidth: theme === 'performance' ? '2px' : '1px',
           borderBottomStyle: 'solid'
         }}>
      {/* Main Navbar */}
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left Side - Game Title */}
        <div className="flex items-center gap-6">
          <h1 className={`text-xl font-bold ${
            theme === 'light' ? 'fantasy-text-magical' : 
            theme === 'dark' ? 'dark-fantasy-text-neon' :
            theme === 'performance' ? 'performance-text' :
            theme !== 'matrix' ? styles.text : ''
          }`}
              style={{ 
                margin: 0,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                padding: '8px 16px',
                backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
                borderRadius: '4px'
              }}>
            <Sword className="transform rotate-45" size={32} />
            {theme === 'light' ? '⚔️ AI RPG Adventure 🛡️' : 
             theme === 'dark' ? '🏰 DARK REALM CHRONICLES 🏰' :
             'AI RPG Adventure'}
            <Shield size={32} />
          </h1>
          
          {/* Game ID Badge */}
          <div className={`px-3 py-1 rounded text-sm ${
            theme === 'performance' ? 'performance-text' :
            theme !== 'matrix' ? styles.text : ''
          }`}
               style={{
                 backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : (
                   theme === 'performance' ? '#374151' : undefined
                 ),
                 border: theme === 'matrix' ? '1px solid #00ff41' : (
                   theme === 'performance' ? '1px solid #3b82f6' : '1px solid #dee2e6'
                 ),
                 color: theme === 'matrix' ? '#00ff41' : undefined
               }}>
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Controls */}
          <ThemeSwitcher />
          
          {/* Invisible button spacer */}
          <button className="p-2 opacity-0 pointer-events-none" disabled>
            <div className="w-4 h-4"></div>
          </button>

          {/* Debug Modal Button */}
          {onToggleDebug && (
            <button
              onClick={onToggleDebug}
              className={`p-2 rounded transition-all duration-300 hover:scale-105 ${styles.secondary}`}
              title="Toggle Debug Information"
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined
              }}
            >
              <Bug size={16} />
            </button>
          )}

          {/* TTS Settings Button */}
          <button
            onClick={handleOpenTTSSettings}
            className={`p-2 rounded transition-all duration-300 hover:scale-105 ${styles.secondary}`}
            title="Text-to-Speech Settings"
            style={{
              backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
              border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
              color: theme === 'matrix' ? '#00ff41' : undefined
            }}
          >
            <svg
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`mt-3 p-3 rounded-lg ${
          theme === 'performance' ? 'performance-border' : styles.border
        } border`}
             style={{
               backgroundColor: theme === 'matrix' ? '#330000' : (
                 theme === 'dark' ? '#330000' : (
                   theme === 'performance' ? '#374151' : '#f8d7da'
                 )
               ),
               borderColor: theme === 'matrix' ? '#ff4444' : (
                 theme === 'dark' ? '#cc4444' : (
                   theme === 'performance' ? '#dc2626' : '#f5c6cb'
                 )
               ),
               color: theme === 'matrix' ? '#ff6666' : (
                 theme === 'dark' ? '#cc4444' : (
                   theme === 'performance' ? '#f3f4f6' : '#721c24'
                 )
               )
             }}>
          Error: {error}
        </div>
      )}

      {/* TTS Settings Panel */}
      {showTTSSettings && (
        <div style={{
          marginTop: '15px',
          padding: '20px',
          backgroundColor: theme === 'matrix' ? '#000000' : (theme === 'dark' ? '#1a0000' : (theme === 'performance' ? '#1f2937' : 'white')),
          border: `${theme === 'performance' ? '2px' : '1px'} solid ${theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#8b0000' : (theme === 'performance' ? '#3b82f6' : '#dee2e6'))}`,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#cc4444' : (theme === 'performance' ? '#f3f4f6' : '#333')) }}>
              Text-to-Speech Settings
            </h3>
            <button
              onClick={() => setShowTTSSettings(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#cc4444' : '#666')
              }}
              title="Close"
            >
              ×
            </button>
          </div>

          {/* Custom TTS Settings */}
          <div style={{ display: 'grid', gap: '15px' }}>
            {/* Voice Selection */}
            {tts.isSupported && !tts.isLoading && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#cc4444' : '#333')
                }}>
                  Voice
                </label>
                <select
                  value={pendingSettings.voice || tts.selectedVoice?.voiceURI || ''}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#8b0000' : '#ccc')}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: theme === 'matrix' ? '#000000' : (theme === 'dark' ? '#1a0000' : 'white'),
                    color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#cc4444' : 'black')
                  }}
                >
                  <option value="">Select a voice</option>
                  {tts.voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} {voice.localService ? '(Local)' : '(Remote)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Rate Control */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#cc4444' : '#333')
              }}>
                Speed: {pendingSettings.rate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pendingSettings.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#aa3333' : '#666'),
                marginTop: '2px'
              }}>
                <span>0.5x</span>
                <span>1x</span>
                <span>2x</span>
              </div>
            </div>

            {/* Pitch Control */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#cc4444' : '#333')
              }}>
                Pitch: {pendingSettings.pitch}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={pendingSettings.pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#aa3333' : '#666'),
                marginTop: '2px'
              }}>
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
              </div>
            </div>

            {/* Volume Control */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#cc4444' : '#333')
              }}>
                Volume: {Math.round(pendingSettings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={pendingSettings.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#aa3333' : '#666'),
                marginTop: '2px'
              }}>
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* TTS Status */}
            {tts.error && (
              <div style={{
                padding: '10px',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                color: '#721c24',
                fontSize: '14px'
              }}>
                Error: {tts.error}
              </div>
            )}

            {!tts.isSupported && (
              <div style={{
                padding: '10px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                color: '#856404',
                fontSize: '14px'
              }}>
                Text-to-speech is not supported in this browser.
              </div>
            )}
          </div>

          <div style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}>
            <button
              onClick={() => setShowTTSSettings(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: theme === 'matrix' ? '#333333' : (theme === 'light' ? '#f59e0b' : (theme === 'dark' ? '#550000' : '#6c757d')),
                color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#cc4444' : 'white'),
                border: theme === 'matrix' ? '1px solid #00ff41' : 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSettings}
              style={{
                padding: '8px 16px',
                backgroundColor: theme === 'matrix' ? '#004d00' : (theme === 'light' ? '#f59e0b' : (theme === 'dark' ? '#8b0000' : '#28a745')),
                color: theme === 'matrix' ? '#00ff41' : (theme === 'dark' ? '#cc4444' : 'white'),
                border: theme === 'matrix' ? '1px solid #00ff41' : 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};