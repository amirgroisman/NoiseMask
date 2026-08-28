import React from 'react';
import { Radio, Mic, Scale, FolderOpen, LayoutDashboard } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';

export type MainTab = 'dashboard' | 'manual' | 'analysis' | 'ab' | 'presets';

interface HeaderProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
  const isAudioActive = useAudioStore((s) => s.isAudioActive);
  const tone = useAudioStore((s) => s.tone);

  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'manual', label: 'Manual Lab', icon: <Radio className="w-4 h-4" /> },
    { id: 'analysis', label: 'Noise Analysis', icon: <Mic className="w-4 h-4" /> },
    { id: 'ab', label: 'A/B Experiment', icon: <Scale className="w-4 h-4" /> },
    { id: 'presets', label: 'Saved Configurations', icon: <FolderOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* App Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                Low Frequency Noise Lab
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">Bedside Acoustic Experimenter</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 md:hidden">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border transition-all ${
                isAudioActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)] animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isAudioActive ? 'bg-cyan-400' : 'bg-slate-600'}`} />
              {isAudioActive ? 'PLAYING' : 'STOPPED'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((t) => {
            const isSelected = currentTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Badge (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-[11px] font-mono text-slate-400">
            Target: <span className="text-cyan-300 font-bold">{tone.frequency.toFixed(1)} Hz</span>
          </div>
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border transition-all ${
              isAudioActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAudioActive ? 'bg-cyan-400' : 'bg-slate-600'}`} />
            {isAudioActive ? 'PLAYING' : 'STOPPED'}
          </span>
        </div>
      </div>
    </header>
  );
};
