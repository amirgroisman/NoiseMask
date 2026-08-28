import React, { useRef, useEffect, useState } from 'react';

interface SpectrumViewProps {
  frequencies?: Float32Array;
  magnitudesDb?: Float32Array;
  minFreq?: number;
  maxFreq?: number;
  onSelectFrequency?: (freq: number) => void;
  targetFreq?: number;
}

export const SpectrumView: React.FC<SpectrumViewProps> = ({
  frequencies,
  magnitudesDb,
  minFreq = 20,
  maxFreq = 500,
  onSelectFrequency,
  targetFreq,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ freq: number; db: number; x: number; y: number } | null>(null);

  const [zoomRange, setZoomRange] = useState<{ min: number; max: number }>({ min: minFreq, max: maxFreq });

  useEffect(() => {
    setZoomRange({ min: minFreq, max: maxFreq });
  }, [minFreq, maxFreq]);

  // Render Spectrum on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const cssWidth = canvas.offsetWidth;
    const cssHeight = canvas.offsetHeight;

    // Background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Draw Grid Lines (Frequency & dB)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';

    const minZ = zoomRange.min;
    const maxZ = zoomRange.max;
    const rangeSpan = maxZ - minZ;

    // Vertical Frequency Grid Lines
    const stepHz = rangeSpan <= 100 ? 10 : rangeSpan <= 250 ? 25 : 50;
    const startGrid = Math.ceil(minZ / stepHz) * stepHz;

    for (let f = startGrid; f <= maxZ; f += stepHz) {
      const x = ((f - minZ) / rangeSpan) * cssWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssHeight - 18);
      ctx.stroke();

      ctx.fillText(`${f}Hz`, x + 3, cssHeight - 5);
    }

    // Horizontal dB Grid Lines (-80 dB to 0 dB)
    const minDb = -80;
    const maxDb = 0;
    const dbSteps = [-60, -40, -20, 0];

    for (const db of dbSteps) {
      const y = (1 - (db - minDb) / (maxDb - minDb)) * (cssHeight - 20);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cssWidth, y);
      ctx.stroke();

      ctx.fillText(`${db}dB`, 4, y - 3);
    }

    // If no FFT data, draw idle line
    if (!frequencies || !magnitudesDb || frequencies.length === 0) {
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText('Record or upload audio to analyze frequency spectrum', cssWidth / 2, cssHeight / 2);
      return;
    }

    // Draw FFT Spectrum Line & Gradient Fill
    const gradient = ctx.createLinearGradient(0, 0, 0, cssHeight);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    gradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.05)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;

    let hasStarted = false;
    let firstX = 0;
    let lastX = 0;

    for (let i = 0; i < frequencies.length; i++) {
      const f = frequencies[i];
      if (f < minZ || f > maxZ) continue;

      const x = ((f - minZ) / rangeSpan) * cssWidth;
      const db = Math.max(minDb, Math.min(maxDb, magnitudesDb[i]));
      const y = (1 - (db - minDb) / (maxDb - minDb)) * (cssHeight - 20);

      if (!hasStarted) {
        ctx.moveTo(x, y);
        firstX = x;
        hasStarted = true;
      } else {
        ctx.lineTo(x, y);
      }
      lastX = x;
    }

    ctx.stroke();

    // Fill under curve
    if (hasStarted) {
      ctx.lineTo(lastX, cssHeight - 20);
      ctx.lineTo(firstX, cssHeight - 20);
      ctx.closePath();
      ctx.fill();
    }

    // Highlight Target Frequency if set
    if (targetFreq && targetFreq >= minZ && targetFreq <= maxZ) {
      const targetX = ((targetFreq - minZ) / rangeSpan) * cssWidth;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(targetX, 0);
      ctx.lineTo(targetX, cssHeight - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`Target: ${targetFreq.toFixed(1)}Hz`, targetX + 4, 15);
    }
  }, [frequencies, magnitudesDb, zoomRange, targetFreq]);

  // Handle Mouse Hover / Move for inspect tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !frequencies || !magnitudesDb) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const minZ = zoomRange.min;
    const maxZ = zoomRange.max;
    const freq = minZ + (x / rect.width) * (maxZ - minZ);

    // Find nearest bin
    let nearestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < frequencies.length; i++) {
      const diff = Math.abs(frequencies[i] - freq);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIdx = i;
      }
    }

    setHoverInfo({
      freq: Math.round(frequencies[nearestIdx] * 10) / 10,
      db: Math.round(magnitudesDb[nearestIdx] * 10) / 10,
      x,
      y,
    });
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  const handleCanvasClick = () => {
    if (hoverInfo && onSelectFrequency) {
      onSelectFrequency(hoverInfo.freq);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold uppercase">Zoom:</span>
          <button
            type="button"
            onClick={() => setZoomRange({ min: 20, max: 500 })}
            className={`px-2.5 py-1 rounded font-mono border transition-all ${
              zoomRange.min === 20 && zoomRange.max === 500
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            20–500 Hz (Full)
          </button>
          <button
            type="button"
            onClick={() => setZoomRange({ min: 20, max: 200 })}
            className={`px-2.5 py-1 rounded font-mono border transition-all ${
              zoomRange.min === 20 && zoomRange.max === 200
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            20–200 Hz (Sub/Bass)
          </button>
          <button
            type="button"
            onClick={() => setZoomRange({ min: 50, max: 150 })}
            className={`px-2.5 py-1 rounded font-mono border transition-all ${
              zoomRange.min === 50 && zoomRange.max === 150
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            50–150 Hz (AC Hum)
          </button>
        </div>

        {hoverInfo && (
          <div className="text-xs font-mono bg-slate-950 border border-cyan-500/40 px-2.5 py-1 rounded text-cyan-300 shadow">
            Frequency: <span className="font-bold text-white">{hoverInfo.freq} Hz</span> | Level: <span className="font-bold text-white">{hoverInfo.db} dB</span>
          </div>
        )}
      </div>

      {/* Canvas container */}
      <div className="relative w-full h-64 bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Hover Crosshair Marker */}
        {hoverInfo && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none border-l border-cyan-400/80"
            style={{ left: `${hoverInfo.x}px` }}
          >
            <div className="absolute top-2 left-2 bg-slate-900/90 border border-cyan-500 text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded shadow">
              Click to Target
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
