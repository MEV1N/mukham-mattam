export type Phase = 'idle' | 'disintegrating' | 'flowing' | 'converging' | 'crystallized';

export type EasingType = 'cinematic' | 'explosive' | 'gravitational' | 'quantum';

export type MappingStrategy = 'harmonic' | 'spatial' | 'luminance' | 'dispersion';

export type ColorMode = 'source' | 'morph' | 'chroma';

export type DensityTier = 'low' | 'medium' | 'high' | 'ultra';

export interface ShiftSettings {
  duration: number; // in seconds (2 to 10)
  density: DensityTier;
  particleSize: number; // in pixels (1 to 6)
  randomness: number; // 0 to 1 (turbulence intensity)
  easing: EasingType;
  mapping: MappingStrategy;
  colorMode: ColorMode;
  audioEnabled: boolean;
}

export interface SampledImageData {
  width: number;
  height: number;
  count: number;
  positions: Float32Array; // [x0, y0, x1, y1, ...] in normalized coords [-1, 1]
  colors: Float32Array; // [r0, g0, b0, a0, ...] in [0, 1]
  luminances: Float32Array; // [l0, l1, ...] in [0, 1]
}

export interface PresetImage {
  id: string;
  name: string;
  category: string;
  thumbnail: string; // data URI or SVG
  dataUri: string;
}

export interface Telemetry {
  fps: number;
  particleCount: number;
  drawCalls: number;
  renderEngine: 'WebGL' | 'Canvas2D';
}
