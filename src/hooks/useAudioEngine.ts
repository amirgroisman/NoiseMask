import { useCallback, useEffect, useRef } from 'react';
import { AudioEngine } from '../audio/AudioEngine';
import { useAudioStore } from '../store/audioStore';

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine>(AudioEngine.getInstance());
  const engine = engineRef.current;

  const safetyAcknowledged = useAudioStore((s) => s.safetyAcknowledged);
  const masterVolume = useAudioStore((s) => s.masterVolume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const tone = useAudioStore((s) => s.tone);
  const noise = useAudioStore((s) => s.noise);
  const harmonics = useAudioStore((s) => s.harmonics);

  const setSafetyAcknowledged = useAudioStore((s) => s.setSafetyAcknowledged);
  const setIsAudioActive = useAudioStore((s) => s.setIsAudioActive);
  const stopAllStore = useAudioStore((s) => s.stopAll);

  // Initialize AudioContext on user action
  const ensureAudioInit = useCallback(async () => {
    await engine.initAudio();
  }, [engine]);

  // Sync Master Volume & Mute
  useEffect(() => {
    if (engine.isInitialized()) {
      engine.setMasterVolume(masterVolume);
      engine.setMuted(isMuted);
    }
  }, [masterVolume, isMuted, engine]);

  // Sync Tone Generator parameters
  useEffect(() => {
    if (engine.isInitialized() && engine.toneGenerator) {
      engine.toneGenerator.setFrequency(tone.frequency);
      engine.toneGenerator.setWaveform(tone.waveform);
      engine.toneGenerator.setGain(tone.gain);
      engine.toneGenerator.setPhase(tone.phase);

      if (tone.enabled && !engine.toneGenerator.getIsPlaying()) {
        engine.toneGenerator.start();
      } else if (!tone.enabled && engine.toneGenerator.getIsPlaying()) {
        engine.toneGenerator.stop();
      }
    }
  }, [tone, engine]);

  // Sync Noise Generator parameters
  useEffect(() => {
    if (engine.isInitialized() && engine.noiseGenerator) {
      engine.noiseGenerator.setType(noise.type);
      engine.noiseGenerator.setCenterFrequency(noise.centerFrequency);
      engine.noiseGenerator.setBandwidth(noise.bandwidth);
      engine.noiseGenerator.setGain(noise.gain);

      if (noise.enabled && !engine.noiseGenerator.getIsPlaying()) {
        engine.noiseGenerator.start();
      } else if (!noise.enabled && engine.noiseGenerator.getIsPlaying()) {
        engine.noiseGenerator.stop();
      }
    }
  }, [noise, engine]);

  // Sync Harmonics Generator parameters
  useEffect(() => {
    if (engine.isInitialized() && engine.harmonicGenerator) {
      engine.harmonicGenerator.setAllHarmonics(harmonics);
    }
  }, [harmonics, engine]);

  // Master Stop Action
  const stopAll = useCallback(() => {
    if (engine.isInitialized()) {
      engine.stopAll();
    }
    stopAllStore();
    setIsAudioActive(false);
  }, [engine, stopAllStore, setIsAudioActive]);

  // Toggle Tone
  const toggleTone = useCallback(async () => {
    await ensureAudioInit();
    const willEnable = !tone.enabled;
    useAudioStore.getState().setToneEnabled(willEnable);
  }, [ensureAudioInit, tone.enabled]);

  // Toggle Noise
  const toggleNoise = useCallback(async () => {
    await ensureAudioInit();
    const willEnable = !noise.enabled;
    useAudioStore.getState().setNoiseEnabled(willEnable);
  }, [ensureAudioInit, noise.enabled]);

  // Toggle Harmonic
  const toggleHarmonic = useCallback(
    async (harmonicNumber: number) => {
      await ensureAudioInit();
      const current = harmonics.find((h) => h.harmonicNumber === harmonicNumber);
      if (current) {
        useAudioStore.getState().setHarmonicEnabled(harmonicNumber, !current.enabled);
      }
    },
    [ensureAudioInit, harmonics]
  );

  return {
    engine,
    safetyAcknowledged,
    setSafetyAcknowledged,
    ensureAudioInit,
    stopAll,
    toggleTone,
    toggleNoise,
    toggleHarmonic,
  };
}
