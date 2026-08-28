import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FreqSweepState, HarmonicItem, NoiseState, PhaseSweepState, ToneState, WaveformType } from '../types/audio';
import type { ExperimentPreset } from '../types/experiment';
import { DEFAULT_FREQ_HZ } from '../utils/constants';

interface AudioStoreState {
  safetyAcknowledged: boolean;
  masterVolume: number;
  isMuted: boolean;
  isAudioActive: boolean;

  // Tone Generator
  tone: ToneState;

  // Noise Generator
  noise: NoiseState;

  // Harmonics
  harmonics: HarmonicItem[];

  // Sweeps
  freqSweep: FreqSweepState;
  phaseSweep: PhaseSweepState;

  // Actions
  setSafetyAcknowledged: (ack: boolean) => void;
  setMasterVolume: (vol: number) => void;
  toggleMute: () => void;
  setIsAudioActive: (active: boolean) => void;

  setToneEnabled: (enabled: boolean) => void;
  setToneFrequency: (freq: number) => void;
  setToneWaveform: (waveform: WaveformType) => void;
  setToneGain: (gain: number) => void;
  setTonePhase: (phase: number) => void;

  setNoiseEnabled: (enabled: boolean) => void;
  setNoiseType: (type: NoiseState['type']) => void;
  setNoiseGain: (gain: number) => void;
  setNoiseCenterFreq: (freq: number) => void;
  setNoiseBandwidth: (bw: number) => void;

  setHarmonicEnabled: (harmonicNumber: number, enabled: boolean) => void;
  setHarmonicGain: (harmonicNumber: number, gain: number) => void;
  setHarmonicPhase: (harmonicNumber: number, phase: number) => void;
  setHarmonicFrequency: (harmonicNumber: number, freq: number) => void;
  setAllHarmonics: (harmonics: HarmonicItem[]) => void;

  setFreqSweep: (sweep: Partial<FreqSweepState>) => void;
  setPhaseSweep: (sweep: Partial<PhaseSweepState>) => void;

  loadPresetToAudioState: (preset: ExperimentPreset) => void;
  stopAll: () => void;
}

export const useAudioStore = create<AudioStoreState>()(
  persist(
    (set) => ({
      safetyAcknowledged: false,
      masterVolume: 0.35,
      isMuted: false,
      isAudioActive: false,

      tone: {
        enabled: false,
        frequency: DEFAULT_FREQ_HZ,
        waveform: 'sine',
        gain: 0.3,
        phase: 0,
      },

      noise: {
        enabled: false,
        type: 'narrowband',
        gain: 0.25,
        centerFrequency: DEFAULT_FREQ_HZ,
        bandwidth: 30,
      },

      harmonics: [
        { id: 1, harmonicNumber: 1, name: 'Fundamental (1x)', enabled: false, frequency: 100, gain: 0.3, phase: 0, manualOverride: false },
        { id: 2, harmonicNumber: 2, name: '2nd Harmonic (2x)', enabled: false, frequency: 200, gain: 0.2, phase: 0, manualOverride: false },
        { id: 3, harmonicNumber: 3, name: '3rd Harmonic (3x)', enabled: false, frequency: 300, gain: 0.1, phase: 0, manualOverride: false },
        { id: 4, harmonicNumber: 4, name: '4th Harmonic (4x)', enabled: false, frequency: 400, gain: 0.05, phase: 0, manualOverride: false },
      ],

      freqSweep: {
        active: false,
        startFreq: 80,
        endFreq: 150,
        duration: 30,
        sweepType: 'linear',
        currentFreq: 80,
      },

      phaseSweep: {
        active: false,
        startPhase: 0,
        endPhase: 360,
        duration: 30,
        currentPhase: 0,
      },

      setSafetyAcknowledged: (ack) => set({ safetyAcknowledged: ack }),
      setMasterVolume: (vol) => set({ masterVolume: Math.max(0, Math.min(1, vol)) }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setIsAudioActive: (active) => set({ isAudioActive: active }),

      setToneEnabled: (enabled) =>
        set((state) => ({
          tone: { ...state.tone, enabled },
          isAudioActive: enabled || state.noise.enabled || state.harmonics.some(h => h.enabled),
        })),

      setToneFrequency: (frequency) =>
        set((state) => {
          const clamped = Math.round(Math.max(20, Math.min(500, frequency)) * 10) / 10;
          // Update linked harmonics
          const updatedHarmonics = state.harmonics.map((h) => {
            if (!h.manualOverride) {
              return { ...h, frequency: Math.min(2000, clamped * h.harmonicNumber) };
            }
            return h;
          });
          return {
            tone: { ...state.tone, frequency: clamped },
            harmonics: updatedHarmonics,
          };
        }),

      setToneWaveform: (waveform) =>
        set((state) => ({ tone: { ...state.tone, waveform } })),

      setToneGain: (gain) =>
        set((state) => ({ tone: { ...state.tone, gain: Math.max(0, Math.min(1, gain)) } })),

      setTonePhase: (phase) =>
        set((state) => ({
          tone: { ...state.tone, phase: Math.round((((phase % 360) + 360) % 360) * 10) / 10 },
        })),

      setNoiseEnabled: (enabled) =>
        set((state) => ({
          noise: { ...state.noise, enabled },
          isAudioActive: enabled || state.tone.enabled || state.harmonics.some(h => h.enabled),
        })),

      setNoiseType: (type) =>
        set((state) => ({ noise: { ...state.noise, type } })),

      setNoiseGain: (gain) =>
        set((state) => ({ noise: { ...state.noise, gain: Math.max(0, Math.min(1, gain)) } })),

      setNoiseCenterFreq: (centerFrequency) =>
        set((state) => ({
          noise: { ...state.noise, centerFrequency: Math.round(Math.max(20, Math.min(500, centerFrequency)) * 10) / 10 },
        })),

      setNoiseBandwidth: (bandwidth) =>
        set((state) => ({
          noise: { ...state.noise, bandwidth: Math.max(1, Math.min(200, bandwidth)) },
        })),

      setHarmonicEnabled: (harmonicNumber, enabled) =>
        set((state) => {
          const updatedHarmonics = state.harmonics.map((h) =>
            h.harmonicNumber === harmonicNumber ? { ...h, enabled } : h
          );
          return {
            harmonics: updatedHarmonics,
            isAudioActive: state.tone.enabled || state.noise.enabled || updatedHarmonics.some(h => h.enabled),
          };
        }),

      setHarmonicGain: (harmonicNumber, gain) =>
        set((state) => ({
          harmonics: state.harmonics.map((h) =>
            h.harmonicNumber === harmonicNumber ? { ...h, gain: Math.max(0, Math.min(1, gain)) } : h
          ),
        })),

      setHarmonicPhase: (harmonicNumber, phase) =>
        set((state) => ({
          harmonics: state.harmonics.map((h) =>
            h.harmonicNumber === harmonicNumber ? { ...h, phase: (((phase % 360) + 360) % 360) } : h
          ),
        })),

      setHarmonicFrequency: (harmonicNumber, frequency) =>
        set((state) => ({
          harmonics: state.harmonics.map((h) =>
            h.harmonicNumber === harmonicNumber ? { ...h, frequency: Math.max(20, Math.min(2000, frequency)), manualOverride: true } : h
          ),
        })),

      setAllHarmonics: (harmonics) => set({ harmonics }),

      setFreqSweep: (sweep) =>
        set((state) => ({ freqSweep: { ...state.freqSweep, ...sweep } })),

      setPhaseSweep: (sweep) =>
        set((state) => ({ phaseSweep: { ...state.phaseSweep, ...sweep } })),

      loadPresetToAudioState: (preset) =>
        set({
          tone: {
            enabled: preset.toneEnabled,
            frequency: preset.fundamentalFrequency,
            waveform: preset.toneWaveform,
            gain: preset.toneGain,
            phase: preset.phase,
          },
          noise: {
            enabled: preset.noiseEnabled,
            type: preset.noiseType,
            gain: preset.noiseGain,
            centerFrequency: preset.noiseCenterFrequency,
            bandwidth: preset.noiseBandwidth,
          },
          harmonics: preset.harmonics,
          masterVolume: preset.masterGain,
          isAudioActive: preset.toneEnabled || preset.noiseEnabled || preset.harmonics.some(h => h.enabled),
        }),

      stopAll: () =>
        set((state) => ({
          isAudioActive: false,
          tone: { ...state.tone, enabled: false },
          noise: { ...state.noise, enabled: false },
          harmonics: state.harmonics.map(h => ({ ...h, enabled: false })),
          freqSweep: { ...state.freqSweep, active: false },
          phaseSweep: { ...state.phaseSweep, active: false },
        })),
    }),
    {
      name: 'low-frequency-noise-lab-audio',
      partialize: (state) => ({
        safetyAcknowledged: state.safetyAcknowledged,
        masterVolume: state.masterVolume,
        tone: {
          frequency: state.tone.frequency,
          waveform: state.tone.waveform,
          gain: state.tone.gain,
          phase: state.tone.phase,
        },
        noise: {
          type: state.noise.type,
          gain: state.noise.gain,
          centerFrequency: state.noise.centerFrequency,
          bandwidth: state.noise.bandwidth,
        },
        harmonics: state.harmonics.map(h => ({ ...h, enabled: false })),
      }),
    }
  )
);
