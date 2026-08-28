import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioEngine } from '../audio/AudioEngine';
import type { DetectedPeak } from '../types/experiment';

export function useRecording() {
  const engine = AudioEngine.getInstance();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDurationSec, setRecordDurationSec] = useState<number>(0);
  const [recordedBuffer, setRecordedBuffer] = useState<AudioBuffer | null>(null);
  const [isPlayingBuffer, setIsPlayingBuffer] = useState<boolean>(false);
  const [detectedPeaks, setDetectedPeaks] = useState<DetectedPeak[]>([]);
  const [spectrumData, setSpectrumData] = useState<{ frequencies: Float32Array; magnitudesDb: Float32Array } | null>(null);
  const [waveformPoints, setWaveformPoints] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Compute normalized waveform points for visualizer
  const extractWaveform = (buffer: AudioBuffer, numPoints = 120): number[] => {
    const rawData = buffer.getChannelData(0);
    const step = Math.ceil(rawData.length / numPoints);
    const points: number[] = [];

    for (let i = 0; i < numPoints; i++) {
      let min = 1.0;
      let max = -1.0;
      const start = i * step;
      const end = Math.min(start + step, rawData.length);
      for (let j = start; j < end; j++) {
        const val = rawData[j];
        if (val < min) min = val;
        if (val > max) max = val;
      }
      points.push(Math.max(Math.abs(min), Math.abs(max)));
    }
    return points;
  };

  // Perform FFT analysis on an AudioBuffer
  const analyzeBuffer = useCallback(
    (buffer: AudioBuffer) => {
      setRecordedBuffer(buffer);
      setWaveformPoints(extractWaveform(buffer));

      if (engine.analyzer) {
        const analysis = engine.analyzer.analyzeAudioBuffer(buffer, 20, 500);
        setDetectedPeaks(analysis.peaks);
        setSpectrumData({
          frequencies: analysis.frequencies,
          magnitudesDb: analysis.magnitudesDb,
        });
      }
    },
    [engine]
  );

  // Start Mic Recording
  const startRecording = useCallback(async () => {
    setErrorMsg(null);
    try {
      await engine.initAudio();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // We want raw acoustic hum
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();

        const ctx = await engine.initAudio();
        ctx.decodeAudioData(
          arrayBuffer,
          (decoded) => {
            analyzeBuffer(decoded);
          },
          (err) => {
            setErrorMsg('Failed to decode recorded audio: ' + (err?.message || 'format error'));
          }
        );
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordDurationSec(0);

      // Start 30-second max timer
      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordDurationSec(elapsed);
        if (elapsed >= 30) {
          stopRecording();
        }
      }, 500);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Could not access microphone.');
      setIsRecording(false);
    }
  }, [engine, analyzeBuffer]);

  // Stop Mic Recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Upload Audio File
  const handleFileUpload = useCallback(
    async (file: File) => {
      setErrorMsg(null);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const ctx = await engine.initAudio();
        ctx.decodeAudioData(
          arrayBuffer,
          (decoded) => {
            analyzeBuffer(decoded);
          },
          (err) => {
            setErrorMsg('Failed to decode uploaded audio file. Please try a standard WAV or MP3 file: ' + (err?.message || ''));
          }
        );
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg('Error reading file: ' + error.message);
      }
    },
    [engine, analyzeBuffer]
  );

  // Play / Stop Buffer Playback
  const togglePlayBuffer = useCallback(() => {
    if (!recordedBuffer) return;

    if (isPlayingBuffer) {
      engine.stopBufferPlayback();
      setIsPlayingBuffer(false);
    } else {
      engine.playAudioBuffer(recordedBuffer, () => {
        setIsPlayingBuffer(false);
      });
      setIsPlayingBuffer(true);
    }
  }, [engine, recordedBuffer, isPlayingBuffer]);

  return {
    isRecording,
    recordDurationSec,
    recordedBuffer,
    isPlayingBuffer,
    detectedPeaks,
    spectrumData,
    waveformPoints,
    errorMsg,
    startRecording,
    stopRecording,
    handleFileUpload,
    togglePlayBuffer,
  };
}
