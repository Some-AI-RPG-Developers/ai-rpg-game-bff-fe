/**
 * useTextToSpeech - React hook for managing text-to-speech functionality
 * Provides state management and controls for the TTS service
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { TTSService, Voice, TTSOptions, getTextToSpeechService } from '@/client/services/tts/TTSService';

export interface TTSState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: Voice[];
  selectedVoice: Voice | null;
  error: string | null;
  isLoading: boolean;
}

export interface TTSControls {
  speak: (text: string, options?: TTSOptions) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voiceURI: string) => boolean;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  clearError: () => void;
}

/**
 * Text-to-Speech hook
 */
export function useTextToSpeech(ttsService?: TTSService): TTSState & TTSControls {
  const serviceRef = useRef<TTSService | null>(null);
  
  // Initialize service only on client side - use singleton to ensure all hooks share the same instance
  if (typeof window !== 'undefined' && !serviceRef.current) {
    serviceRef.current = ttsService || getTextToSpeechService();
  }
  
  const service = serviceRef.current;

  const [state, setState] = useState<TTSState>({
    isSupported: service?.isTextToSpeechSupported() ?? false,
    isSpeaking: false,
    isPaused: false,
    voices: [],
    selectedVoice: null,
    error: null,
    isLoading: true
  });

  const [options, setOptions] = useState<TTSOptions>({
    rate: 1,
    pitch: 1,
    volume: 1
  });

  // Update state periodically to track speaking status
  useEffect(() => {
    if (!state.isSupported || !service) return;

    const interval = setInterval(() => {
      const isSpeaking = service.isSpeaking();
      const isPaused = service.isPaused();
      
      setState(prev => {
        if (prev.isSpeaking !== isSpeaking || prev.isPaused !== isPaused) {
          return { ...prev, isSpeaking, isPaused };
        }
        return prev;
      });
    }, 1000); // Reduced from 100ms to 1000ms for performance

    return () => clearInterval(interval);
  }, [service, state.isSupported]);

  // Load voices on mount
  useEffect(() => {
    if (!state.isSupported || !service) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const loadVoices = () => {
      const voices = service.getVoices();
      const selectedVoice = service.getCurrentVoice();
      
      setState(prev => ({
        ...prev,
        voices,
        selectedVoice,
        isLoading: false
      }));
    };

    // Initial load
    loadVoices();

    // Listen for voice changes (some browsers load voices asynchronously)
    const handleVoicesChanged = () => {
      setTimeout(loadVoices, 100); // Small delay to ensure voices are loaded
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, [service, state.isSupported]);

  /**
   * Speaks the given text
   */
  const speak = useCallback(async (text: string, customOptions?: TTSOptions): Promise<void> => {
    if (!state.isSupported || !service) {
      throw new Error('Text-to-speech is not supported');
    }

    setState(prev => ({ ...prev, error: null }));

    try {
      const mergedOptions = { ...options, ...customOptions };
      
      await service.speak(text, mergedOptions, {
        onStart: () => {
          setState(prev => ({ ...prev, isSpeaking: true, isPaused: false }));
        },
        onEnd: () => {
          setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
        },
        onError: (error) => {
          setState(prev => ({
            ...prev,
            isSpeaking: false,
            isPaused: false,
            error: error.error || 'Speech synthesis error'
          }));
        },
        onPause: () => {
          setState(prev => ({ ...prev, isPaused: true }));
        },
        onResume: () => {
          setState(prev => ({ ...prev, isPaused: false }));
        }
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
      throw error;
    }
  }, [service, state.isSupported, options]);

  /**
   * Pauses the current speech
   */
  const pause = useCallback(() => {
    service?.pause();
  }, [service]);

  /**
   * Resumes the paused speech
   */
  const resume = useCallback(() => {
    service?.resume();
  }, [service]);

  /**
   * Stops the current speech
   */
  const stop = useCallback(() => {
    service?.stop();
    setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
  }, [service]);

  /**
   * Sets the voice for speech synthesis
   */
  const setVoice = useCallback((voiceURI: string): boolean => {
    if (!service) return false;
    
    const success = service.setVoice(voiceURI);
    if (success) {
      const selectedVoice = service.getCurrentVoice();
      setState(prev => ({ ...prev, selectedVoice }));
    }
    return success;
  }, [service]);

  /**
   * Sets the speech rate
   */
  const setRate = useCallback((rate: number) => {
    setOptions(prev => ({ ...prev, rate }));
  }, []);

  /**
   * Sets the speech pitch
   */
  const setPitch = useCallback((pitch: number) => {
    setOptions(prev => ({ ...prev, pitch }));
  }, []);

  /**
   * Sets the speech volume
   */
  const setVolume = useCallback((volume: number) => {
    setOptions(prev => ({ ...prev, volume }));
  }, []);

  /**
   * Clears the current error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    ...state,
    
    // Controls
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setPitch,
    setVolume,
    clearError
  };
}