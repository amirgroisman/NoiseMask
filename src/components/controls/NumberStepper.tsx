import React from 'react';

interface NumberStepperProps {
  label: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  steps?: number[];
  onChange: (val: number) => void;
  decimals?: number;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  label,
  unit = 'Hz',
  value,
  min,
  max,
  steps = [10, 1, 0.1],
  onChange,
  decimals = 1,
}) => {
  const handleStep = (delta: number) => {
    const next = Math.max(min, Math.min(max, Math.round((value + delta) * 100) / 100));
    onChange(Number(next.toFixed(decimals)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, Number(num.toFixed(decimals)))));
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="text-xs text-slate-500 font-mono">
          Range: {min}–{max} {unit}
        </span>
      </div>

      {/* Main Digital Readout & Steppers */}
      <div className="grid grid-cols-7 gap-1.5 items-center">
        {/* Decrement Buttons */}
        <button
          type="button"
          onClick={() => handleStep(-steps[0])}
          className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950/60 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60 shadow-sm"
          title={`Decrease by ${steps[0]} ${unit}`}
        >
          -{steps[0]}
        </button>
        <button
          type="button"
          onClick={() => handleStep(-steps[1])}
          className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950/60 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60 shadow-sm"
          title={`Decrease by ${steps[1]} ${unit}`}
        >
          -{steps[1]}
        </button>
        <button
          type="button"
          onClick={() => handleStep(-steps[2])}
          className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950/60 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60 shadow-sm"
          title={`Decrease by ${steps[2]} ${unit}`}
        >
          -{steps[2]}
        </button>

        {/* Central Numeric Box */}
        <div className="relative flex items-center justify-center bg-slate-950 border-2 border-cyan-500/40 rounded-lg px-2 py-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            step={steps[2] || 0.1}
            min={min}
            max={max}
            className="w-full text-center bg-transparent text-cyan-300 font-mono text-lg font-bold outline-none font-mono-num selection:bg-cyan-500/30"
          />
          <span className="text-[11px] font-mono font-semibold text-cyan-500/80 ml-0.5">{unit}</span>
        </div>

        {/* Increment Buttons */}
        <button
          type="button"
          onClick={() => handleStep(steps[2])}
          className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950/60 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60 shadow-sm"
          title={`Increase by ${steps[2]} ${unit}`}
        >
          +{steps[2]}
        </button>
        <button
          type="button"
          onClick={() => handleStep(steps[1])}
          className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950/60 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60 shadow-sm"
          title={`Increase by ${steps[1]} ${unit}`}
        >
          +{steps[1]}
        </button>
        <button
          type="button"
          onClick={() => handleStep(steps[0])}
          className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-950/60 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-medium transition-all border border-slate-700/60 shadow-sm"
          title={`Increase by ${steps[0]} ${unit}`}
        >
          +{steps[0]}
        </button>
      </div>

      {/* Slider for smooth dragging */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-[11px] font-mono text-slate-500">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={steps[2] || 0.1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg cursor-pointer"
        />
        <span className="text-[11px] font-mono text-slate-500">{max}</span>
      </div>
    </div>
  );
};
