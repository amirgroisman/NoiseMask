import type { SweepType } from '../types/audio';
import { ToneGenerator } from './ToneGenerator';

export type SweepProgressCallback = (currentVal: number, progressRatio: number) => void;
export type SweepCompleteCallback = () => void;

export class SweepEngine {
  private toneGenerator: ToneGenerator;

  private isFreqSweeping: boolean = false;
  private isPhaseSweeping: boolean = false;

  private animFrameId: number | null = null;
  private startTime: number = 0;
  private sweepDurationSec: number = 30;

  // Frequency sweep params
  private startFreq: number = 80;
  private endFreq: number = 150;
  private sweepType: SweepType = 'linear';

  // Phase sweep params
  private startPhase: number = 0;
  private endPhase: number = 360;

  private onProgressCb: SweepProgressCallback | null = null;
  private onCompleteCb: SweepCompleteCallback | null = null;

  constructor(toneGenerator: ToneGenerator) {
    this.toneGenerator = toneGenerator;
  }

  public startFrequencySweep(
    startFreq: number,
    endFreq: number,
    durationSec: number,
    sweepType: SweepType,
    onProgress: SweepProgressCallback,
    onComplete: SweepCompleteCallback
  ): void {
    this.stopSweep();

    this.startFreq = Math.max(20, Math.min(500, startFreq));
    this.endFreq = Math.max(20, Math.min(500, endFreq));
    this.sweepDurationSec = Math.max(1, durationSec);
    this.sweepType = sweepType;
    this.onProgressCb = onProgress;
    this.onCompleteCb = onComplete;

    this.isFreqSweeping = true;
    this.startTime = performance.now();

    // Ensure tone is playing
    this.toneGenerator.setFrequency(this.startFreq);
    if (!this.toneGenerator.getIsPlaying()) {
      this.toneGenerator.start();
    }

    this.tickFreqSweep();
  }

  private tickFreqSweep = (): void => {
    if (!this.isFreqSweeping) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    const progress = Math.min(1.0, elapsed / this.sweepDurationSec);

    let currentFreq: number;
    if (this.sweepType === 'logarithmic') {
      const logStart = Math.log(this.startFreq);
      const logEnd = Math.log(this.endFreq);
      currentFreq = Math.exp(logStart + progress * (logEnd - logStart));
    } else {
      currentFreq = this.startFreq + progress * (this.endFreq - this.startFreq);
    }

    this.toneGenerator.setFrequency(currentFreq);
    if (this.onProgressCb) {
      this.onProgressCb(currentFreq, progress);
    }

    if (progress >= 1.0) {
      this.isFreqSweeping = false;
      if (this.onCompleteCb) {
        this.onCompleteCb();
      }
    } else {
      this.animFrameId = requestAnimationFrame(this.tickFreqSweep);
    }
  };

  public startPhaseSweep(
    startPhase: number,
    endPhase: number,
    durationSec: number,
    onProgress: SweepProgressCallback,
    onComplete: SweepCompleteCallback
  ): void {
    this.stopSweep();

    this.startPhase = startPhase;
    this.endPhase = endPhase;
    this.sweepDurationSec = Math.max(1, durationSec);
    this.onProgressCb = onProgress;
    this.onCompleteCb = onComplete;

    this.isPhaseSweeping = true;
    this.startTime = performance.now();

    this.toneGenerator.setPhase(this.startPhase);
    if (!this.toneGenerator.getIsPlaying()) {
      this.toneGenerator.start();
    }

    this.tickPhaseSweep();
  }

  private tickPhaseSweep = (): void => {
    if (!this.isPhaseSweeping) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    const progress = Math.min(1.0, elapsed / this.sweepDurationSec);

    const currentPhase = this.startPhase + progress * (this.endPhase - this.startPhase);
    const normalizedPhase = ((currentPhase % 360) + 360) % 360;

    this.toneGenerator.setPhase(normalizedPhase);
    if (this.onProgressCb) {
      this.onProgressCb(normalizedPhase, progress);
    }

    if (progress >= 1.0) {
      this.isPhaseSweeping = false;
      if (this.onCompleteCb) {
        this.onCompleteCb();
      }
    } else {
      this.animFrameId = requestAnimationFrame(this.tickPhaseSweep);
    }
  };

  public stopSweep(): void {
    this.isFreqSweeping = false;
    this.isPhaseSweeping = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public isSweeping(): boolean {
    return this.isFreqSweeping || this.isPhaseSweeping;
  }

  public getSweepType(): 'frequency' | 'phase' | 'none' {
    if (this.isFreqSweeping) return 'frequency';
    if (this.isPhaseSweeping) return 'phase';
    return 'none';
  }
}
