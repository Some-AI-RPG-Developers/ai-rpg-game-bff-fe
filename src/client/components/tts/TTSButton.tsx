/**
 * TTSButton - Text-to-Speech button component
 * Provides a button to read text aloud with visual feedback
 */

'use client';

import React, { useState } from 'react';
import { useTextToSpeech } from '@/client/hooks/useTextToSpeech';
import { useTheme } from '@/client/context/ThemeContext';
import { Volume2, VolumeX, Pause } from 'lucide-react';

export interface TTSButtonProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  onError?: (error: string) => void;
  variant?: 'icon' | 'text' | 'both';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * TTS Button component
 */
export function TTSButton({
  text,
  children,
  className = '',
  disabled = false,
  title,
  onSpeakStart,
  onSpeakEnd,
  onError,
  variant = 'icon',
  size = 'md'
}: TTSButtonProps) {
  const tts = useTextToSpeech();
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(false);
  const { theme } = useTheme();

  const handlePlayClick = async () => {
    if (!text.trim()) return;

    try {
      setIsCurrentlyPlaying(true);
      onSpeakStart?.();
      
      await tts.speak(text);
      
      setIsCurrentlyPlaying(false);
      onSpeakEnd?.();
    } catch (error) {
      setIsCurrentlyPlaying(false);
      const errorMessage = error instanceof Error ? error.message : 'Speech synthesis failed';
      onError?.(errorMessage);
    }
  };

  const handlePauseClick = () => {
    if (tts.isPaused) {
      tts.resume();
    } else {
      tts.pause();
    }
  };

  const handleStopClick = () => {
    tts.stop();
    setIsCurrentlyPlaying(false);
    onSpeakEnd?.();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-2 py-1';
      case 'lg':
        return 'text-lg px-4 py-3';
      default:
        return 'text-base px-3 py-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  };

  const isDisabled = disabled || !tts.isSupported || !text.trim();

  const getButtonStyle = (isActive = false) => ({
    backgroundColor: theme === 'matrix' ? 
      (isActive ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0, 0, 0, 0.8)') : 
      (isActive ? '#e0f2fe' : '#ffffff'),
    color: theme === 'matrix' ? '#00ff41' : (isActive ? '#0277bd' : '#374151'),
    border: theme === 'matrix' ? 
      (isActive ? '2px solid #00ff41' : '1px solid rgba(0, 255, 65, 0.5)') : 
      (isActive ? '1px solid #0ea5e9' : '1px solid #d1d5db'),
    boxShadow: theme === 'matrix' && isActive ? '0 0 8px rgba(0, 255, 65, 0.3)' : undefined
  });

  const buttonClasses = `
    inline-flex items-center justify-center gap-2 
    rounded-md border
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-300 hover:scale-105
    ${getSizeClasses()}
    ${className}
  `.trim();

  const renderTTSIcon = () => <Volume2 size={getIconSize()} />;
  const renderTTSPausedIcon = () => <Pause size={getIconSize()} />;
  const renderTTSStoppedIcon = () => <VolumeX size={getIconSize()} />;

  const renderPlayButton = () => (
    <button
      type="button"
      onClick={handlePlayClick}
      disabled={isDisabled}
      title={title || 'Read text aloud'}
      className={buttonClasses}
      style={getButtonStyle(false)}
      aria-label={title || 'Read text aloud'}
    >
      {variant === 'text' ? (children || 'Listen') :
       variant === 'both' ? (
         <>
           {renderTTSIcon()}
           {children || 'Listen'}
         </>
       ) : renderTTSIcon()}
    </button>
  );

  const renderControlButtons = () => (
    <div className="inline-flex gap-1">
      <button
        type="button"
        onClick={handlePauseClick}
        disabled={isDisabled}
        title={tts.isPaused ? 'Resume audio' : 'Pause audio'}
        className={buttonClasses}
        style={getButtonStyle(true)}
        aria-label={tts.isPaused ? 'Resume audio' : 'Pause audio'}
      >
        {tts.isPaused ? renderTTSIcon() : renderTTSPausedIcon()}
      </button>
      <button
        type="button"
        onClick={handleStopClick}
        disabled={isDisabled}
        title="Stop audio"
        className={buttonClasses}
        style={getButtonStyle(true)}
        aria-label="Stop audio"
      >
        {renderTTSStoppedIcon()}
      </button>
    </div>
  );

  if (!tts.isSupported) {
    return null; // Don't render if TTS is not supported
  }

  // If currently playing or speaking, show pause/stop controls
  if (isCurrentlyPlaying || tts.isSpeaking) {
    return renderControlButtons();
  }

  // Otherwise, show play button
  return renderPlayButton();
}