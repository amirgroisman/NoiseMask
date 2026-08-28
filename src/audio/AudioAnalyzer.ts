import type { DetectedPeak } from '../types/experiment';

export class AudioAnalyzer {
  private ctx: AudioContext;
  private analyserNode: AnalyserNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 8192; // High resolution for low frequencies (20-500Hz)
    this.analyserNode.smoothingTimeConstant = 0.8;
  }

  public getAnalyserNode(): AnalyserNode {
    return this.analyserNode;
  }

  public getLiveFrequencyData(outputArray: Float32Array): void {
    this.analyserNode.getFloatFrequencyData(outputArray as unknown as Float32Array<ArrayBuffer>);
  }

  public getLiveTimeDomainData(outputArray: Float32Array): void {
    this.analyserNode.getFloatTimeDomainData(outputArray as unknown as Float32Array<ArrayBuffer>);
  }

  /**
   * Analyzes an AudioBuffer (from mic recording or file upload) using FFT and detects dominant frequency peaks.
   */
  public analyzeAudioBuffer(
    buffer: AudioBuffer,
    minFreq: number = 20,
    maxFreq: number = 500
  ): {
    peaks: DetectedPeak[];
    frequencies: Float32Array;
    magnitudesDb: Float32Array;
  } {
    const channelData = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    
    // Choose FFT window size (power of 2)
    const N = Math.min(16384, 1 << Math.floor(Math.log2(channelData.length)));
    if (N < 256) {
      return { peaks: [], frequencies: new Float32Array(0), magnitudesDb: new Float32Array(0) };
    }

    // Apply Hanning Window to middle slice of buffer
    const offset = Math.max(0, Math.floor((channelData.length - N) / 2));
    const real = new Float32Array(N);
    const imag = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      const windowVal = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
      real[i] = channelData[offset + i] * windowVal;
      imag[i] = 0;
    }

    // Perform In-Place Radix-2 FFT
    this.computeFFT(real, imag);

    // Compute magnitude spectrum
    const halfN = N / 2;
    const binWidth = sampleRate / N;
    const magnitudesDb = new Float32Array(halfN);
    const frequencies = new Float32Array(halfN);

    for (let k = 0; k < halfN; k++) {
      frequencies[k] = k * binWidth;
      const mag = Math.sqrt(real[k] * real[k] + imag[k] * imag[k]) / N;
      magnitudesDb[k] = 20 * Math.log10(Math.max(1e-7, mag));
    }

    // Detect Peaks between minFreq and maxFreq
    const minBin = Math.max(1, Math.floor(minFreq / binWidth));
    const maxBin = Math.min(halfN - 2, Math.ceil(maxFreq / binWidth));

    const rawPeaks: { bin: number; freq: number; db: number; prominence: number }[] = [];

    for (let k = minBin; k <= maxBin; k++) {
      const prev = magnitudesDb[k - 1];
      const curr = magnitudesDb[k];
      const next = magnitudesDb[k + 1];

      // Local maximum
      if (curr > prev && curr > next && curr > -80) {
        // Parabolic / Quadratic Peak Interpolation for sub-bin frequency accuracy
        const alpha = prev;
        const beta = curr;
        const gamma = next;
        const delta = (0.5 * (alpha - gamma)) / (alpha - 2 * beta + gamma);
        const interpolatedFreq = (k + delta) * binWidth;
        const interpolatedDb = beta - 0.25 * (alpha - gamma) * delta;

        // Estimate prominence against local noise floor
        let localMin = 100;
        const windowSize = Math.max(3, Math.floor(25 / binWidth)); // ~25Hz window
        for (let j = Math.max(0, k - windowSize); j <= Math.min(halfN - 1, k + windowSize); j++) {
          if (magnitudesDb[j] < localMin) localMin = magnitudesDb[j];
        }
        const prominence = interpolatedDb - localMin;

        if (prominence >= 3.0 && interpolatedFreq >= minFreq && interpolatedFreq <= maxFreq) {
          rawPeaks.push({
            bin: k,
            freq: Math.round(interpolatedFreq * 10) / 10,
            db: Math.round(interpolatedDb * 10) / 10,
            prominence: Math.round(prominence * 10) / 10,
          });
        }
      }
    }

    // Sort peaks by prominence and magnitude
    rawPeaks.sort((a, b) => b.prominence + b.db * 0.5 - (a.prominence + a.db * 0.5));

    // Deduplicate peaks that are too close (within 1.5 Hz)
    const deduped: DetectedPeak[] = [];
    for (const p of rawPeaks) {
      const exists = deduped.some(existing => Math.abs(existing.frequency - p.freq) < 1.5);
      if (!exists) {
        deduped.push({
          frequency: p.freq,
          magnitude: Math.pow(10, p.db / 20),
          prominence: p.prominence,
          db: p.db,
        });
      }
    }

    return {
      peaks: deduped.slice(0, 8), // Top 8 peaks
      frequencies,
      magnitudesDb,
    };
  }

  /**
   * Cooley-Tukey Radix-2 Decimation-in-Time FFT
   */
  private computeFFT(real: Float32Array, imag: Float32Array): void {
    const n = real.length;
    let j = 0;
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        const tr = real[i];
        real[i] = real[j];
        real[j] = tr;
        const ti = imag[i];
        imag[i] = imag[j];
        imag[j] = ti;
      }
      let k = n >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }

    for (let l = 2; l <= n; l <<= 1) {
      const halfL = l >> 1;
      const angle = (-2 * Math.PI) / l;
      const wStepR = Math.cos(angle);
      const wStepI = Math.sin(angle);

      for (let i = 0; i < n; i += l) {
        let wR = 1.0;
        let wI = 0.0;
        for (let m = 0; m < halfL; m++) {
          const idx1 = i + m;
          const idx2 = idx1 + halfL;
          const tr = wR * real[idx2] - wI * imag[idx2];
          const ti = wR * imag[idx2] + wI * real[idx2];

          real[idx2] = real[idx1] - tr;
          imag[idx2] = imag[idx1] - ti;
          real[idx1] += tr;
          imag[idx1] += ti;

          const nextWR = wR * wStepR - wI * wStepI;
          wI = wR * wStepI + wI * wStepR;
          wR = nextWR;
        }
      }
    }
  }
}
