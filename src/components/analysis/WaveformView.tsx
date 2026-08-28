import React from 'react';
import { Play, Square as StopIcon } from 'lucide-react';

interface WaveformViewProps {
  waveformPoints: number[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  durationSec: number;
}

export const WaveformView: React.FC<WaveformViewProps> = ({
  waveformPoints,
  isPlaying,
  onTogglePlay,
  durationSec,
}) => {
  if (waveformPoints.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-rose-500/20 border border-rose-500 text-rose-300 hover:bg-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
            }`}
          >
            {isPlaying ? (
              <>
                <StopIcon className="w-3.5 h-3.5 fill-current" />
                <span>Stop Sample</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Sample</span>
              </>
            )}
          </button>
          <span className="text-xs text-slate-400 font-mono">
            Sample Duration: {durationSec > 0 ? `${durationSec}s` : 'Loaded Audio'}
          </span>
        </div>

        <span className="text-[11px] font-mono text-slate-500">Time Domain Waveform</span>
      </div>

      {/* Waveform Bars */}
      <div className="h-16 bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-0.5 overflow-hidden">
        {waveformPoints.map((val, idx) => {
          const heightPct = Math.max(4, Math.min(100, val * 100));
          return (
            <div
              key={idx}
              className="flex-1 bg-cyan-500/60 rounded-full transition-all"
              style={{
                height: `${heightPct}%`,
                opacity: 0.4 + (val * 0.6),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
