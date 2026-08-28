import React from 'react';
import { Volume2, VolumeX, Square as StopIcon, Play, AlertOctagon } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';

export const MasterBar: React.FC = () => {
  const masterVolume = useAudioStore((s) => s.masterVolume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const isAudioActive = useAudioStore((s) => s.isAudioActive);
  const tone = useAudioStore((s) => s.tone);
  const noise = useAudioStore((s) => s.noise);
  const harmonics = useAudioStore((s) => s.harmonics);

  const setMasterVolume = useAudioStore((s) => s.setMasterVolume);
  const toggleMute = useAudioStore((s) => s.toggleMute);
  const setToneEnabled = useAudioStore((s) => s.setToneEnabled);

  const { stopAll, ensureAudioInit } = useAudioEngine();

  const handleTogglePlayMaster = async () => {
    await ensureAudioInit();
    if (isAudioActive) {
      stopAll();
    } else {
      // Start Tone generator as primary source
      setToneEnabled(true);
    }
  };

  return (
    <div className="sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Master Output Status & Active Voices */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
              AUDIO OUTPUT
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold ${
                  isAudioActive ? 'text-cyan-400 glow-cyan' : 'text-slate-500'
                }`}
              >
                STATUS: {isAudioActive ? 'PLAYING' : 'STOPPED'}
              </span>
            </div>
          </div>

          {/* Active Voice Badges */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span
              className={`px-2 py-0.5 rounded border transition-all ${
                tone.enabled ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
            >
              TONE {tone.enabled ? 'ON' : 'OFF'}
            </span>
            <span
              className={`px-2 py-0.5 rounded border transition-all ${
                noise.enabled ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
            >
              NOISE {noise.enabled ? 'ON' : 'OFF'}
            </span>
            <span
              className={`px-2 py-0.5 rounded border transition-all ${
                harmonics.some((h) => h.enabled) ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
            >
              HARMONICS
            </span>
          </div>
        </div>

        {/* Center: Master Volume Control */}
        <div className="flex items-center gap-3 w-full sm:w-72">
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="flex-1 flex flex-col gap-0.5">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Master Volume</span>
              <span className="font-bold text-cyan-300 font-mono-num">
                {isMuted ? 'MUTED' : `${Math.round(masterVolume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Right: Master Play and PANIC STOP ALL */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Quick Play Toggle */}
          <button
            type="button"
            onClick={handleTogglePlayMaster}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              isAudioActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            }`}
          >
            {isAudioActive ? (
              <>
                <StopIcon className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </button>

          {/* Emergency Panic STOP ALL */}
          <button
            type="button"
            onClick={stopAll}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.5)] border border-rose-400 transition-all"
            title="Emergency Panic Stop: Zeroes all gains, stops all generators and active sweeps immediately."
          >
            <AlertOctagon className="w-4 h-4 fill-current" />
            <span>STOP ALL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
