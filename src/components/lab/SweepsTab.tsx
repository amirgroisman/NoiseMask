import React, { useState, useEffect } from 'react';
import { Play, Square as StopIcon, Bookmark, Trash2, Check, ArrowRight, Activity, Disc } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';
import { useExperimentStore } from '../../store/experimentStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import type { SweepType } from '../../types/audio';

export const SweepsTab: React.FC = () => {
  const tone = useAudioStore((s) => s.tone);
  const noise = useAudioStore((s) => s.noise);
  const setToneFrequency = useAudioStore((s) => s.setToneFrequency);
  const setTonePhase = useAudioStore((s) => s.setTonePhase);
  const setToneEnabled = useAudioStore((s) => s.setToneEnabled);

  const marks = useExperimentStore((s) => s.marks);
  const addMark = useExperimentStore((s) => s.addMark);
  const deleteMark = useExperimentStore((s) => s.deleteMark);
  const clearMarks = useExperimentStore((s) => s.clearMarks);

  const { engine, ensureAudioInit } = useAudioEngine();

  // Frequency Sweep Local State
  const [freqStart, setFreqStart] = useState<number>(80);
  const [freqEnd, setFreqEnd] = useState<number>(150);
  const [freqDuration, setFreqDuration] = useState<number>(30);
  const [freqType, setFreqType] = useState<SweepType>('linear');
  const [isFreqRunning, setIsFreqRunning] = useState<boolean>(false);
  const [liveFreq, setLiveFreq] = useState<number>(80);
  const [freqProgress, setFreqProgress] = useState<number>(0);

  // Phase Sweep Local State
  const [phaseStart, setPhaseStart] = useState<number>(0);
  const [phaseEnd, setPhaseEnd] = useState<number>(360);
  const [phaseDuration, setPhaseDuration] = useState<number>(30);
  const [isPhaseRunning, setIsPhaseRunning] = useState<boolean>(false);
  const [livePhase, setLivePhase] = useState<number>(0);
  const [phaseProgress, setPhaseProgress] = useState<number>(0);

  const [lastMarkedId, setLastMarkedId] = useState<string | null>(null);

  // Sync with engine sweep state
  useEffect(() => {
    return () => {
      if (engine.sweepEngine) {
        engine.sweepEngine.stopSweep();
      }
    };
  }, [engine]);

  // Start Frequency Sweep
  const handleStartFreqSweep = async () => {
    await ensureAudioInit();
    setToneEnabled(true);
    setIsFreqRunning(true);
    setIsPhaseRunning(false);

    engine.sweepEngine.startFrequencySweep(
      freqStart,
      freqEnd,
      freqDuration,
      freqType,
      (currentVal, progress) => {
        setLiveFreq(Math.round(currentVal * 10) / 10);
        setFreqProgress(progress);
        useAudioStore.getState().setToneFrequency(currentVal);
      },
      () => {
        setIsFreqRunning(false);
        setFreqProgress(1.0);
      }
    );
  };

  const handleStopFreqSweep = () => {
    engine.sweepEngine.stopSweep();
    setIsFreqRunning(false);
  };

  // Start Phase Sweep
  const handleStartPhaseSweep = async () => {
    await ensureAudioInit();
    setToneEnabled(true);
    setIsPhaseRunning(true);
    setIsFreqRunning(false);

    engine.sweepEngine.startPhaseSweep(
      phaseStart,
      phaseEnd,
      phaseDuration,
      (currentVal, progress) => {
        setLivePhase(Math.round(currentVal * 10) / 10);
        setPhaseProgress(progress);
        useAudioStore.getState().setTonePhase(currentVal);
      },
      () => {
        setIsPhaseRunning(false);
        setPhaseProgress(1.0);
      }
    );
  };

  const handleStopPhaseSweep = () => {
    engine.sweepEngine.stopSweep();
    setIsPhaseRunning(false);
  };

  // Mark Current Acoustic Position
  const handleMarkCurrent = () => {
    addMark({
      frequency: tone.frequency,
      phase: tone.phase,
      gain: tone.gain,
      waveform: tone.waveform,
      noiseEnabled: noise.enabled,
      noiseType: noise.type,
      noiseCenterFreq: noise.centerFrequency,
      noiseBandwidth: noise.bandwidth,
      noiseGain: noise.gain,
      notes: isFreqRunning ? 'Marked during Frequency Sweep' : isPhaseRunning ? 'Marked during Phase Sweep' : 'Manual Mark',
    });
    setLastMarkedId('marked-' + Date.now());
    setTimeout(() => setLastMarkedId(null), 2000);
  };

  // Apply marked item to Tone Generator
  const handleApplyMark = async (mark: typeof marks[0]) => {
    await ensureAudioInit();
    setToneFrequency(mark.frequency);
    setTonePhase(mark.phase);
    useAudioStore.getState().setToneGain(mark.gain);
    useAudioStore.getState().setToneWaveform(mark.waveform);
    setToneEnabled(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Grid: Frequency Sweep & Phase Sweep */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Frequency Sweep Card */}
        <div
          className={`flex flex-col gap-4 p-5 rounded-2xl border transition-all ${
            isFreqRunning
              ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/50'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Continuous Frequency Sweep</h4>
                <p className="text-xs text-slate-400">Sweeps smoothly through frequencies to find acoustic cancellation dips.</p>
              </div>
            </div>
          </div>

          {/* Sweep Range Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Start (Hz)</label>
              <input
                type="number"
                value={freqStart}
                onChange={(e) => setFreqStart(parseFloat(e.target.value) || 20)}
                min={20}
                max={500}
                step={1}
                disabled={isFreqRunning}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">End (Hz)</label>
              <input
                type="number"
                value={freqEnd}
                onChange={(e) => setFreqEnd(parseFloat(e.target.value) || 20)}
                min={20}
                max={500}
                step={1}
                disabled={isFreqRunning}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono text-sm"
              />
            </div>
          </div>

          {/* Duration & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Duration (Seconds)</label>
              <select
                value={freqDuration}
                onChange={(e) => setFreqDuration(parseInt(e.target.value))}
                disabled={isFreqRunning}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
              >
                <option value={5}>5 Seconds (Fast)</option>
                <option value={10}>10 Seconds</option>
                <option value={30}>30 Seconds (Recommended)</option>
                <option value={60}>60 Seconds (Precision)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Curve</label>
              <select
                value={freqType}
                onChange={(e) => setFreqType(e.target.value as SweepType)}
                disabled={isFreqRunning}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
              >
                <option value="linear">Linear Ramp</option>
                <option value="logarithmic">Logarithmic Ramp</option>
              </select>
            </div>
          </div>

          {/* Live Frequency Readout & Progress */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Frequency</span>
              <span className="text-lg font-mono font-bold text-cyan-300 glow-cyan">
                {isFreqRunning ? liveFreq.toFixed(1) : tone.frequency.toFixed(1)} Hz
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-75"
                style={{ width: `${(isFreqRunning ? freqProgress : 0) * 100}%` }}
              />
            </div>
          </div>

          {/* Start/Stop Button */}
          <div className="flex gap-2">
            {isFreqRunning ? (
              <button
                type="button"
                onClick={handleStopFreqSweep}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500/20 border border-rose-500 text-rose-300 rounded-xl font-bold text-sm hover:bg-rose-500/30 transition-all"
              >
                <StopIcon className="w-4 h-4 fill-current" />
                STOP FREQUENCY SWEEP
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartFreqSweep}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                START FREQUENCY SWEEP
              </button>
            )}
          </div>
        </div>

        {/* 2. Phase Sweep Card */}
        <div
          className={`flex flex-col gap-4 p-5 rounded-2xl border transition-all ${
            isPhaseRunning
              ? 'bg-slate-900 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Disc className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Automated Phase Sweep</h4>
                <p className="text-xs text-slate-400">Rotates 0° → 360° phase continuously to pinpoint acoustic cancellation.</p>
              </div>
            </div>
          </div>

          {/* Sweep Range Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Start Phase</label>
              <input
                type="number"
                value={phaseStart}
                onChange={(e) => setPhaseStart(parseFloat(e.target.value) || 0)}
                min={0}
                max={360}
                step={1}
                disabled={isPhaseRunning}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">End Phase</label>
              <input
                type="number"
                value={phaseEnd}
                onChange={(e) => setPhaseEnd(parseFloat(e.target.value) || 360)}
                min={0}
                max={360}
                step={1}
                disabled={isPhaseRunning}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono text-sm"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase">Duration (Seconds)</label>
            <select
              value={phaseDuration}
              onChange={(e) => setPhaseDuration(parseInt(e.target.value))}
              disabled={isPhaseRunning}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
            >
              <option value={5}>5 Seconds (Fast)</option>
              <option value={10}>10 Seconds</option>
              <option value={30}>30 Seconds (Recommended)</option>
              <option value={60}>60 Seconds (Ultra-Fine)</option>
            </select>
          </div>

          {/* Live Phase Readout & Progress */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Phase Angle</span>
              <span className="text-lg font-mono font-bold text-amber-300 glow-amber">
                {isPhaseRunning ? livePhase.toFixed(1) : tone.phase.toFixed(1)}°
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-75"
                style={{ width: `${(isPhaseRunning ? phaseProgress : 0) * 100}%` }}
              />
            </div>
          </div>

          {/* Start/Stop Button */}
          <div className="flex gap-2">
            {isPhaseRunning ? (
              <button
                type="button"
                onClick={handleStopPhaseSweep}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500/20 border border-rose-500 text-rose-300 rounded-xl font-bold text-sm hover:bg-rose-500/30 transition-all"
              >
                <StopIcon className="w-4 h-4 fill-current" />
                STOP PHASE SWEEP
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartPhaseSweep}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                START PHASE SWEEP
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Mark Button (Prominent) */}
      <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h4 className="text-base font-bold text-emerald-300 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            Acoustic Position Marker
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Hear a moment where the hum drops or feels softer? Press immediately to bookmark frequency & phase!
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkCurrent}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 text-sm"
        >
          {lastMarkedId ? (
            <>
              <Check className="w-5 h-5" />
              <span>SAVED POSITION!</span>
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5 fill-current" />
              <span>MARK THIS POSITION</span>
            </>
          )}
        </button>
      </div>

      {/* Marked Positions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-200">Marked Positions & Sweet Spots</h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {marks.length} saved
            </span>
          </div>

          {marks.length > 0 && (
            <button
              type="button"
              onClick={clearMarks}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>

        {marks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No marked positions yet. Start a sweep and hit <strong>"MARK THIS POSITION"</strong> when the hum quietens.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {marks.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <button
                      type="button"
                      onClick={() => deleteMark(m.id)}
                      className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold font-mono text-cyan-300">{m.frequency.toFixed(1)} Hz</span>
                    <span className="text-sm font-mono text-amber-300">{m.phase}°</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Gain: {Math.round(m.gain * 100)}% • Wave: {m.waveform}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyMark(m)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <span>Apply to Generator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
