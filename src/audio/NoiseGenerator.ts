import type { NoiseType } from '../types/audio';
import { bandwidthToQ, smoothParamChange, uiGainToAcousticGain } from './AudioUtils';

export class NoiseGenerator {
  private ctx: AudioContext;
  private destinationNode: AudioNode;

  private isRunning: boolean = false;
  private noiseType: NoiseType = 'narrowband';
  private gain: number = 0.3;
  private centerFreq: number = 100;
  private bandwidth: number = 20;

  // Web Audio Nodes
  private sourceNode: AudioBufferSourceNode | null = null;
  private bandpassFilterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;

  // Cached AudioBuffers for each noise type (5 seconds loopable)
  private whiteBuffer: AudioBuffer | null = null;
  private pinkBuffer: AudioBuffer | null = null;
  private brownBuffer: AudioBuffer | null = null;

  constructor(ctx: AudioContext, destinationNode: AudioNode) {
    this.ctx = ctx;
    this.destinationNode = destinationNode;
    this.initBuffers();
    this.initFilterAndGain();
  }

  private initBuffers(): void {
    const sampleRate = this.ctx.sampleRate;
    const duration = 5; // 5 seconds looped buffer
    const bufferSize = sampleRate * duration;

    // 1. Generate White Noise Buffer
    this.whiteBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const whiteData = this.whiteBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      whiteData[i] = Math.random() * 2 - 1;
    }

    // 2. Generate Pink Noise Buffer (Paul Kellet's filtered white noise algorithm)
    this.pinkBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const pinkData = this.pinkBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    // 3. Generate Brown Noise Buffer (Integrated Brownian motion with leak)
    this.brownBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const brownData = this.brownBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      brownData[i] = lastOut * 3.5;
    }
  }

  private initFilterAndGain(): void {
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

    this.bandpassFilterNode = this.ctx.createBiquadFilter();
    this.bandpassFilterNode.type = 'bandpass';
    this.bandpassFilterNode.frequency.setValueAtTime(this.centerFreq, this.ctx.currentTime);
    this.bandpassFilterNode.Q.setValueAtTime(bandwidthToQ(this.centerFreq, this.bandwidth), this.ctx.currentTime);

    this.gainNode.connect(this.destinationNode);
  }

  public start(): void {
    if (this.isRunning) return;
    if (!this.gainNode || !this.bandpassFilterNode) this.initFilterAndGain();

    const now = this.ctx.currentTime;
    this.sourceNode = this.ctx.createBufferSource();
    this.sourceNode.loop = true;

    // Select buffer based on noise type
    if (this.noiseType === 'pink') {
      this.sourceNode.buffer = this.pinkBuffer;
      this.sourceNode.connect(this.gainNode!);
    } else if (this.noiseType === 'brown') {
      this.sourceNode.buffer = this.brownBuffer;
      this.sourceNode.connect(this.gainNode!);
    } else if (this.noiseType === 'narrowband') {
      // Narrowband uses white noise routed through bandpass filter
      this.sourceNode.buffer = this.whiteBuffer;
      this.sourceNode.connect(this.bandpassFilterNode!);
      this.bandpassFilterNode!.disconnect();
      this.bandpassFilterNode!.connect(this.gainNode!);
    } else {
      // White noise
      this.sourceNode.buffer = this.whiteBuffer;
      this.sourceNode.connect(this.gainNode!);
    }

    this.sourceNode.start(now);

    // Smooth ramp in
    const targetGain = uiGainToAcousticGain(this.gain);
    this.gainNode!.gain.cancelScheduledValues(now);
    this.gainNode!.gain.setValueAtTime(0, now);
    smoothParamChange(this.gainNode!.gain, targetGain, now, 0.03);

    this.isRunning = true;
  }

  public stop(): void {
    if (!this.isRunning || !this.gainNode) return;

    const now = this.ctx.currentTime;
    const srcToStop = this.sourceNode;
    this.sourceNode = null;
    this.isRunning = false;

    // Smooth ramp down
    this.gainNode.gain.cancelScheduledValues(now);
    smoothParamChange(this.gainNode.gain, 0, now, 0.02);

    setTimeout(() => {
      try {
        if (srcToStop) {
          srcToStop.stop();
          srcToStop.disconnect();
        }
      } catch {
        // ignore
      }
    }, 40);
  }

  public setType(type: NoiseType): void {
    if (this.noiseType === type) return;
    this.noiseType = type;

    if (this.isRunning) {
      // Restart generator smoothly with new buffer routing
      this.stop();
      setTimeout(() => {
        this.start();
      }, 50);
    }
  }

  public setGain(gain: number): void {
    this.gain = Math.max(0, Math.min(1, gain));
    if (this.isRunning && this.gainNode) {
      const targetGain = uiGainToAcousticGain(this.gain);
      smoothParamChange(this.gainNode.gain, targetGain, this.ctx.currentTime);
    }
  }

  public setCenterFrequency(freq: number): void {
    this.centerFreq = Math.max(20, Math.min(500, freq));
    if (this.bandpassFilterNode) {
      smoothParamChange(this.bandpassFilterNode.frequency, this.centerFreq, this.ctx.currentTime);
      const q = bandwidthToQ(this.centerFreq, this.bandwidth);
      smoothParamChange(this.bandpassFilterNode.Q, q, this.ctx.currentTime);
    }
  }

  public setBandwidth(bw: number): void {
    this.bandwidth = Math.max(1, Math.min(200, bw));
    if (this.bandpassFilterNode) {
      const q = bandwidthToQ(this.centerFreq, this.bandwidth);
      smoothParamChange(this.bandpassFilterNode.Q, q, this.ctx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }
}
