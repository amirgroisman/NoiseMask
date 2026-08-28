import React, { useRef, useEffect } from 'react';
import { Radio, Scale, Mic, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';

interface DashboardViewProps {
  onNavigate: (tab: 'manual' | 'analysis' | 'ab' | 'presets') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const isAudioActive = useAudioStore((s) => s.isAudioActive);
  const { engine } = useAudioEngine();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real-time Master Output Spectrum Canvas Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Float32Array(1024);

    const render = () => {
      animId = requestAnimationFrame(render);

      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      const cssW = canvas.offsetWidth;
      const cssH = canvas.offsetHeight;

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, cssW, cssH);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < cssW; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cssH);
        ctx.stroke();
      }

      if (engine.analyzer) {
        engine.analyzer.getLiveFrequencyData(dataArray);
      }

      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;

      const sliceWidth = cssW / 128; // Focus on lowest 128 bins (sub 500 Hz)
      let x = 0;

      for (let i = 0; i < 128; i++) {
        const db = dataArray[i]; // -100 to 0 dB
        const normalized = Math.max(0, Math.min(1, (db + 90) / 90));
        const y = cssH - normalized * (cssH - 10);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }
      ctx.stroke();
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [engine]);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Welcome & Status */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Acoustic Experiment Laboratory</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Low Frequency Noise Lab
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Discover the exact frequency, phase angle, and narrow-band masking profile that subjectively cancels or masks persistent AC and HVAC hums at your fixed pillow listening position.
          </p>
        </div>

        {/* Real-time Spectrum Mini Monitor */}
        <div className="w-full md:w-72 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400">Live Output Spectrum</span>
            <span className={`font-mono text-[10px] ${isAudioActive ? 'text-cyan-400 font-bold animate-pulse' : 'text-slate-600'}`}>
              {isAudioActive ? '● LIVE OUTPUT' : 'STANDBY'}
            </span>
          </div>
          <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800/80">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Analysis */}
        <div
          onClick={() => onNavigate('analysis')}
          className="p-5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-4 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-1">1. Analyze HVAC Hum</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record ambient bedside sound with microphone or upload a sample to extract dominant low-frequency peaks.
            </p>
          </div>

          <span className="text-xs font-bold text-cyan-400 group-hover:underline flex items-center gap-1">
            Open Audio Analysis &rarr;
          </span>
        </div>

        {/* Card 2: Manual Lab */}
        <div
          onClick={() => onNavigate('manual')}
          className="p-5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-4 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-1">2. Bedside Manual Lab</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tune frequency (0.1 Hz steps), rotate 0–360° phase, test narrow-band noise filters, and run automated sweeps.
            </p>
          </div>

          <span className="text-xs font-bold text-indigo-400 group-hover:underline flex items-center gap-1">
            Enter Manual Lab &rarr;
          </span>
        </div>

        {/* Card 3: A/B Testing */}
        <div
          onClick={() => onNavigate('ab')}
          className="p-5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-4 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-1">3. A/B & Blind Testing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare Speaker OFF vs Active Config in randomized blind trials to statistically verify perceived annoyance drop.
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-1">
            Run A/B Experiment &rarr;
          </span>
        </div>
      </div>

      {/* Acoustic Guidelines Guide */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-200">How Low-Frequency Fixed-Position Cancellation Works</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <h5 className="font-bold text-slate-200 mb-1">1. Fixed Pillow Zone</h5>
            <p>
              Because low frequencies have long wavelengths (e.g. 100 Hz = 3.4 meters), physical acoustic interference occurs in localized sweet spots around your head.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <h5 className="font-bold text-slate-200 mb-1">2. Phase Inversion</h5>
            <p>
              When a secondary speaker emits the hum frequency exactly 180° out of phase (destructive interference), sound waves partially cancel at the listening node.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <h5 className="font-bold text-slate-200 mb-1">3. Narrow-Band Masking</h5>
            <p>
              If physical cancellation is hard to align, narrow-band noise centered directly on the hum creates psychoacoustic masking with far less annoying hiss than white noise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
