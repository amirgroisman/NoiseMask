/**
 * AudioUtils - Helper functions for smooth parameter changes, phase delays, and acoustic math.
 */

export const SMOOTH_TIME_CONSTANT = 0.025; // 25ms time constant for smooth, pop-free ramps

/**
 * Smoothly ramps an AudioParam to a target value using exponential approach (setTargetAtTime).
 */
export function smoothParamChange(
  param: AudioParam,
  targetValue: number,
  currentTime: number,
  timeConstant: number = SMOOTH_TIME_CONSTANT
): void {
  // Prevent zero or negative values in exponential ramps if applicable, but setTargetAtTime handles 0 fine
  param.setTargetAtTime(targetValue, currentTime, timeConstant);
}

/**
 * Calculates the required delay in seconds to achieve a given phase shift (0-360 deg) at a specific frequency.
 * Formula: delay = (phase / 360) / frequency
 */
export function phaseToDelaySeconds(phaseDegrees: number, frequencyHz: number): number {
  if (frequencyHz <= 0) return 0;
  const normalizedPhase = ((phaseDegrees % 360) + 360) % 360;
  return (normalizedPhase / 360) / frequencyHz;
}

/**
 * Converts a UI gain value (0.0 to 1.0) to an acoustic perceptual gain curve.
 * Uses a modified logarithmic/exponential taper to ensure smooth control at low volumes.
 */
export function uiGainToAcousticGain(uiGain: number): number {
  if (uiGain <= 0.001) return 0;
  if (uiGain >= 1) return 1;
  // Perceptual curve: gain = val^2 (or (10^(val*2) - 1)/99)
  return Math.pow(uiGain, 1.8);
}

/**
 * Computes Q factor for a bandpass filter from center frequency and bandwidth.
 * Q = f0 / delta_f
 */
export function bandwidthToQ(centerFrequency: number, bandwidth: number): number {
  if (bandwidth <= 0) return 10;
  const q = centerFrequency / Math.max(0.5, bandwidth);
  return Math.min(100, Math.max(0.1, q));
}

/**
 * Formats frequency with 0.1 Hz resolution
 */
export function formatHz(hz: number): string {
  return hz.toFixed(1) + ' Hz';
}
