/**
 * TTSService - Browser Text-to-Speech API wrapper
 * Provides voice synthesis capabilities with voice selection and controls
 */

export interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
  localService: boolean;
  default: boolean;
}

export interface TTSOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
}

export interface TTSEventHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
  onPause?: () => void;
  onResume?: () => void;
}

/**
 * Text-to-Speech service class
 */
export class TTSService {
  private synthesis: SpeechSynthesis | null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private defaultOptions: TTSOptions = {
    rate: 1,
    pitch: 1,
    volume: 1
  };

  constructor() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.isSupported = 'speechSynthesis' in window;
      
      if (this.isSupported) {
        this.loadVoices();
        // Load voices when they change (some browsers load them asynchronously)
        this.synthesis.addEventListener('voiceschanged', () => {
          this.loadVoices();
        });
      }
    } else {
      // Server-side rendering - no speech synthesis available
      this.synthesis = null;
      this.isSupported = false;
    }
  }

  /**
   * Checks if TTS is supported in the current browser
   */
  isTextToSpeechSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Gets available voices
   */
  getVoices(): Voice[] {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      voiceURI: voice.voiceURI,
      localService: voice.localService,
      default: voice.default
    }));
  }

  /**
   * Sets the voice to use for speech synthesis
   */
  setVoice(voiceURI: string): boolean {
    const voice = this.voices.find(v => v.voiceURI === voiceURI);
    if (voice) {
      this.selectedVoice = voice;
      return true;
    }
    return false;
  }

  /**
   * Gets the currently selected voice
   */
  getCurrentVoice(): Voice | null {
    if (!this.selectedVoice) return null;
    
    return {
      name: this.selectedVoice.name,
      lang: this.selectedVoice.lang,
      voiceURI: this.selectedVoice.voiceURI,
      localService: this.selectedVoice.localService,
      default: this.selectedVoice.default
    };
  }

  /**
   * Speaks the given text
   */
  speak(text: string, options?: TTSOptions, handlers?: TTSEventHandlers): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.synthesis) {
        reject(new Error('Text-to-speech is not supported in this browser'));
        return;
      }

      if (!text.trim()) {
        reject(new Error('Text cannot be empty'));
        return;
      }

      // Stop any current speech
      this.stop();

      // Create utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text);

      // Apply voice
      if (options?.voice) {
        this.currentUtterance.voice = options.voice;
      } else if (this.selectedVoice) {
        this.currentUtterance.voice = this.selectedVoice;
      }

      // Apply options
      this.currentUtterance.rate = options?.rate ?? this.defaultOptions.rate ?? 1;
      this.currentUtterance.pitch = options?.pitch ?? this.defaultOptions.pitch ?? 1;
      this.currentUtterance.volume = options?.volume ?? this.defaultOptions.volume ?? 1;

      // Set up event handlers
      this.currentUtterance.onstart = () => {
        handlers?.onStart?.();
      };

      this.currentUtterance.onend = () => {
        this.currentUtterance = null;
        handlers?.onEnd?.();
        resolve();
      };

      this.currentUtterance.onerror = (error) => {
        this.currentUtterance = null;
        handlers?.onError?.(error);
        reject(error);
      };

      this.currentUtterance.onpause = () => {
        handlers?.onPause?.();
      };

      this.currentUtterance.onresume = () => {
        handlers?.onResume?.();
      };

      // Start speaking
      this.synthesis.speak(this.currentUtterance);
    });
  }

  /**
   * Pauses the current speech
   */
  pause(): void {
    if (this.isSupported && this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resumes the paused speech
   */
  resume(): void {
    if (this.isSupported && this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Stops the current speech
   */
  stop(): void {
    if (this.isSupported && this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Checks if currently speaking
   */
  isSpeaking(): boolean {
    return this.isSupported && this.synthesis !== null && this.synthesis.speaking;
  }

  /**
   * Checks if currently paused
   */
  isPaused(): boolean {
    return this.isSupported && this.synthesis !== null && this.synthesis.paused;
  }

  /**
   * Sets default options for speech synthesis
   */
  setDefaultOptions(options: Partial<TTSOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Gets default options
   */
  getDefaultOptions(): TTSOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Gets voices filtered by language
   */
  getVoicesByLanguage(language: string): Voice[] {
    return this.getVoices().filter(voice => voice.lang.startsWith(language));
  }

  /**
   * Gets the best voice for a given language
   */
  getBestVoiceForLanguage(language: string): Voice | null {
    const voices = this.getVoicesByLanguage(language);
    
    // Prefer default voices first
    const defaultVoice = voices.find(voice => voice.default);
    if (defaultVoice) return defaultVoice;
    
    // Then prefer local voices
    const localVoice = voices.find(voice => voice.localService);
    if (localVoice) return localVoice;
    
    // Return first available voice
    return voices[0] || null;
  }

  /**
   * Loads available voices
   */
  private loadVoices(): void {
    if (!this.synthesis) return;
    
    this.voices = this.synthesis.getVoices();
    
    // Set default voice if none selected
    if (!this.selectedVoice && this.voices.length > 0) {
      // Try to find English voice as default
      const englishVoice = this.getBestVoiceForLanguage('en');
      if (englishVoice) {
        this.setVoice(englishVoice.voiceURI);
      } else {
        // Fallback to first available voice
        this.selectedVoice = this.voices[0];
      }
    }
  }
}

// Export a function to get singleton instance for convenience (only created on client-side)
let textToSpeechServiceInstance: TTSService | null = null;

export function getTextToSpeechService(): TTSService | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!textToSpeechServiceInstance) {
    textToSpeechServiceInstance = new TTSService();
  }
  
  return textToSpeechServiceInstance;
}