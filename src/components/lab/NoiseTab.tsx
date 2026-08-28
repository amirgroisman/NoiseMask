import React from 'react';
import { Waves, Play, Square as StopIcon, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { NumberStepper } from '../controls/NumberStepper';
import type { NoiseType } from '../../types/audio';
import { NARROWBAND_PRESETS } from '../../utils/constants';

export const NoiseTab: React.FC = () => {
  const noise = useAudioStore((s) => s.noise);
  const setNoiseType = useAudioStore((s) => s.setNoiseType);
  const setNoiseGain = useAudioStore((s) => s.setNoiseGain);
  const setNoiseCenterFreq = useAudioStore((s) => s.setNoiseCenterFreq);
  const setNoiseBandwidth = useAudioStore((s) => s.setNoiseBandwidth);

  const { toggleNoise } = useAudioEngine();

  const noiseTypes: { id: NoiseType; label: string; desc: string; color: string }[] = [
    {
      id: 'narrowband',
      label: 'Narrow-Band Noise',
      desc: 'Targeted noise filtered tightly around the hum frequency for psychoacoustic masking without full-spectrum hiss.',
      color: 'border-cyan-500 text-cyan-300 bg-cyan-500/10',
    },
    {
      id: 'pink',
      label: 'Pink Noise (1/f)',
      desc: 'Equal energy per octave (-3 dB/oct). Natural sound resembling gentle rain or wind.',
      color: 'border-pink-500 text-pink-300 bg-pink-500/10',
    },
    {
      id: 'brown',
      label: 'Brown Noise (1/f²)',
      desc: 'Deep low-frequency bias (-6 dB/oct). Sounds like a distant waterfall or heavy rumble.',
      color: 'border-amber-600 text-amber-300 bg-amber-600/10',
    },
    {
      id: 'white',
      label: 'White Noise',
      desc: 'Equal energy per Hertz across the entire spectrum. Bright, uniform static hiss.',
      color: 'border-slate-400 text-slate-200 bg-slate-400/10',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Generator Switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full transition-all ${
              noise.enabled ? 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.8)] animate-pulse' : 'bg-slate-700'
            }`}
          />
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Noise & Masking Generator</h3>
            <p className="text-xs text-slate-400">
              Acoustic and psychoacoustic noise sources including narrow-band targeted filters.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleNoise}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 ${
            noise.enabled
              ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-300 hover:bg-rose-500/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)]'
          }`}
        >
          {noise.enabled ? (
            <>
              <StopIcon className="w-4 h-4 fill-current" />
              <span>STOP NOISE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY NOISE</span>
            </>
          )}
        </button>
      </div>

      {/* Noise Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {noiseTypes.map((t) => {
          const isSelected = noise.type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setNoiseType(t.id)}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? `${t.color} shadow-lg ring-1 ring-cyan-400/50`
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{t.label}</span>
                {t.id === 'narrowband' && <Sparkles className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-[11px] leading-relaxed opacity-80">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Narrowband Specific Controls (when narrowband selected) */}
      {noise.type === 'narrowband' && (
        <div className="bg-slate-900/90 border-2 border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Waves className="w-4 h-4" />
                Narrow-Band Filter Parameters
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Focuses noise energy directly around the annoying hum to psychoacoustically mask it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Center Frequency */}
            <NumberStepper
              label="Center Frequency (Target Hum)"
              unit="Hz"
              value={noise.centerFrequency}
              min={20}
              max={500}
              steps={[10, 1, 0.1]}
              onChange={setNoiseCenterFreq}
              decimals={1}
            />

            {/* Bandwidth Controls */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bandwidth (Δf)</span>
                <span className="text-sm font-mono font-bold text-cyan-300">
                  {noise.bandwidth} Hz (±{Math.round(noise.bandwidth / 2)} Hz)
                </span>
              </div>

              {/* Bandwidth Slider */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-500">1 Hz</span>
                <input
                  type="range"
                  min={1}
                  max={200}
                  step={1}
                  value={noise.bandwidth}
                  onChange={(e) => setNoiseBandwidth(parseInt(e.target.value) || 20)}
                  className="w-full h-2 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-500">200 Hz</span>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Bandwidth Presets</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {Object.entries(NARROWBAND_PRESETS).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNoiseBandwidth(item.bw)}
                      className={`text-xs py-1.5 px-2 rounded-lg font-mono transition-all border ${
                        noise.bandwidth === item.bw
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Noise Gain */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Noise Gain (Level)</span>
          <span className="text-sm font-mono font-bold text-indigo-300">
            {Math.round(noise.gain * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-3">
          <VolumeX className="w-4 h-4 text-slate-500" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={noise.gain}
            onChange={(e) => setNoiseGain(parseFloat(e.target.value))}
            className="w-full h-2.5 rounded-lg cursor-pointer accent-indigo-400"
          />
          <Volume2 className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
    </div>
  );
};
