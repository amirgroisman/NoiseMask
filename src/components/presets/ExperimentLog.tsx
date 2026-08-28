import React, { useState } from 'react';
import { History } from 'lucide-react';
import { useExperimentStore } from '../../store/experimentStore';
import { useAudioStore } from '../../store/audioStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import type { ExperimentPreset } from '../../types/experiment';

type SortField = 'date' | 'rating' | 'improvement' | 'frequency';

export const ExperimentLog: React.FC = () => {
  const presets = useExperimentStore((s) => s.presets);
  const activePresetId = useExperimentStore((s) => s.activePresetId);
  const setActivePresetId = useExperimentStore((s) => s.setActivePresetId);
  const loadPresetToAudioState = useAudioStore((s) => s.loadPresetToAudioState);

  const { ensureAudioInit } = useAudioEngine();

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedPresets = [...presets].sort((a, b) => {
    let diff = 0;
    if (sortField === 'date') {
      diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortField === 'rating') {
      diff = a.afterRating - b.afterRating; // lower is better
    } else if (sortField === 'improvement') {
      const impA = a.beforeRating - a.afterRating;
      const impB = b.beforeRating - b.afterRating;
      diff = impB - impA; // higher improvement is better
    } else if (sortField === 'frequency') {
      diff = a.fundamentalFrequency - b.fundamentalFrequency;
    }
    return sortAsc ? -diff : diff;
  });

  const handleLoad = async (preset: ExperimentPreset) => {
    await ensureAudioInit();
    loadPresetToAudioState(preset);
    setActivePresetId(preset.id);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-200">Experiment Log & History</h4>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Sort by:</span>
          <button
            type="button"
            onClick={() => handleSort('date')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              sortField === 'date' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Newest
          </button>
          <button
            type="button"
            onClick={() => handleSort('improvement')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              sortField === 'improvement' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Largest Improvement
          </button>
          <button
            type="button"
            onClick={() => handleSort('rating')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              sortField === 'rating' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Lowest Annoyance
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
              <th className="py-2.5 px-3">Experiment Name</th>
              <th className="py-2.5 px-3">Target Freq</th>
              <th className="py-2.5 px-3">Phase</th>
              <th className="py-2.5 px-3">Masking</th>
              <th className="py-2.5 px-3">Before → After</th>
              <th className="py-2.5 px-3">Position</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedPresets.map((preset) => {
              const delta = preset.beforeRating - preset.afterRating;
              const isActive = activePresetId === preset.id;

              return (
                <tr
                  key={preset.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isActive ? 'bg-cyan-950/30' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-white font-sans">
                    {preset.name}
                  </td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">
                    {preset.fundamentalFrequency.toFixed(1)} Hz
                  </td>
                  <td className="py-3 px-3 text-amber-300">
                    {preset.phase}°
                  </td>
                  <td className="py-3 px-3">
                    {preset.noiseEnabled ? (
                      <span className="text-indigo-400 font-semibold">{preset.noiseType}</span>
                    ) : (
                      <span className="text-slate-600">None</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-rose-400">{preset.beforeRating}</span>
                    <span className="text-slate-500 mx-1">→</span>
                    <span className="text-emerald-400 font-bold">{preset.afterRating}</span>
                    {delta > 0 && (
                      <span className="ml-2 text-[10px] text-emerald-400 font-semibold">
                        (-{delta})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-sans truncate max-w-[150px]">
                    {preset.listeningPositionNotes || '—'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleLoad(preset)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-sans transition-all ${
                        isActive
                          ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
                          : 'bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-slate-950'
                      }`}
                    >
                      {isActive ? 'Active' : 'Load'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
