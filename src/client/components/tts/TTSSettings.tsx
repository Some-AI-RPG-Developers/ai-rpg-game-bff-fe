/**
 * TTSSettings - Collapsible TTS settings panel
 * Provides voice selection and advanced controls in a compact format
 */

'use client';

import React, { useState } from 'react';
import { VoiceSelector } from './VoiceSelector';

export interface TTSSettingsProps {
  className?: string;
  defaultOpen?: boolean;
}

/**
 * TTS Settings panel component
 */
export function TTSSettings({
  className = '',
  defaultOpen = false
}: TTSSettingsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-300 rounded-lg bg-white shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-lg"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 9a1 1 0 011-1h1.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-.293.707l-3.414 3.414a1 1 0 01-.707.293H10a1 1 0 01-1-1v-6z"
              />
            </svg>
            <span>Text-to-Speech Settings</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 py-3 border-t border-gray-200">
          <VoiceSelector 
            showAdvancedControls={true}
            onVoiceChange={(voiceURI) => {
              console.log('Voice changed to:', voiceURI);
            }}
          />
        </div>
      )}
    </div>
  );
}