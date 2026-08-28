import type { WaveformType } from '../types/audio';
import { phaseToDelaySeconds, smoothParamChange, uiGainToAcousticGain } from './AudioUtils';

export class ToneGenerator {
  private ctx: AudioContext;
  private destinationNode: AudioNode;
  
  private oscNode: OscillatorNode | null = null;
  private delayNode: DelayNode | null = null;
  private gainNode: GainNode | null = null;
  
  private isRunning: boolean = false;
  private currentFrequency: number = 100;
  private currentWaveform: WaveformType = 'sine';
  private currentGain: number = 0.3;
  private currentPhase: number = 0;

  constructor(ctx: AudioContext, destinationNode: AudioNode) {
    this.ctx = ctx;
    this.destinationNode = destinationNode;
    this.initNodes();
  }

  private initNodes(): void {
    // Max delay buffer of 0.2s (enough for 20Hz full period = 0.05s)
    this.delayNode = this.ctx.createDelay(0.2);
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

    this.delayNode.connect(this.gainNode);
    this.gainNode.connect(this.destinationNode);
  }

  public start(): void {
    if (this.isRunning) return;
    if (!this.gainNode || !this.delayNode) this.initNodes();

    const now = this.ctx.currentTime;
    
    // Create new oscillator
    this.oscNode = this.ctx.createOscillator();
    this.oscNode.type = this.currentWaveform;
    this.oscNode.frequency.setValueAtTime(this.currentFrequency, now);

    // Set initial phase delay
    const delaySec = phaseToDelaySeconds(this.currentPhase, this.currentFrequency);
    this.delayNode!.delayTime.setValueAtTime(delaySec, now);

    this.oscNode.connect(this.delayNode!);
    this.oscNode.start(now);

    // Smoothly ramp gain up to avoid pops
    const targetGain = uiGainToAcousticGain(this.currentGain);
    this.gainNode!.gain.cancelScheduledValues(now);
    this.gainNode!.gain.setValueAtTime(0, now);
    smoothParamChange(this.gainNode!.gain, targetGain, now, 0.03);

    this.isRunning = true;
  }

  public stop(): void {
    if (!this.isRunning || !this.gainNode || !this.oscNode) return;

    const now = this.ctx.currentTime;
    const oscToStop = this.oscNode;
    this.oscNode = null;
    this.isRunning = false;

    // Smoothly ramp gain down before stopping oscillator
    this.gainNode.gain.cancelScheduledValues(now);
    smoothParamChange(this.gainNode.gain, 0, now, 0.02);

    setTimeout(() => {
      try {
        oscToStop.stop();
        oscToStop.disconnect();
      } catch {
        // Ignore if already stopped
      }
    }, 40);
  }

  public setFrequency(freq: number, rampDuration?: number): void {
    this.currentFrequency = Math.max(20, Math.min(500, freq));
    const now = this.ctx.currentTime;

    if (this.oscNode) {
      if (rampDuration && rampDuration > 0) {
        this.oscNode.frequency.cancelScheduledValues(now);
        this.oscNode.frequency.setValueAtTime(this.oscNode.frequency.value, now);
        this.oscNode.frequency.linearRampToValueAtTime(this.currentFrequency, now + rampDuration);
      } else {
        smoothParamChange(this.oscNode.frequency, this.currentFrequency, now);
      }
    }

    // Update phase delay for new frequency
    if (this.delayNode) {
      const delaySec = phaseToDelaySeconds(this.currentPhase, this.currentFrequency);
      smoothParamChange(this.delayNode.delayTime, delaySec, now);
    }
  }

  public setWaveform(waveform: WaveformType): void {
    this.currentWaveform = waveform;
    if (this.oscNode) {
      this.oscNode.type = waveform;
    }
  }

  public setGain(gain: number): void {
    this.currentGain = Math.max(0, Math.min(1, gain));
    if (this.isRunning && this.gainNode) {
      const targetGain = uiGainToAcousticGain(this.currentGain);
      smoothParamChange(this.gainNode.gain, targetGain, this.ctx.currentTime);
    }
  }

  public setPhase(phaseDegrees: number): void {
    this.currentPhase = ((phaseDegrees % 360) + 360) % 360;
    if (this.delayNode) {
      const delaySec = phaseToDelaySeconds(this.currentPhase, this.currentFrequency);
      smoothParamChange(this.delayNode.delayTime, delaySec, this.ctx.currentTime, 0.02);
    }
  }

  public getFrequency(): number {
    return this.currentFrequency;
  }

  public getPhase(): number {
    return this.currentPhase;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }
}
