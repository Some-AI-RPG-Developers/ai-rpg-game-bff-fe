/**
 * VoiceSelector - Voice selection component for TTS
 * Allows users to select different voices and adjust TTS settings
 */

'use client';

import React from 'react';
import { useTextToSpeech } from '@/client/hooks/useTextToSpeech';

export interface VoiceSelectorProps {
  className?: string;
  showAdvancedControls?: boolean;
  onVoiceChange?: (voiceURI: string) => void;
}

/**
 * Voice Selector component
 */
export function VoiceSelector({
  className = '',
  showAdvancedControls = false,
  onVoiceChange
}: VoiceSelectorProps) {
  const tts = useTextToSpeech();

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceURI = event.target.value;
    if (voiceURI && tts.setVoice(voiceURI)) {
      onVoiceChange?.(voiceURI);
    }
  };

  const handleRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(event.target.value);
    tts.setRate(rate);
  };

  const handlePitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pitch = parseFloat(event.target.value);
    tts.setPitch(pitch);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);
    tts.setVolume(volume);
  };

  if (!tts.isSupported) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Text-to-speech is not supported in this browser.
      </div>
    );
  }

  if (tts.isLoading) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Loading voices...
      </div>
    );
  }

  const groupedVoices = tts.voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0]; // Get language code (e.g., 'en' from 'en-US')
    if (!acc[lang]) {
      acc[lang] = [];
    }
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, typeof tts.voices>);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Selection */}
      <div>
        <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-1">
          Voice
        </label>
        <select
          id="voice-select"
          value={tts.selectedVoice?.voiceURI || ''}
          onChange={handleVoiceChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Select a voice</option>
          {Object.entries(groupedVoices).map(([lang, voices]) => (
            <optgroup key={lang} label={`${lang.toUpperCase()} voices`}>
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} {voice.localService ? '(Local)' : '(Remote)'}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Advanced Controls */}
      {showAdvancedControls && (
        <>
          {/* Rate Control */}
          <div>
            <label htmlFor="rate-control" className="block text-sm font-medium text-gray-700 mb-1">
              Speed: <span className="font-normal text-gray-500">0.5x - 2x</span>
            </label>
            <input
              id="rate-control"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              defaultValue="1"
              onChange={handleRateChange}
              className="block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x</span>
              <span>1x</span>
              <span>2x</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div>
            <label htmlFor="pitch-control" className="block text-sm font-medium text-gray-700 mb-1">
              Pitch: <span className="font-normal text-gray-500">0 - 2</span>
            </label>
            <input
              id="pitch-control"
              type="range"
              min="0"
              max="2"
              step="0.1"
              defaultValue="1"
              onChange={handlePitchChange}
              className="block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <label htmlFor="volume-control" className="block text-sm font-medium text-gray-700 mb-1">
              Volume: <span className="font-normal text-gray-500">0% - 100%</span>
            </label>
            <input
              id="volume-control"
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="1"
              onChange={handleVolumeChange}
              className="block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </>
      )}

      {/* Error Display */}
      {tts.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {tts.error}
          <button
            onClick={tts.clearError}
            className="ml-2 text-red-800 hover:text-red-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TTS Status */}
      {(tts.isSpeaking || tts.isPaused) && (
        <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md p-2 flex items-center justify-between">
          <span>
            {tts.isPaused ? 'Speech paused' : 'Speaking...'}
          </span>
          <div className="flex gap-2">
            {tts.isPaused ? (
              <button
                onClick={tts.resume}
                className="text-blue-800 hover:text-blue-900 underline"
              >
                Resume
              </button>
            ) : (
              <button
                onClick={tts.pause}
                className="text-blue-800 hover:text-blue-900 underline"
              >
                Pause
              </button>
            )}
            <button
              onClick={tts.stop}
              className="text-blue-800 hover:text-blue-900 underline"
            >
              Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}