import type { HarmonicItem } from '../types/audio';
import { phaseToDelaySeconds, smoothParamChange, uiGainToAcousticGain } from './AudioUtils';

interface HarmonicVoice {
  oscNode: OscillatorNode | null;
  delayNode: DelayNode;
  gainNode: GainNode;
  isRunning: boolean;
}

export class HarmonicGenerator {
  private ctx: AudioContext;
  private destinationNode: AudioNode;

  private fundamentalFreq: number = 100;
  private voices: Map<number, HarmonicVoice> = new Map();
  private harmonicsState: HarmonicItem[] = [
    { id: 1, harmonicNumber: 1, name: 'Fundamental (1x)', enabled: false, frequency: 100, gain: 0.3, phase: 0, manualOverride: false },
    { id: 2, harmonicNumber: 2, name: '2nd Harmonic (2x)', enabled: false, frequency: 200, gain: 0.2, phase: 0, manualOverride: false },
    { id: 3, harmonicNumber: 3, name: '3rd Harmonic (3x)', enabled: false, frequency: 300, gain: 0.1, phase: 0, manualOverride: false },
    { id: 4, harmonicNumber: 4, name: '4th Harmonic (4x)', enabled: false, frequency: 400, gain: 0.05, phase: 0, manualOverride: false },
  ];

  constructor(ctx: AudioContext, destinationNode: AudioNode) {
    this.ctx = ctx;
    this.destinationNode = destinationNode;
    this.initVoices();
  }

  private initVoices(): void {
    for (const h of this.harmonicsState) {
      const delayNode = this.ctx.createDelay(0.2);
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

      delayNode.connect(gainNode);
      gainNode.connect(this.destinationNode);

      this.voices.set(h.harmonicNumber, {
        oscNode: null,
        delayNode,
        gainNode,
        isRunning: false,
      });
    }
  }

  public setFundamental(freq: number): void {
    this.fundamentalFreq = Math.max(20, Math.min(500, freq));
    for (const h of this.harmonicsState) {
      if (!h.manualOverride) {
        h.frequency = Math.min(2000, this.fundamentalFreq * h.harmonicNumber);
      }
      this.updateVoice(h.harmonicNumber);
    }
  }

  public setHarmonicEnabled(harmonicNumber: number, enabled: boolean): void {
    const item = this.harmonicsState.find(h => h.harmonicNumber === harmonicNumber);
    if (!item) return;
    item.enabled = enabled;
    if (enabled) {
      this.startVoice(harmonicNumber);
    } else {
      this.stopVoice(harmonicNumber);
    }
  }

  public setHarmonicFrequency(harmonicNumber: number, freq: number, manualOverride: boolean = true): void {
    const item = this.harmonicsState.find(h => h.harmonicNumber === harmonicNumber);
    if (!item) return;
    item.frequency = Math.max(20, Math.min(2000, freq));
    item.manualOverride = manualOverride;
    this.updateVoice(harmonicNumber);
  }

  public setHarmonicGain(harmonicNumber: number, gain: number): void {
    const item = this.harmonicsState.find(h => h.harmonicNumber === harmonicNumber);
    if (!item) return;
    item.gain = Math.max(0, Math.min(1, gain));
    this.updateVoice(harmonicNumber);
  }

  public setHarmonicPhase(harmonicNumber: number, phase: number): void {
    const item = this.harmonicsState.find(h => h.harmonicNumber === harmonicNumber);
    if (!item) return;
    item.phase = ((phase % 360) + 360) % 360;
    this.updateVoice(harmonicNumber);
  }

  public setAllHarmonics(items: HarmonicItem[]): void {
    this.harmonicsState = items.map(it => ({ ...it }));
    for (const item of this.harmonicsState) {
      if (item.enabled) {
        this.startVoice(item.harmonicNumber);
      } else {
        this.stopVoice(item.harmonicNumber);
      }
      this.updateVoice(item.harmonicNumber);
    }
  }

  private startVoice(harmonicNumber: number): void {
    const voice = this.voices.get(harmonicNumber);
    const item = this.harmonicsState.find(h => h.harmonicNumber === harmonicNumber);
    if (!voice || !item || voice.isRunning) return;

    const now = this.ctx.currentTime;
    voice.oscNode = this.ctx.createOscillator();
    voice.oscNode.type = 'sine';
    voice.oscNode.frequency.setValueAtTime(item.frequency, now);

    const delaySec = phaseToDelaySeconds(item.phase, item.frequency);
    voice.delayNode.delayTime.setValueAtTime(delaySec, now);

    voice.oscNode.connect(voice.delayNode);
    voice.oscNode.start(now);

    const targetGain = uiGainToAcousticGain(item.gain);
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setValueAtTime(0, now);
    smoothParamChange(voice.gainNode.gain, targetGain, now, 0.03);

    voice.isRunning = true;
  }

  private stopVoice(harmonicNumber: number): void {
    const voice = this.voices.get(harmonicNumber);
    if (!voice || !voice.isRunning || !voice.oscNode) return;

    const now = this.ctx.currentTime;
    const oscToStop = voice.oscNode;
    voice.oscNode = null;
    voice.isRunning = false;

    voice.gainNode.gain.cancelScheduledValues(now);
    smoothParamChange(voice.gainNode.gain, 0, now, 0.02);

    setTimeout(() => {
      try {
        oscToStop.stop();
        oscToStop.disconnect();
      } catch {
        // ignore
      }
    }, 40);
  }

  private updateVoice(harmonicNumber: number): void {
    const voice = this.voices.get(harmonicNumber);
    const item = this.harmonicsState.find(h => h.harmonicNumber === harmonicNumber);
    if (!voice || !item) return;

    const now = this.ctx.currentTime;
    if (voice.oscNode) {
      smoothParamChange(voice.oscNode.frequency, item.frequency, now);
    }

    const delaySec = phaseToDelaySeconds(item.phase, item.frequency);
    smoothParamChange(voice.delayNode.delayTime, delaySec, now);

    if (voice.isRunning) {
      const targetGain = uiGainToAcousticGain(item.gain);
      smoothParamChange(voice.gainNode.gain, targetGain, now);
    }
  }

  public stopAll(): void {
    for (const h of this.harmonicsState) {
      this.stopVoice(h.harmonicNumber);
    }
  }

  public getHarmonicsState(): HarmonicItem[] {
    return [...this.harmonicsState];
  }
}
