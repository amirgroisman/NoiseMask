import { useCallback, useEffect, useRef } from 'react';
import { AudioEngine } from '../audio/AudioEngine';
import { useAudioStore } from '../store/audioStore';
import { useExperimentStore } from '../store/experimentStore';
import type { ABChoice, ABTrialResult } from '../types/experiment';

export function useABExperiment() {
  const engine = AudioEngine.getInstance();

  const abState = useExperimentStore((s) => s.abExperiment);
  const updateAB = useExperimentStore((s) => s.updateABExperiment);
  const recordResult = useExperimentStore((s) => s.recordABResult);
  const resetAB = useExperimentStore((s) => s.resetABExperiment);

  const tone = useAudioStore((s) => s.tone);
  const noise = useAudioStore((s) => s.noise);
  const harmonics = useAudioStore((s) => s.harmonics);

  const timerRef = useRef<number | null>(null);

  // Apply state (Silence vs Config) smoothly
  const applyAudioState = useCallback(
    async (target: 'silence' | 'config') => {
      await engine.initAudio();

      if (target === 'silence') {
        if (engine.toneGenerator) engine.toneGenerator.stop();
        if (engine.noiseGenerator) engine.noiseGenerator.stop();
        if (engine.harmonicGenerator) engine.harmonicGenerator.stopAll();
      } else {
        if (tone.enabled && engine.toneGenerator) {
          engine.toneGenerator.setFrequency(tone.frequency);
          engine.toneGenerator.setWaveform(tone.waveform);
          engine.toneGenerator.setGain(tone.gain);
          engine.toneGenerator.setPhase(tone.phase);
          engine.toneGenerator.start();
        }
        if (noise.enabled && engine.noiseGenerator) {
          engine.noiseGenerator.setType(noise.type);
          engine.noiseGenerator.setCenterFrequency(noise.centerFrequency);
          engine.noiseGenerator.setBandwidth(noise.bandwidth);
          engine.noiseGenerator.setGain(noise.gain);
          engine.noiseGenerator.start();
        }
        if (harmonics.some((h) => h.enabled) && engine.harmonicGenerator) {
          engine.harmonicGenerator.setAllHarmonics(harmonics);
        }
      }
    },
    [engine, tone, noise, harmonics]
  );

  // Start Experiment
  const startExperiment = useCallback(
    async (mode: 'standard' | 'blind' = 'standard', duration: number = 5, totalRounds: number = 5) => {
      await engine.initAudio();

      // Determine mapping for round 1
      let assignedA: 'silence' | 'config' = 'silence';
      let assignedB: 'silence' | 'config' = 'config';

      if (mode === 'blind') {
        const coin = Math.random() > 0.5;
        assignedA = coin ? 'config' : 'silence';
        assignedB = coin ? 'silence' : 'config';
      }

      updateAB({
        isActive: true,
        mode,
        intervalDuration: duration,
        totalRounds,
        currentRound: 1,
        currentIntervalState: 'A',
        timeLeftInInterval: duration,
        results: [],
        currentTrial: { assignedA, assignedB },
      });

      applyAudioState(assignedA);
    },
    [engine, updateAB, applyAudioState]
  );

  // Stop / Cancel Experiment
  const stopExperiment = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    applyAudioState('silence');
    resetAB();
  }, [applyAudioState, resetAB]);

  // Main countdown & interval progression loop
  useEffect(() => {
    if (!abState.isActive || abState.currentIntervalState === 'rating' || abState.currentIntervalState === 'complete') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      const currentTimeLeft = abState.timeLeftInInterval;

      if (currentTimeLeft > 1) {
        updateAB({ timeLeftInInterval: currentTimeLeft - 1 });
      } else {
        // Transition to next state
        if (abState.currentIntervalState === 'A') {
          // Switch to state B
          const target = abState.currentTrial?.assignedB || 'config';
          applyAudioState(target);
          updateAB({
            currentIntervalState: 'B',
            timeLeftInInterval: abState.intervalDuration,
          });
        } else if (abState.currentIntervalState === 'B') {
          // Finished interval B -> Go to Rating prompt
          applyAudioState('silence');
          updateAB({
            currentIntervalState: 'rating',
            timeLeftInInterval: 0,
          });
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [abState, updateAB, applyAudioState]);

  // Submit round rating
  const submitChoice = useCallback(
    (choice: ABChoice) => {
      const trial = abState.currentTrial || { assignedA: 'silence', assignedB: 'config' };

      let preferred: 'silence' | 'config' | 'same' = 'same';
      if (choice === 'A') preferred = trial.assignedA;
      else if (choice === 'B') preferred = trial.assignedB;

      const resultItem: ABTrialResult = {
        round: abState.currentRound,
        choice,
        assignedA: trial.assignedA,
        assignedB: trial.assignedB,
        preferred,
      };

      recordResult(resultItem);

      if (abState.currentRound >= abState.totalRounds) {
        // All rounds complete
        updateAB({
          currentIntervalState: 'complete',
          isActive: false,
        });
      } else {
        // Setup next round
        const nextRound = abState.currentRound + 1;
        let assignedA: 'silence' | 'config' = 'silence';
        let assignedB: 'silence' | 'config' = 'config';

        if (abState.mode === 'blind') {
          const coin = Math.random() > 0.5;
          assignedA = coin ? 'config' : 'silence';
          assignedB = coin ? 'silence' : 'config';
        }

        updateAB({
          currentRound: nextRound,
          currentIntervalState: 'A',
          timeLeftInInterval: abState.intervalDuration,
          currentTrial: { assignedA, assignedB },
        });

        applyAudioState(assignedA);
      }
    },
    [abState, recordResult, updateAB, applyAudioState]
  );

  return {
    abState,
    startExperiment,
    stopExperiment,
    submitChoice,
  };
}
