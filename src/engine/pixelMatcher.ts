import type { MappingStrategy, SampledImageData } from '../types';

export interface MatchedParticles {
  count: number;
  sourcePositions: Float32Array; // [x0, y0, ...]
  targetPositions: Float32Array; // [tx0, ty0, ...]
  sourceColors: Float32Array;    // [r0, g0, b0, a0, ...]
  targetColors: Float32Array;    // [tr0, tg0, tb0, ta0, ...]
  randomParams: Float32Array;    // [scatterRadius, angleOffset, speedFactor, delayOffset]
}

/**
 * Computes 2D Morton Z-order code for spatial sorting
 */
function getMortonCode(xNorm: number, yNorm: number): number {
  // Map [-1, 1] to [0, 1023] integer
  const x = Math.max(0, Math.min(1023, Math.floor((xNorm + 1) * 511.5)));
  const y = Math.max(0, Math.min(1023, Math.floor((yNorm + 1) * 511.5)));

  // Interleave bits
  let z = 0;
  for (let i = 0; i < 10; i++) {
    z |= ((x >> i) & 1) << (2 * i);
    z |= ((y >> i) & 1) << (2 * i + 1);
  }
  return z;
}

/**
 * Creates matched particle buffers with intelligent spatial & luminance ordering
 */
export function matchPixels(
  source: SampledImageData,
  target: SampledImageData,
  strategy: MappingStrategy
): MatchedParticles {
  const count = Math.min(source.count, target.count);

  // Create indexing arrays
  const sourceIndices = new Int32Array(count);
  const targetIndices = new Int32Array(count);
  for (let i = 0; i < count; i++) {
    sourceIndices[i] = i;
    targetIndices[i] = i;
  }

  if (strategy === 'harmonic') {
    // Spatial grid + Luminance sorting
    const BINS = 8;
    const getHarmonicKey = (
      posArr: Float32Array,
      lumArr: Float32Array,
      idx: number
    ) => {
      const x = posArr[idx * 2];
      const y = posArr[idx * 2 + 1];
      const lum = lumArr[idx];
      const bx = Math.max(0, Math.min(BINS - 1, Math.floor((x + 1) * 0.5 * BINS)));
      const by = Math.max(0, Math.min(BINS - 1, Math.floor((y + 1) * 0.5 * BINS)));
      const binIdx = by * BINS + bx;
      return binIdx * 1000 + Math.floor(lum * 999);
    };

    sourceIndices.sort((a, b) => 
      getHarmonicKey(source.positions, source.luminances, a) - 
      getHarmonicKey(source.positions, source.luminances, b)
    );

    targetIndices.sort((a, b) => 
      getHarmonicKey(target.positions, target.luminances, a) - 
      getHarmonicKey(target.positions, target.luminances, b)
    );
  } else if (strategy === 'spatial') {
    // Spatial Morton Z-Order curve
    sourceIndices.sort((a, b) => {
      const m1 = getMortonCode(source.positions[a * 2], source.positions[a * 2 + 1]);
      const m2 = getMortonCode(source.positions[b * 2], source.positions[b * 2 + 1]);
      return m1 - m2;
    });

    targetIndices.sort((a, b) => {
      const m1 = getMortonCode(target.positions[a * 2], target.positions[a * 2 + 1]);
      const m2 = getMortonCode(target.positions[b * 2], target.positions[b * 2 + 1]);
      return m1 - m2;
    });
  } else if (strategy === 'luminance') {
    // Luminance sorting: light to light, dark to dark
    sourceIndices.sort((a, b) => source.luminances[a] - source.luminances[b]);
    targetIndices.sort((a, b) => target.luminances[a] - target.luminances[b]);
  } else {
    // Quantum dispersion: pseudorandom deterministic shuffle
    for (let i = count - 1; i > 0; i--) {
      const j = (i * 9301 + 49297) % 233280 % (i + 1);
      const temp = targetIndices[i];
      targetIndices[i] = targetIndices[j];
      targetIndices[j] = temp;
    }
  }

  // Allocate aligned matched buffers
  const sourcePositions = new Float32Array(count * 2);
  const targetPositions = new Float32Array(count * 2);
  const sourceColors = new Float32Array(count * 4);
  const targetColors = new Float32Array(count * 4);
  const randomParams = new Float32Array(count * 4);

  for (let i = 0; i < count; i++) {
    const sIdx = sourceIndices[i];
    const tIdx = targetIndices[i];

    // Source Position
    const sx = source.positions[sIdx * 2];
    const sy = source.positions[sIdx * 2 + 1];
    sourcePositions[i * 2] = sx;
    sourcePositions[i * 2 + 1] = sy;

    // Target Position
    targetPositions[i * 2] = target.positions[tIdx * 2];
    targetPositions[i * 2 + 1] = target.positions[tIdx * 2 + 1];

    // Source Color
    sourceColors[i * 4] = source.colors[sIdx * 4];
    sourceColors[i * 4 + 1] = source.colors[sIdx * 4 + 1];
    sourceColors[i * 4 + 2] = source.colors[sIdx * 4 + 2];
    sourceColors[i * 4 + 3] = source.colors[sIdx * 4 + 3];

    // Target Color
    targetColors[i * 4] = target.colors[tIdx * 4];
    targetColors[i * 4 + 1] = target.colors[tIdx * 4 + 1];
    targetColors[i * 4 + 2] = target.colors[tIdx * 4 + 2];
    targetColors[i * 4 + 3] = target.colors[tIdx * 4 + 3];

    // Gentle progressive cascade (subtle, soft flow from top to bottom)
    const delayOffset = Math.max(0, Math.min(0.20, (1.0 - sy / 0.40) * 0.04 + Math.random() * 0.03));
    
    // Very small, subtle lateral drift (serene, tranquil, no wild dispersion)
    const scatterRadius = 0.015 + Math.random() * 0.025;
    const angleOffset = Math.random() * Math.PI * 2;
    const speedFactor = 1.0;

    randomParams[i * 4] = scatterRadius;
    randomParams[i * 4 + 1] = angleOffset;
    randomParams[i * 4 + 2] = speedFactor;
    randomParams[i * 4 + 3] = delayOffset;
  }

  return {
    count,
    sourcePositions,
    targetPositions,
    sourceColors,
    targetColors,
    randomParams
  };
}
