/**
 * TTSWrapper - A wrapper component that adds TTS functionality to any text content
 * Acts as a decorator that can wrap existing components and add speech functionality
 */

'use client';

import React, { useState, useRef } from 'react';
import { TTSButton } from './TTSButton';

export interface TTSWrapperProps {
  children: React.ReactNode;
  text?: string; // If not provided, will extract text from children
  className?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline-start' | 'inline-end';
  showOnHover?: boolean; // Only show button on hover
  title?: string;
  disabled?: boolean;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * Extracts text content from React children recursively
 */
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (typeof children === 'number') {
    return children.toString();
  }
  
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    if (props.children) {
      return extractTextFromChildren(props.children);
    }
  }
  
  if (Array.isArray(children)) {
    return children.map(child => extractTextFromChildren(child)).join(' ');
  }
  
  return '';
}

/**
 * TTS Wrapper component that decorates content with TTS functionality
 */
export function TTSWrapper({
  children,
  text,
  className = '',
  buttonSize = 'sm',
  buttonPosition = 'top-right',
  showOnHover = false,
  title,
  disabled = false,
  onSpeakStart,
  onSpeakEnd,
  onError
}: TTSWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Extract text from children if not provided
  const speechText = text || extractTextFromChildren(children);
  
  // Don't render if no text available
  if (!speechText.trim()) {
    return <>{children}</>;
  }

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 10
    };

    switch (buttonPosition) {
      case 'top-right':
        return { ...baseStyles, top: '4px', right: '4px' };
      case 'top-left':
        return { ...baseStyles, top: '4px', left: '4px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '4px', right: '4px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '4px', left: '4px' };
      default:
        return {};
    }
  };

  const getInlineStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    };

    return baseStyles;
  };

  const shouldShowButton = !showOnHover || isHovered;

  if (buttonPosition.startsWith('inline')) {
    return (
      <div 
        className={className}
        style={getInlineStyles()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {buttonPosition === 'inline-start' && shouldShowButton && (
          <TTSButton
            text={speechText}
            size={buttonSize}
            title={title || 'Read text aloud'}
            disabled={disabled}
            onSpeakStart={onSpeakStart}
            onSpeakEnd={onSpeakEnd}
            onError={onError}
          />
        )}
        {children}
        {buttonPosition === 'inline-end' && shouldShowButton && (
          <TTSButton
            text={speechText}
            size={buttonSize}
            title={title || 'Read text aloud'}
            disabled={disabled}
            onSpeakStart={onSpeakStart}
            onSpeakEnd={onSpeakEnd}
            onError={onError}
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {shouldShowButton && (
        <div style={getPositionStyles()}>
          <TTSButton
            text={speechText}
            size={buttonSize}
            title={title || 'Read text aloud'}
            disabled={disabled}
            onSpeakStart={onSpeakStart}
            onSpeakEnd={onSpeakEnd}
            onError={onError}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Higher-order component version of TTSWrapper for easier composition
 */
export function withTTS<P extends object>(
  Component: React.ComponentType<P>,
  ttsOptions?: Omit<TTSWrapperProps, 'children'>
) {
  const WrappedComponent = React.forwardRef<HTMLElement, P>((props) => {
    return (
      <TTSWrapper {...ttsOptions}>
        <Component {...(props as P)} />
      </TTSWrapper>
    );
  });

  WrappedComponent.displayName = `withTTS(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook version for more control over TTS behavior
 */
export function useTTSWrapper(options?: Partial<TTSWrapperProps>) {
  const TTSWrapperHook = (children: React.ReactNode, overrideOptions?: Partial<TTSWrapperProps>) => (
    <TTSWrapper {...options} {...overrideOptions}>
      {children}
    </TTSWrapper>
  );
  
  TTSWrapperHook.displayName = 'TTSWrapperHook';
  
  return TTSWrapperHook;
}