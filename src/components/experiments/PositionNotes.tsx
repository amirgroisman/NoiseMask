import React from 'react';
import { useExperimentStore } from '../../store/experimentStore';
import { MapPin, Speaker, Bed, StickyNote } from 'lucide-react';

export const PositionNotes: React.FC = () => {
  const speakerPositionNotes = useExperimentStore((s) => s.speakerPositionNotes);
  const listeningPositionNotes = useExperimentStore((s) => s.listeningPositionNotes);
  const distanceNotes = useExperimentStore((s) => s.distanceNotes);
  const sessionNotes = useExperimentStore((s) => s.sessionNotes);

  const setSpeakerPositionNotes = useExperimentStore((s) => s.setSpeakerPositionNotes);
  const setListeningPositionNotes = useExperimentStore((s) => s.setListeningPositionNotes);
  const setDistanceNotes = useExperimentStore((s) => s.setDistanceNotes);
  const setSessionNotes = useExperimentStore((s) => s.setSessionNotes);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-200">Listening Position & Speaker Setup Notes</h4>
        </div>
        <span className="text-xs text-slate-500">
          Acoustic sweet spots vary by centimeters. Keep notes to reproduce results.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Listening Position */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-cyan-400" />
            Listening Position
          </label>
          <input
            type="text"
            value={listeningPositionNotes}
            onChange={(e) => setListeningPositionNotes(e.target.value)}
            placeholder="e.g. Bedroom – Left Pillow"
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Speaker Position */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Speaker className="w-3.5 h-3.5 text-indigo-400" />
            Speaker Location
          </label>
          <input
            type="text"
            value={speakerPositionNotes}
            onChange={(e) => setSpeakerPositionNotes(e.target.value)}
            placeholder="e.g. Right bedside table"
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Distance Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            Distance from Ear / Pillow
          </label>
          <input
            type="text"
            value={distanceNotes}
            onChange={(e) => setDistanceNotes(e.target.value)}
            placeholder="e.g. ~40 cm from head"
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Session Notes */}
      <div className="flex flex-col gap-1.5 pt-1">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5 text-amber-400" />
          Acoustic Observations & Notes
        </label>
        <textarea
          rows={2}
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="e.g. Rotating phase to 192° reduced the 117Hz beat sensation near pillow."
          className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500 outline-none resize-none"
        />
      </div>
    </div>
  );
};
