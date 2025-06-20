/**
 * TTSButton - Text-to-Speech button component
 * Provides a button to read text aloud with visual feedback
 */

'use client';

import React, { useState } from 'react';
import { useTextToSpeech } from '@/client/hooks/useTextToSpeech';

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
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const isDisabled = disabled || !tts.isSupported || !text.trim();

  const buttonClasses = `
    inline-flex items-center justify-center gap-2 
    rounded-md border border-gray-300 
    bg-white hover:bg-gray-50 
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-colors duration-200
    ${getSizeClasses()}
    ${isCurrentlyPlaying ? 'bg-blue-50 border-blue-300 text-blue-700' : 'text-gray-700'}
    ${className}
  `.trim();

  const renderPlayIcon = () => (
    <svg
      className={getIconSize()}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 5v14l11-7z"/>
    </svg>
  );

  const renderPauseIcon = () => (
    <svg
      className={getIconSize()}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  );

  const renderStopIcon = () => (
    <svg
      className={getIconSize()}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 6h12v12H6z"/>
    </svg>
  );

  const renderPlayButton = () => (
    <button
      type="button"
      onClick={handlePlayClick}
      disabled={isDisabled}
      title={title || 'Play audio'}
      className={buttonClasses}
      aria-label={title || 'Play audio'}
    >
      {variant === 'text' ? (children || 'Play') :
       variant === 'both' ? (
         <>
           {renderPlayIcon()}
           {children || 'Play'}
         </>
       ) : renderPlayIcon()}
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
        aria-label={tts.isPaused ? 'Resume audio' : 'Pause audio'}
      >
        {tts.isPaused ? renderPlayIcon() : renderPauseIcon()}
      </button>
      <button
        type="button"
        onClick={handleStopClick}
        disabled={isDisabled}
        title="Stop audio"
        className={buttonClasses}
        aria-label="Stop audio"
      >
        {renderStopIcon()}
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