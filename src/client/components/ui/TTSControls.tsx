'use client';

import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { useTextToSpeech } from '@/client/hooks/useTextToSpeech';
import { TTSModal } from '@/client/components/tts/TTSModal';

export const TTSControls = () => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const { isSupported, isSpeaking } = useTextToSpeech();
  const [showModal, setShowModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`flex items-center gap-3 ${styles.text}`}>
        <span className="text-sm">Text-to-Speech</span>
        <span className="text-sm text-gray-400">Loading...</span>
        <button
          className={`p-2 rounded-lg hover:bg-gray-600/20 ${styles.text} transition-all duration-300`}
          title="TTS Settings"
          disabled
        >
          <Settings size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-3 ${styles.text}`}>
        <span className="text-sm">Text-to-Speech</span>
        <span className={`text-sm ${isSupported ? 'text-green-400' : 'text-red-400'}`}>
          {isSupported ? 'Supported' : 'Not Supported'}
        </span>
        <button
          onClick={() => setShowModal(true)}
          className={`p-2 rounded-lg hover:bg-gray-600/20 ${styles.text} transition-all duration-300`}
          title="TTS Settings"
        >
          <Settings size={16} />
        </button>
        {isSpeaking && (
          <div className="flex items-center gap-1">
            <div className="w-1 h-4 bg-green-500 animate-pulse" />
            <div className="w-1 h-6 bg-green-500 animate-pulse delay-75" />
            <div className="w-1 h-5 bg-green-500 animate-pulse delay-150" />
          </div>
        )}
      </div>
      
      <TTSModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};