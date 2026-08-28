export type WaveformType = 'sine' | 'triangle' | 'square' | 'sawtooth';

export type NoiseType = 'white' | 'pink' | 'brown' | 'narrowband';

export type NarrowBandPreset = 'very_narrow' | 'narrow' | 'medium' | 'wide';

export interface ToneState {
  enabled: boolean;
  frequency: number; // 20 - 500 Hz (0.1 resolution)
  waveform: WaveformType;
  gain: number; // 0.0 - 1.0
  phase: number; // 0 - 360 deg
}

export interface NoiseState {
  enabled: boolean;
  type: NoiseType;
  gain: number; // 0.0 - 1.0
  centerFrequency: number; // 20 - 500 Hz
  bandwidth: number; // 1 - 200 Hz
}

export interface HarmonicItem {
  id: number;
  harmonicNumber: number; // 1 = Fundamental, 2 = 2nd, 3 = 3rd, 4 = 4th
  name: string;
  enabled: boolean;
  frequency: number;
  gain: number; // 0.0 - 1.0
  phase: number; // 0 - 360 deg
  manualOverride: boolean;
}

export type SweepMode = 'frequency' | 'phase';
export type SweepType = 'linear' | 'logarithmic';

export interface FreqSweepState {
  active: boolean;
  startFreq: number;
  endFreq: number;
  duration: number; // seconds
  sweepType: SweepType;
  currentFreq: number;
}

export interface PhaseSweepState {
  active: boolean;
  startPhase: number;
  endPhase: number;
  duration: number; // seconds
  currentPhase: number;
}

export interface SweepMark {
  id: string;
  timestamp: number;
  frequency: number;
  phase: number;
  gain: number;
  waveform: WaveformType;
  noiseEnabled: boolean;
  noiseType: NoiseType;
  noiseCenterFreq: number;
  noiseBandwidth: number;
  noiseGain: number;
  notes?: string;
}

export interface AudioEngineConfig {
  masterGain: number;
  isMuted: boolean;
  safetyAcknowledged: boolean;
}
