'use client';

import React from 'react';
import { Settings, X } from 'lucide-react';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';
import { useTextToSpeech } from '@/client/hooks/useTextToSpeech';

interface TTSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TTSModal: React.FC<TTSModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const { isSupported, isSpeaking } = useTextToSpeech();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`${styles.card} rounded-2xl p-8 max-w-md w-full mx-4`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${styles.text} flex items-center gap-2`}>
            <Settings size={24} />
            TTS Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-600/20 ${styles.text} transition-all duration-300`}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className={`${styles.text} font-medium`}>Text-to-Speech Supported</span>
            <span className={`${styles.text}`}>{isSupported ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`${styles.text} font-medium`}>Currently Speaking</span>
            <span className={`${styles.text}`}>{isSpeaking ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg ${styles.accent} ${styles.text} font-medium transition-all duration-300 hover:scale-105`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};