import React from 'react';
import type { WaveformType } from '../../types/audio';
import { Activity, Radio, Square, Triangle } from 'lucide-react';

interface WaveformPickerProps {
  value: WaveformType;
  onChange: (val: WaveformType) => void;
}

export const WaveformPicker: React.FC<WaveformPickerProps> = ({ value, onChange }) => {
  const waveforms: { id: WaveformType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'sine',
      label: 'Sine',
      icon: <Radio className="w-4 h-4" />,
      desc: 'Pure fundamental tone with zero harmonic distortion (best for single hums)',
    },
    {
      id: 'triangle',
      label: 'Triangle',
      icon: <Triangle className="w-4 h-4" />,
      desc: 'Mellow odd harmonics (1/n² roll-off), natural acoustic feel',
    },
    {
      id: 'square',
      label: 'Square',
      icon: <Square className="w-4 h-4" />,
      desc: 'Hollow odd harmonics (1/n roll-off), rich buzz masking',
    },
    {
      id: 'sawtooth',
      label: 'Sawtooth',
      icon: <Activity className="w-4 h-4" />,
      desc: 'Full harmonic series (all integer multiples), bright and cutting',
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Oscillator Waveform</span>
        <span className="text-xs text-cyan-400/80 font-mono capitalize">{value} Wave</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {waveforms.map((w) => {
          const isSelected = value === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onChange(w.id)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {w.icon}
              <span>{w.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
