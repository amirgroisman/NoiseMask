import React, { useRef } from 'react';
import { Mic, Upload, Square as StopIcon, Info } from 'lucide-react';
import { useRecording } from '../../hooks/useRecording';
import { useAudioStore } from '../../store/audioStore';
import { SpectrumView } from './SpectrumView';
import { PeakList } from './PeakList';
import { WaveformView } from './WaveformView';
import type { DetectedPeak } from '../../types/experiment';

export const NoiseAnalysis: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    isRecording,
    recordDurationSec,
    isPlayingBuffer,
    detectedPeaks,
    spectrumData,
    waveformPoints,
    errorMsg,
    startRecording,
    stopRecording,
    handleFileUpload,
    togglePlayBuffer,
    recordedBuffer,
  } = useRecording();

  const toneFrequency = useAudioStore((s) => s.tone.frequency);
  const setToneFrequency = useAudioStore((s) => s.setToneFrequency);
  const setNoiseCenterFreq = useAudioStore((s) => s.setNoiseCenterFreq);

  const handleSelectPeak = (peak: DetectedPeak) => {
    setToneFrequency(peak.frequency);
    setNoiseCenterFreq(peak.frequency);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Capture Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 rounded-2xl shadow-lg">
        {/* Mic Record Card */}
        <div className="flex flex-col justify-between gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Microphone Recording</h4>
                <p className="text-xs text-slate-400">Capture ambient HVAC / AC hum at your pillow area.</p>
              </div>
            </div>

            {/* Timer 00:00 / 00:30 */}
            <div className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300">
              00:{recordDurationSec.toString().padStart(2, '0')} / 00:30
            </div>
          </div>

          <div>
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all animate-pulse"
              >
                <StopIcon className="w-4 h-4 fill-current" />
                STOP RECORDING & ANALYZE
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
              >
                <Mic className="w-4 h-4" />
                RECORD FROM MICROPHONE
              </button>
            )}
          </div>
        </div>

        {/* File Upload Card */}
        <div className="flex flex-col justify-between gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-bold text-white">Upload Audio Sample</h4>
              <p className="text-xs text-slate-400">Import a pre-recorded WAV, MP3, or M4A file for FFT analysis.</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,.wav,.mp3,.ogg,.m4a,.flac"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            SELECT AUDIO FILE
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Sample Waveform & Playback */}
      <WaveformView
        waveformPoints={waveformPoints}
        isPlaying={isPlayingBuffer}
        onTogglePlay={togglePlayBuffer}
        durationSec={recordedBuffer ? Math.round(recordedBuffer.duration) : 0}
      />

      {/* FFT Spectrum Display */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-200">High-Resolution FFT Frequency Spectrum</h4>
          <span className="text-xs font-mono text-cyan-400">
            Target: {toneFrequency.toFixed(1)} Hz
          </span>
        </div>

        <SpectrumView
          frequencies={spectrumData?.frequencies}
          magnitudesDb={spectrumData?.magnitudesDb}
          minFreq={20}
          maxFreq={500}
          onSelectFrequency={(freq) => {
            setToneFrequency(freq);
            setNoiseCenterFreq(freq);
          }}
          targetFreq={toneFrequency}
        />
      </div>

      {/* Detected Peak List with "USE AS TARGET" */}
      <PeakList
        peaks={detectedPeaks}
        onSelectPeak={handleSelectPeak}
        selectedFreq={toneFrequency}
      />

      {/* Scientific Measurement Note */}
      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
        <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Acoustic Estimation Notice: </span>
          Detected frequencies are estimates. Microphone hardware, automatic gain control, noise suppression, and room acoustics may affect measurements.
        </div>
      </div>
    </div>
  );
};
