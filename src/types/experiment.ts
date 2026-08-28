import type { HarmonicItem, NoiseType, WaveformType } from './audio';

export interface ExperimentPreset {
  id: string;
  name: string;
  date: string;
  // Tone settings
  fundamentalFrequency: number;
  toneWaveform: WaveformType;
  toneGain: number;
  phase: number;
  toneEnabled: boolean;
  
  // Noise settings
  noiseEnabled: boolean;
  noiseType: NoiseType;
  noiseCenterFrequency: number;
  noiseBandwidth: number;
  noiseGain: number;
  
  // Harmonics settings
  harmonicsEnabled: boolean;
  harmonics: HarmonicItem[];
  
  // Global settings
  masterGain: number;
  
  // Position notes
  speakerPositionNotes: string;
  listeningPositionNotes: string;
  distanceNotes: string;
  
  // Subjective noise ratings (0-10)
  beforeRating: number;
  afterRating: number;
  notes: string;
}

export type ABChoice = 'A' | 'B' | 'SAME';

export interface ABTrialResult {
  round: number;
  choice: ABChoice;
  assignedA: 'silence' | 'config';
  assignedB: 'silence' | 'config';
  preferred: 'silence' | 'config' | 'same';
}

export interface ABExperimentState {
  isActive: boolean;
  mode: 'standard' | 'blind';
  currentIntervalState: 'A' | 'B' | 'transition' | 'rating' | 'complete';
  intervalDuration: number; // 3, 5, 10 seconds
  currentRound: number;
  totalRounds: number;
  currentTrial?: {
    assignedA: 'silence' | 'config';
    assignedB: 'silence' | 'config';
  };
  results: ABTrialResult[];
  timeLeftInInterval: number;
}

export interface DetectedPeak {
  frequency: number;
  magnitude: number;
  prominence: number;
  db: number;
}
