import React from 'react';
import { Target, Zap } from 'lucide-react';
import type { DetectedPeak } from '../../types/experiment';

interface PeakListProps {
  peaks: DetectedPeak[];
  onSelectPeak: (peak: DetectedPeak) => void;
  selectedFreq?: number;
}

export const PeakList: React.FC<PeakListProps> = ({ peaks, onSelectPeak, selectedFreq }) => {
  if (peaks.length === 0) {
    return (
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
        No significant frequency peaks detected yet. Record or upload an audio sample to find dominant hums.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-200">Detected Dominant Peaks</h4>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Ranked by prominence
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {peaks.map((peak, idx) => {
          const isSelected = selectedFreq && Math.abs(selectedFreq - peak.frequency) < 0.2;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
                  <span>#{idx + 1} Peak</span>
                  <span>{peak.db} dB</span>
                </div>
                <div className="text-xl font-bold font-mono text-cyan-300 glow-cyan">
                  {peak.frequency.toFixed(1)} Hz
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Prominence: +{peak.prominence} dB
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectPeak(peak)}
                className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-slate-950'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>USE AS TARGET</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
