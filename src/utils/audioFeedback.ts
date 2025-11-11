class AudioFeedback {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      // Create AudioContext on first user interaction to avoid browser restrictions
      this.initializeAudioContext();
    }
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if it's suspended (common in modern browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn('Audio feedback not available:', error);
      this.isEnabled = false;
    }
  }

  private async createTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.audioContext || !this.isEnabled) return;

    try {
      // Ensure audio context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing audio feedback:', error);
    }
  }

  async playSuccess() {
    // Enhanced two-tone success sound
    await this.createTone(800, 0.2);
    setTimeout(() => this.createTone(1000, 0.3), 150);
  }

  async playError() {
    // Enhanced error sound with double beep
    await this.createTone(300, 0.3);
    setTimeout(() => this.createTone(250, 0.3), 200);
  }

  async playClick() {
    // Enhanced click sound
    await this.createTone(600, 0.08, 0.2);
  }

  async playCamera() {
    // Camera activation sound
    await this.createTone(880, 0.1, 0.15);
    setTimeout(() => this.createTone(1100, 0.1, 0.15), 80);
  }

  async playDetection() {
    // Bill detection sound
    await this.createTone(1200, 0.2, 0.25);
    setTimeout(() => this.createTone(1000, 0.15, 0.2), 100);
  }

  async speakText(text: string) {
    if (!this.isEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    try {
      // Cancelar cualquier speech anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configurar voz en español si está disponible
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => 
        voice.lang.startsWith('es') || voice.name.toLowerCase().includes('spanish')
      );
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Error with text-to-speech:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled && !!this.audioContext;
  }
}

export const audioFeedback = new AudioFeedback();