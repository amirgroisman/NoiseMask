import React from 'react';
import { Sliders, Link, Power } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';

export const HarmonicsTab: React.FC = () => {
  const harmonics = useAudioStore((s) => s.harmonics);
  const toneFrequency = useAudioStore((s) => s.tone.frequency);

  const setHarmonicGain = useAudioStore((s) => s.setHarmonicGain);
  const setHarmonicPhase = useAudioStore((s) => s.setHarmonicPhase);
  const setHarmonicFrequency = useAudioStore((s) => s.setHarmonicFrequency);

  const { toggleHarmonic } = useAudioEngine();

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Harmonic Synthesizer (1x, 2x, 3x, 4x)</h3>
            <p className="text-xs text-slate-400">
              HVAC hums typically contain harmonic overtone multiples. Test individual harmonics and phase alignments.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-800/80 px-3 py-1.5 rounded-lg">
          Fundamental: <span className="font-bold text-white">{toneFrequency.toFixed(1)} Hz</span>
        </div>
      </div>

      {/* Harmonics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {harmonics.map((h) => {
          return (
            <div
              key={h.harmonicNumber}
              className={`flex flex-col gap-4 p-5 rounded-2xl border transition-all ${
                h.enabled
                  ? 'bg-slate-900/90 border-purple-500/60 shadow-[0_0_16px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-75'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleHarmonic(h.harmonicNumber)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      h.enabled
                        ? 'bg-purple-500 text-slate-950 shadow-[0_0_10px_rgba(168,85,247,0.6)] font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={h.enabled ? 'Disable Harmonic' : 'Enable Harmonic'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{h.name}</h4>
                    <span className="text-[11px] font-mono text-purple-400">
                      {h.frequency.toFixed(1)} Hz
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setHarmonicFrequency(
                        h.harmonicNumber,
                        Math.round(toneFrequency * h.harmonicNumber * 10) / 10
                      )
                    }
                    className="text-[10px] flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-mono transition-colors"
                    title="Lock to Fundamental multiple"
                  >
                    <Link className="w-3 h-3 text-purple-400" />
                    Lock {h.harmonicNumber}x
                  </button>
                </div>
              </div>

              {/* Frequency Manual Override */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Frequency (Hz)</span>
                  <input
                    type="number"
                    value={h.frequency}
                    onChange={(e) => setHarmonicFrequency(h.harmonicNumber, parseFloat(e.target.value) || 20)}
                    step={0.1}
                    min={20}
                    max={2000}
                    className="w-24 px-2 py-0.5 bg-slate-950 border border-slate-700 text-purple-300 font-mono text-xs rounded text-right"
                  />
                </div>
              </div>

              {/* Gain Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Harmonic Gain</span>
                  <span className="font-mono font-bold text-purple-300">{Math.round(h.gain * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={h.gain}
                    onChange={(e) => setHarmonicGain(h.harmonicNumber, parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg cursor-pointer accent-purple-400"
                  />
                </div>
              </div>

              {/* Phase Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Phase Shift</span>
                  <span className="font-mono font-bold text-purple-300">{h.phase}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={h.phase}
                    onChange={(e) => setHarmonicPhase(h.harmonicNumber, parseInt(e.target.value) || 0)}
                    className="w-full h-2 rounded-lg cursor-pointer accent-purple-400"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
