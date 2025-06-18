import React, { useState } from 'react';
import { PlayPageGame } from '@/client/types/game.types';
import { useTextToSpeech } from '@/client/hooks/useTextToSpeech';

interface GameHeaderProps {
  /** Current game object */
  game?: PlayPageGame | null;
  /** Current game ID */
  gameId?: string | null;
  /** Current error message */
  error?: string | null;
}

/**
 * GameHeader displays the game title, ID, and TTS settings in a top modal layout.
 */
export const GameHeader: React.FC<GameHeaderProps> = ({
  game,
  gameId,
  error
}) => {
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  const tts = useTextToSpeech();
  
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

  const gameTitle = game?.gamePrompt || 'AI RPG Game';
  const displayGameId = game?.gameId || gameId || 'No Game ID';

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      padding: '10px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Main Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '50px'
      }}>
        {/* Left Side - Game Info */}
        <div style={{ flex: 1 }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {gameTitle}
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#666'
          }}>
            ID: {displayGameId}
          </p>
        </div>

        {/* Right Side - TTS Settings Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleOpenTTSSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: showTTSSettings ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title="Text-to-Speech Settings"
          >
            <svg
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 9a1 1 0 011-1h1.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-.293.707l-3.414 3.414a1 1 0 01-.707.293H10a1 1 0 01-1-1v-6z"/>
            </svg>
            TTS Settings
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          Error: {error}
        </div>
      )}

      {/* TTS Settings Panel */}
      {showTTSSettings && (
        <div style={{
          marginTop: '15px',
          padding: '20px',
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
              Text-to-Speech Settings
            </h3>
            <button
              onClick={() => setShowTTSSettings(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#666'
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
                  color: '#333'
                }}>
                  Voice
                </label>
                <select
                  value={pendingSettings.voice || tts.selectedVoice?.voiceURI || ''}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
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
                color: '#333'
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
                color: '#666',
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
                color: '#333'
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
                color: '#666',
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
                color: '#333'
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
                color: '#666',
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
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
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
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};