import { AudioAnalyzer } from './AudioAnalyzer';
import { HarmonicGenerator } from './HarmonicGenerator';
import { NoiseGenerator } from './NoiseGenerator';
import { SweepEngine } from './SweepEngine';
import { ToneGenerator } from './ToneGenerator';
import { smoothParamChange, uiGainToAcousticGain } from './AudioUtils';

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private ctx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.35; // Conservative default volume

  // Sub-modules
  public toneGenerator!: ToneGenerator;
  public noiseGenerator!: NoiseGenerator;
  public harmonicGenerator!: HarmonicGenerator;
  public sweepEngine!: SweepEngine;
  public analyzer!: AudioAnalyzer;

  // Buffer playback node (for recorded HVAC audio)
  private bufferSourceNode: AudioBufferSourceNode | null = null;
  private bufferGainNode: GainNode | null = null;

  private constructor() {
    // Lazy initialized on first user interaction
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public isInitialized(): boolean {
    return this.ctx !== null;
  }

  public async initAudio(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master safety limiter
      this.limiterNode = this.ctx.createDynamicsCompressor();
      this.limiterNode.threshold.setValueAtTime(-3, this.ctx.currentTime); // -3 dB
      this.limiterNode.knee.setValueAtTime(6, this.ctx.currentTime);
      this.limiterNode.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.limiterNode.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiterNode.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Master Gain
      this.masterGainNode = this.ctx.createGain();
      const initialGain = uiGainToAcousticGain(this.masterVolume);
      this.masterGainNode.gain.setValueAtTime(initialGain, this.ctx.currentTime);

      // Analyzer
      this.analyzer = new AudioAnalyzer(this.ctx);

      // Routing: MasterGain -> Limiter -> Analyzer -> Destination
      this.masterGainNode.connect(this.limiterNode);
      this.limiterNode.connect(this.analyzer.getAnalyserNode());
      this.analyzer.getAnalyserNode().connect(this.ctx.destination);

      // Sub-modules
      this.toneGenerator = new ToneGenerator(this.ctx, this.masterGainNode);
      this.noiseGenerator = new NoiseGenerator(this.ctx, this.masterGainNode);
      this.harmonicGenerator = new HarmonicGenerator(this.ctx, this.masterGainNode);
      this.sweepEngine = new SweepEngine(this.toneGenerator);

      // Buffer playback node
      this.bufferGainNode = this.ctx.createGain();
      this.bufferGainNode.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.bufferGainNode.connect(this.masterGainNode);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return this.ctx;
  }

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGainNode) {
      const target = this.isMuted ? 0 : uiGainToAcousticGain(this.masterVolume);
      smoothParamChange(this.masterGainNode.gain, target, this.ctx.currentTime, 0.02);
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.ctx && this.masterGainNode) {
      const target = this.isMuted ? 0 : uiGainToAcousticGain(this.masterVolume);
      smoothParamChange(this.masterGainNode.gain, target, this.ctx.currentTime, 0.02);
    }
  }

  public isAnyAudioPlaying(): boolean {
    if (!this.ctx) return false;
    const tone = this.toneGenerator ? this.toneGenerator.getIsPlaying() : false;
    const noise = this.noiseGenerator ? this.noiseGenerator.getIsPlaying() : false;
    const harmonics = this.harmonicGenerator ? this.harmonicGenerator.getHarmonicsState().some(h => h.enabled) : false;
    const sweep = this.sweepEngine ? this.sweepEngine.isSweeping() : false;
    const buffer = this.bufferSourceNode !== null;
    return tone || noise || harmonics || sweep || buffer;
  }

  public stopAll(): void {
    if (this.sweepEngine) {
      this.sweepEngine.stopSweep();
    }
    if (this.toneGenerator) {
      this.toneGenerator.stop();
    }
    if (this.noiseGenerator) {
      this.noiseGenerator.stop();
    }
    if (this.harmonicGenerator) {
      this.harmonicGenerator.stopAll();
    }
    this.stopBufferPlayback();
  }

  // Recorded sample playback
  public playAudioBuffer(buffer: AudioBuffer, onEnded?: () => void): void {
    if (!this.ctx || !this.bufferGainNode) return;

    this.stopBufferPlayback();

    this.bufferSourceNode = this.ctx.createBufferSource();
    this.bufferSourceNode.buffer = buffer;
    this.bufferSourceNode.connect(this.bufferGainNode);

    this.bufferSourceNode.onended = () => {
      this.bufferSourceNode = null;
      if (onEnded) onEnded();
    };

    this.bufferSourceNode.start(this.ctx.currentTime);
  }

  public stopBufferPlayback(): void {
    if (this.bufferSourceNode) {
      try {
        this.bufferSourceNode.stop();
        this.bufferSourceNode.disconnect();
      } catch {
        // ignore
      }
      this.bufferSourceNode = null;
    }
  }
}
