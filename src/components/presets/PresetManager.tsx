import React, { useState } from 'react';
import { Save, FolderOpen, Copy, Trash2, Download, Check, Calendar } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';
import { useExperimentStore } from '../../store/experimentStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import type { ExperimentPreset } from '../../types/experiment';

export const PresetManager: React.FC = () => {
  const tone = useAudioStore((s) => s.tone);
  const noise = useAudioStore((s) => s.noise);
  const harmonics = useAudioStore((s) => s.harmonics);
  const masterVolume = useAudioStore((s) => s.masterVolume);
  const loadPresetToAudioState = useAudioStore((s) => s.loadPresetToAudioState);

  const presets = useExperimentStore((s) => s.presets);
  const activePresetId = useExperimentStore((s) => s.activePresetId);
  const speakerPositionNotes = useExperimentStore((s) => s.speakerPositionNotes);
  const listeningPositionNotes = useExperimentStore((s) => s.listeningPositionNotes);
  const distanceNotes = useExperimentStore((s) => s.distanceNotes);
  const beforeRating = useExperimentStore((s) => s.beforeRating);
  const afterRating = useExperimentStore((s) => s.afterRating);
  const sessionNotes = useExperimentStore((s) => s.sessionNotes);

  const saveCurrentAsPreset = useExperimentStore((s) => s.saveCurrentAsPreset);
  const deletePreset = useExperimentStore((s) => s.deletePreset);
  const duplicatePreset = useExperimentStore((s) => s.duplicatePreset);
  const setActivePresetId = useExperimentStore((s) => s.setActivePresetId);

  const { ensureAudioInit } = useAudioEngine();

  const [presetNameInput, setPresetNameInput] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [loadedFeedbackId, setLoadedFeedbackId] = useState<string | null>(null);

  // Save preset handler
  const handleSave = () => {
    if (!presetNameInput.trim()) return;

    saveCurrentAsPreset(presetNameInput, {
      fundamentalFrequency: tone.frequency,
      toneWaveform: tone.waveform,
      toneGain: tone.gain,
      phase: tone.phase,
      toneEnabled: tone.enabled,
      noiseEnabled: noise.enabled,
      noiseType: noise.type,
      noiseCenterFrequency: noise.centerFrequency,
      noiseBandwidth: noise.bandwidth,
      noiseGain: noise.gain,
      harmonicsEnabled: harmonics.some((h) => h.enabled),
      harmonics,
      masterGain: masterVolume,
      speakerPositionNotes,
      listeningPositionNotes,
      distanceNotes,
      beforeRating,
      afterRating,
      notes: sessionNotes,
    });

    setPresetNameInput('');
    setShowSaveDialog(false);
  };

  // Load preset handler
  const handleLoad = async (preset: ExperimentPreset) => {
    await ensureAudioInit();
    loadPresetToAudioState(preset);
    setActivePresetId(preset.id);
    useExperimentStore.getState().setSpeakerPositionNotes(preset.speakerPositionNotes);
    useExperimentStore.getState().setListeningPositionNotes(preset.listeningPositionNotes);
    useExperimentStore.getState().setDistanceNotes(preset.distanceNotes || '');
    useExperimentStore.getState().setBeforeRating(preset.beforeRating);
    useExperimentStore.getState().setAfterRating(preset.afterRating);
    useExperimentStore.getState().setSessionNotes(preset.notes);

    setLoadedFeedbackId(preset.id);
    setTimeout(() => setLoadedFeedbackId(null), 1800);
  };

  // Export Presets JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NoiseLab_Presets_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner with Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 rounded-2xl shadow-lg">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">Saved Laboratory Configurations</h3>
          <p className="text-xs text-slate-400">
            Save successful bedside setups, compare ratings, and reload acoustic presets instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>SAVE CURRENT SETUP</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 font-mono transition-all"
            title="Export Presets to JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Save Modal Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-cyan-400" />
              Save Configuration Preset
            </h4>

            <p className="text-xs text-slate-400">
              Saves current tone ({tone.frequency.toFixed(1)} Hz, {tone.phase}°), noise settings, harmonics, ratings, and physical position notes.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Preset Name</label>
              <input
                type="text"
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                placeholder="e.g. 🌙 Bedroom — Pillow Best Result"
                autoFocus
                className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!presetNameInput.trim()}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-bold transition-all shadow"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isActive = activePresetId === preset.id;
          const isJustLoaded = loadedFeedbackId === preset.id;

          return (
            <div
              key={preset.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all shadow-md ${
                isActive
                  ? 'bg-slate-900 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{preset.name}</h4>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(preset.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => duplicatePreset(preset.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Duplicate Preset"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {presets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deletePreset(preset.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Parameters Pill Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Frequency</span>
                    <span className="text-cyan-300 font-bold">{preset.fundamentalFrequency.toFixed(1)} Hz</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Phase</span>
                    <span className="text-amber-300 font-bold">{preset.phase}°</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Tone Gain</span>
                    <span className="text-slate-300 font-bold">{Math.round(preset.toneGain * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Masking Noise</span>
                    <span className={preset.noiseEnabled ? 'text-indigo-300 font-bold' : 'text-slate-600'}>
                      {preset.noiseEnabled ? `Enabled (${preset.noiseBandwidth}Hz)` : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Subjective Rating Badge */}
                <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Annoyance:</span>
                  <span className="font-mono">
                    <span className="text-rose-400 font-bold">{preset.beforeRating}/10</span>
                    <span className="text-slate-500 mx-1.5">→</span>
                    <span className="text-emerald-400 font-bold">{preset.afterRating}/10</span>
                  </span>
                </div>

                {/* Position Notes */}
                {(preset.listeningPositionNotes || preset.speakerPositionNotes) && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    {preset.listeningPositionNotes || preset.speakerPositionNotes}
                  </p>
                )}
              </div>

              {/* Load Button */}
              <button
                type="button"
                onClick={() => handleLoad(preset)}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isJustLoaded
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : isActive
                    ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 hover:bg-cyan-500/30'
                    : 'bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-slate-950'
                }`}
              >
                {isJustLoaded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>LOADED!</span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-4 h-4" />
                    <span>{isActive ? 'CURRENTLY ACTIVE' : 'LOAD CONFIGURATION'}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
