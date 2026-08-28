import React, { useState } from 'react';
import { Radio, Waves, Sliders, Activity } from 'lucide-react';
import { ToneTab } from './ToneTab';
import { NoiseTab } from './NoiseTab';
import { HarmonicsTab } from './HarmonicsTab';
import { SweepsTab } from './SweepsTab';
import { useAudioStore } from '../../store/audioStore';

export const ManualLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tone' | 'noise' | 'harmonics' | 'sweeps'>('tone');

  const tone = useAudioStore((s) => s.tone);
  const noise = useAudioStore((s) => s.noise);
  const harmonics = useAudioStore((s) => s.harmonics);

  const activeHarmonicsCount = harmonics.filter((h) => h.enabled).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Subtabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('tone')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'tone'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Tone Generator</span>
            {tone.enabled && (
              <span className="w-2 h-2 rounded-full bg-cyan-900 border border-cyan-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('noise')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'noise'
                ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Noise & Masking</span>
            {noise.enabled && (
              <span className="w-2 h-2 rounded-full bg-indigo-900 border border-indigo-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('harmonics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'harmonics'
                ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Harmonics</span>
            {activeHarmonicsCount > 0 && (
              <span className="text-[10px] bg-purple-900/80 px-1.5 py-0.2 rounded font-mono font-bold">
                {activeHarmonicsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sweeps')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'sweeps'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Automated Sweeps</span>
          </button>
        </div>

        {/* Real-time routing pill */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
          <span>Active Mix:</span>
          <span className={tone.enabled ? 'text-cyan-400 font-bold' : 'text-slate-600'}>TONE</span>
          <span>+</span>
          <span className={noise.enabled ? 'text-indigo-400 font-bold' : 'text-slate-600'}>NOISE</span>
          <span>+</span>
          <span className={activeHarmonicsCount > 0 ? 'text-purple-400 font-bold' : 'text-slate-600'}>
            HARMONICS ({activeHarmonicsCount})
          </span>
          <span className="text-slate-600">→ MASTER</span>
        </div>
      </div>

      {/* Active Tab Panel */}
      {activeTab === 'tone' && <ToneTab />}
      {activeTab === 'noise' && <NoiseTab />}
      {activeTab === 'harmonics' && <HarmonicsTab />}
      {activeTab === 'sweeps' && <SweepsTab />}
    </div>
  );
};
