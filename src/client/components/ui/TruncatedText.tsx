import React, { useState } from 'react';

interface TruncatedTextProps {
  text: string;
  textId: string;
  className?: string;
  style?: React.CSSProperties;
  maxLength?: number;
  maxLines?: number;
  as?: 'p' | 'span' | 'div';
  children?: React.ReactNode;
}

/**
 * Reusable component that truncates long text with click-to-expand functionality
 */
export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  textId,
  className = '',
  style = {},
  maxLength = 200,
  maxLines = 3,
  as: Component = 'p',
  children
}) => {
  const [expandedTexts, setExpandedTexts] = useState<Record<string, boolean>>({});

  const toggleText = (id: string) => {
    setExpandedTexts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isExpanded = expandedTexts[textId];
  const shouldTruncate = text.length > maxLength;

  return (
    <Component
      className={`${className} ${shouldTruncate ? 'cursor-pointer' : ''} transition-all duration-200`}
      style={{
        ...style,
        ...(shouldTruncate && !isExpanded ? {
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        } : {})
      }}
      onClick={() => shouldTruncate && toggleText(textId)}
      title={shouldTruncate ? (isExpanded ? 'Click to collapse' : 'Click to expand') : undefined}
    >
      {text}
      {children}
    </Component>
  );
};

interface TruncatedTextProviderProps {
  children: React.ReactNode;
}

/**
 * Context provider for managing expanded text state across multiple components
 */
export const useTruncatedTextState = () => {
  const [expandedTexts, setExpandedTexts] = useState<Record<string, boolean>>({});

  const toggleText = (textId: string) => {
    setExpandedTexts(prev => ({
      ...prev,
      [textId]: !prev[textId]
    }));
  };

  const isExpanded = (textId: string) => expandedTexts[textId];

  return { expandedTexts, toggleText, isExpanded };
};

/**
 * Simplified version that accepts shared state from parent component
 */
interface TruncatedTextWithStateProps extends Omit<TruncatedTextProps, 'textId'> {
  text: string;
  textId: string;
  expandedTexts: Record<string, boolean>;
  toggleText: (textId: string) => void;
}

export const TruncatedTextWithState: React.FC<TruncatedTextWithStateProps> = ({
  text,
  textId,
  className = '',
  style = {},
  maxLength = 200,
  maxLines = 3,
  as: Component = 'p',
  expandedTexts,
  toggleText,
  children
}) => {
  const isExpanded = expandedTexts[textId];
  const shouldTruncate = text.length > maxLength;

  return (
    <Component
      className={`${className} ${shouldTruncate ? 'cursor-pointer' : ''} transition-all duration-200`}
      style={{
        ...style,
        ...(shouldTruncate && !isExpanded ? {
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        } : {})
      }}
      onClick={() => shouldTruncate && toggleText(textId)}
      title={shouldTruncate ? (isExpanded ? 'Click to collapse' : 'Click to expand') : undefined}
    >
      {text}
      {children}
    </Component>
  );
};