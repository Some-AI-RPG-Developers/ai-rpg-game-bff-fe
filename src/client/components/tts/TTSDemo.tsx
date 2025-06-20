/**
 * TTSDemo - Demonstration component for TTS functionality
 * Shows different ways to use the TTS components
 */

'use client';

import React, { useState } from 'react';
import { TTSButton, TTSWrapper, VoiceSelector, useTextToSpeech } from './index';

export function TTSDemo() {
  const [demoText, setDemoText] = useState('Hello! This is a test of the text-to-speech functionality.');
  const tts = useTextToSpeech();

  const handleSpeak = async () => {
    try {
      await tts.speak(demoText);
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Text-to-Speech Demo</h1>
      
      {/* TTS Support Check */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Browser Support</h2>
        <p className="text-blue-800">
          {tts.isSupported 
            ? '✅ Text-to-speech is supported in your browser!'
            : '❌ Text-to-speech is not supported in your browser.'
          }
        </p>
        {tts.isSupported && (
          <p className="text-sm text-blue-600 mt-1">
            Available voices: {tts.voices.length}
          </p>
        )}
      </div>

      {/* Voice Settings */}
      {tts.isSupported && (
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Voice Settings</h2>
          <VoiceSelector showAdvancedControls={true} />
        </div>
      )}

      {/* Basic TTS Button Demo */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic TTS Button</h2>
        <div className="flex items-center gap-4">
          <TTSButton 
            text="This is a simple TTS button example."
            variant="both"
            size="md"
          />
          <span className="text-gray-600">Click the button to hear this text spoken aloud</span>
        </div>
      </div>

      {/* TTSWrapper Demo */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">TTS Wrapper Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Inline Start Position:</h3>
            <TTSWrapper buttonPosition="inline-start" buttonSize="sm">
              <p className="text-gray-600">
                This paragraph has a TTS button at the start. The wrapper automatically detects the text content.
              </p>
            </TTSWrapper>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Top-Right Position (hover to see):</h3>
            <TTSWrapper 
              buttonPosition="top-right" 
              showOnHover={true}
              className="relative"
            >
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-gray-600">
                  Hover over this box to see a TTS button appear in the top-right corner.
                  This is useful for adding TTS to existing content without changing the layout.
                </p>
              </div>
            </TTSWrapper>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Custom Text Override:</h3>
            <TTSWrapper 
              text="This is custom text that will be spoken instead of the visible text."
              buttonPosition="inline-end"
            >
              <p className="text-gray-600">
                This visible text is different from what will be spoken.
              </p>
            </TTSWrapper>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interactive Demo</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="demo-text" className="block text-sm font-medium text-gray-700 mb-2">
              Enter text to speak:
            </label>
            <textarea
              id="demo-text"
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter some text to test TTS..."
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleSpeak}
              disabled={!tts.isSupported || !demoText.trim() || tts.isSpeaking}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tts.isSpeaking ? 'Speaking...' : 'Speak Text'}
            </button>
            
            {tts.isSpeaking && (
              <>
                <button
                  onClick={tts.pause}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Pause
                </button>
                <button
                  onClick={tts.stop}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Stop
                </button>
              </>
            )}
            
            {tts.isPaused && (
              <button
                onClick={tts.resume}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Resume
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {tts.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
          <p className="text-red-700">{tts.error}</p>
          <button
            onClick={tts.clearError}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Clear Error
          </button>
        </div>
      )}
    </div>
  );
}