import type { ExperimentPreset } from '../types/experiment';

export const MIN_FREQ_HZ = 20;
export const MAX_FREQ_HZ = 500;
export const DEFAULT_FREQ_HZ = 100.0;

export const NARROWBAND_PRESETS = {
  very_narrow: { label: 'Very Narrow (±5 Hz)', bw: 10 },
  narrow: { label: 'Narrow (±15 Hz)', bw: 30 },
  medium: { label: 'Medium (±40 Hz)', bw: 80 },
  wide: { label: 'Wide (±100 Hz)', bw: 200 },
} as const;

export const INITIAL_DEFAULT_PRESET: ExperimentPreset = {
  id: 'preset-default-hum',
  name: 'Low Frequency Hum Experiment',
  date: new Date().toISOString(),
  fundamentalFrequency: 100.0,
  toneWaveform: 'sine',
  toneGain: 0.3,
  phase: 0,
  toneEnabled: false,
  noiseEnabled: false,
  noiseType: 'narrowband',
  noiseCenterFrequency: 100.0,
  noiseBandwidth: 30,
  noiseGain: 0.25,
  harmonicsEnabled: false,
  harmonics: [
    { id: 1, harmonicNumber: 1, name: 'Fundamental (1x)', enabled: false, frequency: 100, gain: 0.3, phase: 0, manualOverride: false },
    { id: 2, harmonicNumber: 2, name: '2nd Harmonic (2x)', enabled: false, frequency: 200, gain: 0.2, phase: 0, manualOverride: false },
    { id: 3, harmonicNumber: 3, name: '3rd Harmonic (3x)', enabled: false, frequency: 300, gain: 0.1, phase: 0, manualOverride: false },
    { id: 4, harmonicNumber: 4, name: '4th Harmonic (4x)', enabled: false, frequency: 400, gain: 0.05, phase: 0, manualOverride: false },
  ],
  masterGain: 0.35,
  speakerPositionNotes: 'Right bedside table',
  listeningPositionNotes: 'Bedroom – Pillow Area',
  distanceNotes: 'Speaker ~40 cm from head',
  beforeRating: 7,
  afterRating: 3,
  notes: 'Baseline configuration for AC compressor hum cancellation/masking.',
};
