import React from 'react';
import { Volume2, VolumeX, Play, Square as StopIcon, RefreshCw } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { NumberStepper } from '../controls/NumberStepper';
import { WaveformPicker } from '../controls/WaveformPicker';

export const ToneTab: React.FC = () => {
  const tone = useAudioStore((s) => s.tone);
  const setToneFrequency = useAudioStore((s) => s.setToneFrequency);
  const setToneWaveform = useAudioStore((s) => s.setToneWaveform);
  const setToneGain = useAudioStore((s) => s.setToneGain);
  const setTonePhase = useAudioStore((s) => s.setTonePhase);

  const { toggleTone } = useAudioEngine();

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Generator Switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full transition-all ${
              tone.enabled ? 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse' : 'bg-slate-700'
            }`}
          />
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Tone Generator</h3>
            <p className="text-xs text-slate-400">
              Generates a continuous tone with sub-0.1 Hz frequency and precise 0–360° phase control.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTone}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 ${
            tone.enabled
              ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-300 hover:bg-rose-500/30'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]'
          }`}
        >
          {tone.enabled ? (
            <>
              <StopIcon className="w-4 h-4 fill-current" />
              <span>STOP TONE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY TONE</span>
            </>
          )}
        </button>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency Control */}
        <div className="flex flex-col gap-4">
          <NumberStepper
            label="Fundamental Frequency"
            unit="Hz"
            value={tone.frequency}
            min={20}
            max={500}
            steps={[10, 1, 0.1]}
            onChange={setToneFrequency}
            decimals={1}
          />

          <WaveformPicker value={tone.waveform} onChange={setToneWaveform} />
        </div>

        {/* Phase & Gain Control */}
        <div className="flex flex-col gap-4">
          {/* Phase Control */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phase Shift</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTonePhase(180)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-400 border border-slate-700 font-mono transition-colors"
                  title="Set 180° Anti-phase"
                >
                  180° (Invert)
                </button>
                <button
                  type="button"
                  onClick={() => setTonePhase(0)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono transition-colors"
                  title="Reset to 0°"
                >
                  <RefreshCw className="w-2.5 h-2.5 inline mr-1" />
                  0°
                </button>
              </div>
            </div>

            {/* Stepper Buttons for Phase */}
            <div className="grid grid-cols-5 gap-1.5 items-center">
              <button
                type="button"
                onClick={() => setTonePhase(tone.phase - 10)}
                className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60"
              >
                -10°
              </button>
              <button
                type="button"
                onClick={() => setTonePhase(tone.phase - 1)}
                className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60"
              >
                -1°
              </button>

              <div className="relative flex items-center justify-center bg-slate-950 border-2 border-cyan-500/40 rounded-lg px-2 py-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                <input
                  type="number"
                  value={tone.phase}
                  onChange={(e) => setTonePhase(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full text-center bg-transparent text-cyan-300 font-mono text-lg font-bold outline-none font-mono-num"
                />
                <span className="text-xs font-mono text-cyan-500/80">°</span>
              </div>

              <button
                type="button"
                onClick={() => setTonePhase(tone.phase + 1)}
                className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60"
              >
                +1°
              </button>
              <button
                type="button"
                onClick={() => setTonePhase(tone.phase + 10)}
                className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60"
              >
                +10°
              </button>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] font-mono text-slate-500">0°</span>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={tone.phase}
                onChange={(e) => setTonePhase(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-500">360°</span>
            </div>
          </div>

          {/* Tone Individual Gain */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tone Gain (Level)</span>
              <span className="text-sm font-mono font-bold text-cyan-300">
                {Math.round(tone.gain * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-slate-500" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={tone.gain}
                onChange={(e) => setToneGain(parseFloat(e.target.value))}
                className="w-full h-2.5 rounded-lg cursor-pointer accent-cyan-400"
              />
              <Volume2 className="w-4 h-4 text-cyan-400" />
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Acoustic logarithmic curve mapped smoothly to avoid clicks on adjustments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
