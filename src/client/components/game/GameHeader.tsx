import React, { useState } from 'react';
import { PlayPageGame, GameStatus } from '@/client/types/game.types';
import { useTextToSpeech } from '@/client/hooks/useTextToSpeech';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { Shield, Sword, Bug } from 'lucide-react';

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
  isDebugOpen
}) => {
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  const tts = useTextToSpeech();
  const { theme, setTheme } = useTheme();
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
    <nav className={`sticky top-0 border-b`}
         style={{
           backgroundColor: theme === 'matrix' ? '#000000' : (theme === 'dark' ? '#1a1a1a' : '#ffffff'),
           borderColor: theme === 'matrix' ? '#00ff41' : undefined,
           position: 'sticky',
           top: 0,
           zIndex: 9999,
           width: '100%',
           borderBottomWidth: '1px',
           borderBottomStyle: 'solid'
         }}>
      {/* Main Navbar */}
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left Side - Game Title */}
        <div className="flex items-center gap-6">
          <h1 className={`text-xl font-bold ${theme !== 'matrix' ? styles.text : ''}`}
              style={{ 
                margin: 0,
                color: theme === 'matrix' ? '#00ff41' : undefined,
                padding: '8px 16px',
                backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
                borderRadius: '4px'
              }}>
            <Sword className="transform rotate-45" size={32} />
            AI RPG Adventure
            <Shield size={32} />
          </h1>
          
          {/* Game ID Badge */}
          <div className={`px-3 py-1 rounded text-sm ${theme !== 'matrix' ? styles.text : ''}`}
               style={{
                 backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                 border: theme === 'matrix' ? '1px solid #00ff41' : '1px solid #dee2e6',
                 color: theme === 'matrix' ? '#00ff41' : undefined
               }}>
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'matrix' ? 'light' : 'matrix')}
              className={`p-2 rounded transition-all duration-300 hover:scale-105 ${styles.secondary}`}
              title="Toggle Matrix Theme"
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h2v2H3V3zm4 0h2v2H7V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zM3 7h2v2H3V7zm4 0h2v2H7V7zm8 0h2v2h-2V7zm4 0h2v2h-2V7zM3 11h2v2H3v-2zm8 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM3 15h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm8 0h2v2h-2v-2zM3 19h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
              </svg>
            </button>
            
            <button
              onClick={() => setTheme('light')}
              className={`p-2 rounded transition-all duration-300 hover:scale-105 ${theme === 'light' ? styles.accent : styles.secondary}`}
              title="Light Theme"
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 18C8.69 18 6 15.31 6 12S8.69 6 12 6S18 8.69 18 12S15.31 18 12 18M12 2A1 1 0 0 0 11 3V5A1 1 0 0 0 13 5V3A1 1 0 0 0 12 2M17.64 4.64A1 1 0 0 0 16.23 6.05L17.64 7.46A1 1 0 0 0 19.05 6.05L17.64 4.64M20 11A1 1 0 0 0 19 12A1 1 0 0 0 20 13H22A1 1 0 0 0 22 11H20M17.64 17.64A1 1 0 0 0 19.05 17.64L17.64 16.23A1 1 0 0 0 16.23 17.64L17.64 17.64M12 20A1 1 0 0 0 13 21V23A1 1 0 0 0 11 23V21A1 1 0 0 0 12 20M7.46 17.64L6.05 19.05A1 1 0 0 0 7.46 17.64L6.05 16.23A1 1 0 0 0 4.64 17.64L7.46 17.64M6 13A1 1 0 0 0 5 12A1 1 0 0 0 4 13H2A1 1 0 0 0 2 11H4A1 1 0 0 0 5 12A1 1 0 0 0 6 13M6.05 6.05L7.46 7.46A1 1 0 0 0 6.05 4.64L4.64 6.05A1 1 0 0 0 6.05 6.05Z"/>
              </svg>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded transition-all duration-300 hover:scale-105 ${theme === 'dark' ? styles.accent : styles.secondary}`}
              title="Dark Theme"
              style={{
                backgroundColor: theme === 'matrix' ? 'rgba(0, 255, 65, 0.1)' : undefined,
                border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
                color: theme === 'matrix' ? '#00ff41' : undefined
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.75 4.09L15.22 6.03L16.13 9.09L13.5 7.28L10.87 9.09L11.78 6.03L9.25 4.09L12.44 4L13.5 1L14.56 4L17.75 4.09M21.25 11L19.61 12.25L20.2 14.23L18.5 13.06L16.8 14.23L17.39 12.25L15.75 11L17.81 10.95L18.5 9L19.19 10.95L21.25 11M18.97 15.95C19.8 15.87 20.69 17.05 20.16 17.8C19.84 18.25 19.5 18.67 19.08 19.07C15.17 23 8.84 23 4.94 19.07C1.03 15.17 1.03 8.83 4.94 4.93C5.34 4.53 5.76 4.17 6.21 3.85C6.96 3.32 8.14 4.21 8.06 5.04C7.79 7.9 8.75 10.87 10.95 13.06C13.14 15.26 16.1 16.22 18.97 15.95Z"/>
              </svg>
            </button>
          </div>

          {/* Debug Modal Button */}
          {onToggleDebug && (
            <button
              onClick={onToggleDebug}
              className={`p-2 rounded transition-all duration-300 hover:scale-105 ${
                isDebugOpen ? styles.accent : styles.secondary
              }`}
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
            className={`p-2 rounded transition-all duration-300 hover:scale-105 ${
              showTTSSettings ? styles.accent : styles.secondary
            }`}
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
        <div className={`mt-3 p-3 rounded-lg ${styles.border} border`}
             style={{
               backgroundColor: theme === 'matrix' ? '#330000' : '#f8d7da',
               borderColor: theme === 'matrix' ? '#ff4444' : '#f5c6cb',
               color: theme === 'matrix' ? '#ff6666' : '#721c24'
             }}>
          Error: {error}
        </div>
      )}

      {/* TTS Settings Panel */}
      {showTTSSettings && (
        <div style={{
          marginTop: '15px',
          padding: '20px',
          backgroundColor: theme === 'matrix' ? '#000000' : 'white',
          border: `1px solid ${theme === 'matrix' ? '#00ff41' : '#dee2e6'}`,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: theme === 'matrix' ? '#00ff41' : '#333' }}>
              Text-to-Speech Settings
            </h3>
            <button
              onClick={() => setShowTTSSettings(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: theme === 'matrix' ? '#00ff41' : '#666'
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
                  color: theme === 'matrix' ? '#00ff41' : '#333'
                }}>
                  Voice
                </label>
                <select
                  value={pendingSettings.voice || tts.selectedVoice?.voiceURI || ''}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${theme === 'matrix' ? '#00ff41' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: theme === 'matrix' ? '#000000' : 'white',
                    color: theme === 'matrix' ? '#00ff41' : 'black'
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
                color: theme === 'matrix' ? '#00ff41' : '#333'
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
                color: theme === 'matrix' ? '#00ff41' : '#666',
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
                color: theme === 'matrix' ? '#00ff41' : '#333'
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
                color: theme === 'matrix' ? '#00ff41' : '#666',
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
                color: theme === 'matrix' ? '#00ff41' : '#333'
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
                color: theme === 'matrix' ? '#00ff41' : '#666',
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
                backgroundColor: theme === 'matrix' ? '#333333' : '#6c757d',
                color: theme === 'matrix' ? '#00ff41' : 'white',
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
                backgroundColor: theme === 'matrix' ? '#004d00' : '#28a745',
                color: theme === 'matrix' ? '#00ff41' : 'white',
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