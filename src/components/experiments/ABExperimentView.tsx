import React, { useState } from 'react';
import { Scale, Play, Square as StopIcon, Eye, EyeOff, RotateCcw, Award, Info } from 'lucide-react';
import { useABExperiment } from '../../hooks/useABExperiment';
import { useAudioStore } from '../../store/audioStore';
import { AnnoyanceRating } from './AnnoyanceRating';
import { PositionNotes } from './PositionNotes';

export const ABExperimentView: React.FC = () => {
  const { abState, startExperiment, stopExperiment, submitChoice } = useABExperiment();

  const tone = useAudioStore((s) => s.tone);

  const [testMode, setTestMode] = useState<'standard' | 'blind'>('standard');
  const [duration, setDuration] = useState<number>(5);
  const [totalRounds, setTotalRounds] = useState<number>(5);

  const isTesting = abState.isActive;
  const isRating = abState.currentIntervalState === 'rating';
  const isComplete = abState.currentIntervalState === 'complete';

  // Calculate statistics for Blind Mode
  const totalCompletedRounds = abState.results.length;
  const configWins = abState.results.filter((r) => r.preferred === 'config').length;
  const silenceWins = abState.results.filter((r) => r.preferred === 'silence').length;
  const confidencePct = totalCompletedRounds > 0 ? Math.round((configWins / totalCompletedRounds) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">A/B Acoustic Comparison & Blind Testing</h3>
            <p className="text-xs text-slate-400">
              Systematically compares <strong>Speaker OFF (Silence)</strong> vs <strong>Your Current Generator Configuration</strong> to verify subjective noise reduction.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg">
          Tone: {tone.frequency.toFixed(1)} Hz | Phase: {tone.phase}°
        </div>
      </div>

      {/* Main Testing Panel */}
      <div className="bg-slate-900/90 border-2 border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        {/* Setup Toolbar (when not testing) */}
        {!isTesting && !isComplete && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Test Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Testing Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestMode('standard')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      testMode === 'standard'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Standard A/B
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestMode('blind')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      testMode === 'blind'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    Blind Mode
                  </button>
                </div>
              </div>

              {/* State Duration */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Interval Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono"
                >
                  <option value={3}>3 Seconds per state</option>
                  <option value={5}>5 Seconds per state (Recommended)</option>
                  <option value={10}>10 Seconds per state</option>
                </select>
              </div>

              {/* Total Rounds */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Number of Rounds</label>
                <select
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(parseInt(e.target.value))}
                  className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono"
                >
                  <option value={3}>3 Rounds</option>
                  <option value={5}>5 Rounds (Standard)</option>
                  <option value={8}>8 Rounds (High Accuracy)</option>
                </select>
              </div>
            </div>

            {/* Mode Explanation */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              {testMode === 'standard' ? (
                <span>
                  <strong>Standard Mode:</strong> State A is always Silence (Speaker OFF), State B is your active generator configuration.
                </span>
              ) : (
                <span>
                  <strong>Blind Mode:</strong> Randomizes A & B behind the scenes. You won't know which state plays the tone until results are calculated!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => startExperiment(testMode, duration, totalRounds)}
              className="py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 text-sm tracking-wider uppercase"
            >
              <Play className="w-4 h-4 fill-current" />
              START {testMode === 'blind' ? 'BLIND' : 'A/B'} EXPERIMENT
            </button>
          </div>
        )}

        {/* Live Active Test Running Interface */}
        {isTesting && !isRating && !isComplete && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 font-bold">
                  Round {abState.currentRound} of {abState.totalRounds}
                </span>
                <span className="text-xs text-slate-400 capitalize font-mono">Mode: {abState.mode}</span>
              </div>

              <button
                type="button"
                onClick={stopExperiment}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 border border-rose-900/80 px-2.5 py-1 rounded bg-rose-950/40"
              >
                <StopIcon className="w-3 h-3 fill-current" />
                Cancel Test
              </button>
            </div>

            {/* Big Active State Indicator */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
              {/* State A Card */}
              <div
                className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  abState.currentIntervalState === 'A'
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-105'
                    : 'bg-slate-950 border-slate-800 opacity-40'
                }`}
              >
                <span className="text-3xl font-black font-mono text-white">STATE A</span>
                <span className="text-xs font-mono text-cyan-300">
                  {abState.mode === 'standard' ? 'Speaker OFF (Silence)' : 'Listening Sample A'}
                </span>
              </div>

              {/* State B Card */}
              <div
                className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  abState.currentIntervalState === 'B'
                    ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105'
                    : 'bg-slate-950 border-slate-800 opacity-40'
                }`}
              >
                <span className="text-3xl font-black font-mono text-white">STATE B</span>
                <span className="text-xs font-mono text-emerald-300">
                  {abState.mode === 'standard' ? 'Active Configuration' : 'Listening Sample B'}
                </span>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Playing State {abState.currentIntervalState}
              </span>
              <div className="text-5xl font-black font-mono text-white glow-cyan">
                00:0{abState.timeLeftInInterval}
              </div>
            </div>
          </div>
        )}

        {/* Rating Prompt After Round */}
        {isRating && (
          <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                Round {abState.currentRound} of {abState.totalRounds} Complete
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Which state felt quieter / less annoying?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Focus on the perceived HVAC hum around your pillow area.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <button
                type="button"
                onClick={() => submitChoice('A')}
                className="py-4 px-3 bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 border border-slate-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                STATE A
              </button>

              <button
                type="button"
                onClick={() => submitChoice('SAME')}
                className="py-4 px-3 bg-slate-800 hover:bg-amber-600 hover:text-slate-950 border border-slate-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                NO DIFFERENCE
              </button>

              <button
                type="button"
                onClick={() => submitChoice('B')}
                className="py-4 px-3 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 border border-slate-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                STATE B
              </button>
            </div>
          </div>
        )}

        {/* Complete Results Display */}
        {isComplete && (
          <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Award className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-white">Experiment Completed</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Subjective acoustic comparison analysis across {abState.results.length} trials.
              </p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center">
                <span className="text-xs text-slate-400">Active Config Preferred</span>
                <span className="text-3xl font-mono font-bold text-emerald-400 mt-1">
                  {configWins} / {totalCompletedRounds}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Generator Enabled</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center">
                <span className="text-xs text-slate-400">Silence Preferred</span>
                <span className="text-3xl font-mono font-bold text-rose-400 mt-1">
                  {silenceWins} / {totalCompletedRounds}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Speaker OFF</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center">
                <span className="text-xs text-slate-400">Confidence Score</span>
                <span className="text-3xl font-mono font-bold text-cyan-300 mt-1">
                  {confidencePct}%
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Preference Agreement</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 text-center max-w-lg">
              {configWins > silenceWins ? (
                <span className="text-emerald-300 font-semibold">
                  Result: Your current audio masking configuration ({tone.frequency.toFixed(1)} Hz, {tone.phase}°) was preferred over silence in {configWins} of {totalCompletedRounds} rounds.
                </span>
              ) : (
                <span className="text-slate-300">
                  Result: Silence was preferred or no significant reduction was perceived. Consider adjusting frequency by ±0.5 Hz, phase by ±15°, or testing Narrow-Band noise.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={stopExperiment}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              START NEW EXPERIMENT
            </button>
          </div>
        )}
      </div>

      {/* Subjective Annoyance Ratings (0-10) */}
      <AnnoyanceRating />

      {/* Listening Position Notes */}
      <PositionNotes />
    </div>
  );
};
