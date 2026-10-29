import { EQ_FREQUENCIES } from '../utils/equalizerPresets';

class AudioEngine {
  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isInitialized = false;
  private eqEnabled = true;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';
  }

  public getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  public initWebAudio() {
    if (this.isInitialized) {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.gainNode = this.audioCtx.createGain();

      // Create 10 BiquadFilterNodes
      this.filters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.frequency.value = freq;
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.gain.value = 0;
        return filter;
      });

      // Chain: Source -> Filter 0 -> Filter 1 ... -> Filter 9 -> Analyser -> Gain -> Destination
      let lastNode: AudioNode = this.sourceNode;
      for (const filter of this.filters) {
        lastNode.connect(filter);
        lastNode = filter;
      }

      lastNode.connect(this.analyserNode);
      this.analyserNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio initialization error:', err);
    }
  }

  public setTrackSource(url: string) {
    this.audio.src = url;
    this.audio.load();
  }

  public async play(): Promise<void> {
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    return this.audio.play();
  }

  public pause(): void {
    this.audio.pause();
  }

  public seekStep(seconds: number): number {
    const current = this.audio.currentTime;
    const duration = this.audio.duration || 0;
    const target = Math.max(0, Math.min(duration, current + seconds));
    this.audio.currentTime = target;
    return target;
  }

  public seekTo(targetSeconds: number): number {
    const duration = this.audio.duration || 0;
    const target = Math.max(0, Math.min(duration || targetSeconds, targetSeconds));
    this.audio.currentTime = target;
    return target;
  }

  public setVolume(volume: number, muted: boolean = false): void {
    const vol = Math.max(0, Math.min(1, volume));
    this.audio.volume = muted ? 0 : vol;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : vol;
    }
  }

  public setBandGain(bandIndex: number, gainDb: number): void {
    if (bandIndex >= 0 && bandIndex < this.filters.length) {
      const filter = this.filters[bandIndex];
      const clampedGain = Math.max(-12, Math.min(12, gainDb));
      if (this.eqEnabled) {
        filter.gain.value = clampedGain;
      }
    }
  }

  public setAllBands(gains: number[]): void {
    gains.forEach((gain, index) => {
      this.setBandGain(index, gain);
    });
  }

  public setEqEnabled(enabled: boolean, currentGains: number[]): void {
    this.eqEnabled = enabled;
    if (this.filters.length > 0) {
      this.filters.forEach((filter, index) => {
        filter.gain.value = enabled ? currentGains[index] || 0 : 0;
      });
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(16);
    }
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  public getAudioContextDetails(): { state: string; sampleRate: number } {
    return {
      state: this.audioCtx ? this.audioCtx.state : 'uninitialized',
      sampleRate: this.audioCtx ? this.audioCtx.sampleRate : 44100,
    };
  }
}

export const audioEngine = new AudioEngine();
