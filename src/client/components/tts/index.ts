/**
 * TTS Components - Text-to-Speech components index
 * Exports all TTS-related components and services
 */

export { TTSButton } from './TTSButton';
export { VoiceSelector } from './VoiceSelector';
export { TTSWrapper, withTTS, useTTSWrapper } from './TTSWrapper';
export { TTSSettings } from './TTSSettings';
export type { TTSButtonProps } from './TTSButton';
export type { VoiceSelectorProps } from './VoiceSelector';
export type { TTSWrapperProps } from './TTSWrapper';
export type { TTSSettingsProps } from './TTSSettings';

// Re-export TTS service and hook
export { TTSService, getTextToSpeechService } from '@/client/services/tts/TTSService';
export { useTextToSpeech } from '@/client/hooks/useTextToSpeech';
export type { Voice, TTSOptions, TTSEventHandlers } from '@/client/services/tts/TTSService';
export type { TTSState, TTSControls } from '@/client/hooks/useTextToSpeech';