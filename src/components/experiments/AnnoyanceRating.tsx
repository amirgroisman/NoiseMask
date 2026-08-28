import React from 'react';
import { useExperimentStore } from '../../store/experimentStore';
import { TrendingDown, Gauge } from 'lucide-react';

export const AnnoyanceRating: React.FC = () => {
  const beforeRating = useExperimentStore((s) => s.beforeRating);
  const afterRating = useExperimentStore((s) => s.afterRating);
  const setBeforeRating = useExperimentStore((s) => s.setBeforeRating);
  const setAfterRating = useExperimentStore((s) => s.setAfterRating);

  const delta = beforeRating - afterRating;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-5 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-200">Subjective Annoyance Rating (0–10 Scale)</h4>
        </div>
        {delta > 0 ? (
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-{delta} Improvement</span>
          </div>
        ) : (
          <span className="text-xs text-slate-500 font-mono">0 = Silent • 10 = Severe</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Before Rating */}
        <div className="flex flex-col gap-2.5 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Before Audio Masking</span>
            <span className="text-base font-mono font-bold text-rose-400">{beforeRating} / 10</span>
          </div>

          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={beforeRating}
            onChange={(e) => setBeforeRating(parseInt(e.target.value))}
            className="w-full h-2.5 rounded-lg cursor-pointer accent-rose-500"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 (Not noticeable)</span>
            <span>5 (Moderate)</span>
            <span>10 (Unbearable)</span>
          </div>
        </div>

        {/* After Rating */}
        <div className="flex flex-col gap-2.5 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">After / With Audio Masking</span>
            <span className="text-base font-mono font-bold text-emerald-400">{afterRating} / 10</span>
          </div>

          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={afterRating}
            onChange={(e) => setAfterRating(parseInt(e.target.value))}
            className="w-full h-2.5 rounded-lg cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 (Not noticeable)</span>
            <span>5 (Moderate)</span>
            <span>10 (Unbearable)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
