import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SweepMark } from '../types/audio';
import type { ABExperimentState, ABTrialResult, ExperimentPreset } from '../types/experiment';
import { INITIAL_DEFAULT_PRESET } from '../utils/constants';

interface ExperimentStoreState {
  presets: ExperimentPreset[];
  activePresetId: string | null;
  marks: SweepMark[];

  // Current session notes & subjective ratings
  speakerPositionNotes: string;
  listeningPositionNotes: string;
  distanceNotes: string;
  beforeRating: number;
  afterRating: number;
  sessionNotes: string;

  // A/B Experiment testing state
  abExperiment: ABExperimentState;

  // Actions
  saveCurrentAsPreset: (name: string, currentAudioConfig: Omit<ExperimentPreset, 'id' | 'name' | 'date'>) => ExperimentPreset;
  updatePreset: (id: string, updates: Partial<ExperimentPreset>) => void;
  deletePreset: (id: string) => void;
  duplicatePreset: (id: string) => ExperimentPreset | null;
  setActivePresetId: (id: string | null) => void;

  addMark: (mark: Omit<SweepMark, 'id' | 'timestamp'>) => void;
  deleteMark: (id: string) => void;
  clearMarks: () => void;

  setSpeakerPositionNotes: (notes: string) => void;
  setListeningPositionNotes: (notes: string) => void;
  setDistanceNotes: (notes: string) => void;
  setBeforeRating: (rating: number) => void;
  setAfterRating: (rating: number) => void;
  setSessionNotes: (notes: string) => void;

  updateABExperiment: (updates: Partial<ABExperimentState>) => void;
  recordABResult: (result: ABTrialResult) => void;
  resetABExperiment: () => void;
}

const INITIAL_AB_STATE: ABExperimentState = {
  isActive: false,
  mode: 'standard',
  currentIntervalState: 'A',
  intervalDuration: 5,
  currentRound: 1,
  totalRounds: 5,
  results: [],
  timeLeftInInterval: 5,
};

export const useExperimentStore = create<ExperimentStoreState>()(
  persist(
    (set, get) => ({
      presets: [INITIAL_DEFAULT_PRESET],
      activePresetId: INITIAL_DEFAULT_PRESET.id,
      marks: [],

      speakerPositionNotes: INITIAL_DEFAULT_PRESET.speakerPositionNotes,
      listeningPositionNotes: INITIAL_DEFAULT_PRESET.listeningPositionNotes,
      distanceNotes: INITIAL_DEFAULT_PRESET.distanceNotes,
      beforeRating: 7,
      afterRating: 3,
      sessionNotes: INITIAL_DEFAULT_PRESET.notes,

      abExperiment: INITIAL_AB_STATE,

      saveCurrentAsPreset: (name, currentAudioConfig) => {
        const newPreset: ExperimentPreset = {
          ...currentAudioConfig,
          id: 'preset-' + Date.now(),
          name: name.trim() || 'Experiment ' + (get().presets.length + 1),
          date: new Date().toISOString(),
        };

        set((state) => ({
          presets: [newPreset, ...state.presets],
          activePresetId: newPreset.id,
        }));

        return newPreset;
      },

      updatePreset: (id, updates) => {
        set((state) => ({
          presets: state.presets.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deletePreset: (id) => {
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
          activePresetId: state.activePresetId === id ? null : state.activePresetId,
        }));
      },

      duplicatePreset: (id) => {
        const target = get().presets.find((p) => p.id === id);
        if (!target) return null;

        const duplicated: ExperimentPreset = {
          ...target,
          id: 'preset-' + Date.now(),
          name: `${target.name} (Copy)`,
          date: new Date().toISOString(),
        };

        set((state) => ({
          presets: [duplicated, ...state.presets],
          activePresetId: duplicated.id,
        }));

        return duplicated;
      },

      setActivePresetId: (id) => set({ activePresetId: id }),

      addMark: (mark) => {
        const newMark: SweepMark = {
          ...mark,
          id: 'mark-' + Date.now(),
          timestamp: Date.now(),
        };
        set((state) => ({
          marks: [newMark, ...state.marks],
        }));
      },

      deleteMark: (id) => {
        set((state) => ({
          marks: state.marks.filter((m) => m.id !== id),
        }));
      },

      clearMarks: () => set({ marks: [] }),

      setSpeakerPositionNotes: (speakerPositionNotes) => set({ speakerPositionNotes }),
      setListeningPositionNotes: (listeningPositionNotes) => set({ listeningPositionNotes }),
      setDistanceNotes: (distanceNotes) => set({ distanceNotes }),
      setBeforeRating: (beforeRating) => set({ beforeRating: Math.max(0, Math.min(10, beforeRating)) }),
      setAfterRating: (afterRating) => set({ afterRating: Math.max(0, Math.min(10, afterRating)) }),
      setSessionNotes: (sessionNotes) => set({ sessionNotes }),

      updateABExperiment: (updates) =>
        set((state) => ({
          abExperiment: { ...state.abExperiment, ...updates },
        })),

      recordABResult: (result) =>
        set((state) => ({
          abExperiment: {
            ...state.abExperiment,
            results: [...state.abExperiment.results, result],
          },
        })),

      resetABExperiment: () =>
        set({
          abExperiment: INITIAL_AB_STATE,
        }),
    }),
    {
      name: 'low-frequency-noise-lab-experiments',
      partialize: (state) => ({
        presets: state.presets,
        marks: state.marks,
        speakerPositionNotes: state.speakerPositionNotes,
        listeningPositionNotes: state.listeningPositionNotes,
        distanceNotes: state.distanceNotes,
        beforeRating: state.beforeRating,
        afterRating: state.afterRating,
        sessionNotes: state.sessionNotes,
      }),
    }
  )
);
