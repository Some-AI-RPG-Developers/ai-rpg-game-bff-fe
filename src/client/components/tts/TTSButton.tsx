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

  const handleClick = async () => {
    if (!text.trim()) return;

    if (isCurrentlyPlaying) {
      tts.stop();
      setIsCurrentlyPlaying(false);
      onSpeakEnd?.();
      return;
    }

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

  const buttonTitle = title || (isCurrentlyPlaying ? 'Stop reading' : 'Read aloud');

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

  const renderIcon = () => {
    if (isCurrentlyPlaying) {
      return (
        <svg
          className={getIconSize()}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 10h6v4H9z"
          />
        </svg>
      );
    }

    return (
      <svg
        className={getIconSize()}
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
    );
  };

  const renderContent = () => {
    switch (variant) {
      case 'text':
        return children || (isCurrentlyPlaying ? 'Stop' : 'Read aloud');
      case 'both':
        return (
          <>
            {renderIcon()}
            {children || (isCurrentlyPlaying ? 'Stop' : 'Read aloud')}
          </>
        );
      default:
        return renderIcon();
    }
  };

  if (!tts.isSupported) {
    return null; // Don't render if TTS is not supported
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      title={buttonTitle}
      className={buttonClasses}
      aria-label={buttonTitle}
    >
      {renderContent()}
    </button>
  );
}