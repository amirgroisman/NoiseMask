import React from 'react';
import { ShieldAlert, Check } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';

export const SafetyModal: React.FC = () => {
  const safetyAcknowledged = useAudioStore((s) => s.safetyAcknowledged);
  const setSafetyAcknowledged = useAudioStore((s) => s.setSafetyAcknowledged);

  if (safetyAcknowledged) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Acoustic Safety Notice</h3>
            <p className="text-xs font-mono text-amber-400">Low-Frequency Vibration & Volume Advisory</p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2.5">
          <p>
            <strong>Start at a low volume.</strong> Low-frequency tones (20 Hz – 150 Hz) can sound perceptually quiet to the human ear while still producing significant speaker cone excursion and mechanical vibration.
          </p>
          <p className="text-slate-400">
            Increase volume gradually when lying at your bedside position. A persistent emergency <strong>STOP ALL</strong> button is always accessible on screen.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setSafetyAcknowledged(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>I UNDERSTAND & START AT SAFE VOLUME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
