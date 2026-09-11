import type { SampledImageData } from '../types';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Samples pixels from an image to generate particle representations
 */
export function sampleImagePixels(
  img: HTMLImageElement,
  targetCount: number
): SampledImageData {
  const aspectRatio = img.naturalWidth / img.naturalHeight || 1;
  
  // Choose working resolution based on target count
  let gridH = Math.round(Math.sqrt(targetCount / aspectRatio));
  let gridW = Math.round(gridH * aspectRatio);

  gridW = Math.max(40, Math.min(500, gridW));
  gridH = Math.max(40, Math.min(500, gridH));

  const canvas = document.createElement('canvas');
  canvas.width = gridW;
  canvas.height = gridH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to create offscreen 2D canvas context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, gridW, gridH);

  const imgData = ctx.getImageData(0, 0, gridW, gridH);
  const data = imgData.data;

  // Intimate, refined scale (small, graceful, generous relaxing negative space)
  let scaleX = 0.38;
  let scaleY = 0.38;
  if (aspectRatio > 1) {
    scaleY = scaleX / aspectRatio;
  } else {
    scaleX = scaleY * aspectRatio;
  }

  // First pass: collect valid candidate pixels
  const candidateIndices: number[] = [];
  const totalPixels = gridW * gridH;

  for (let i = 0; i < totalPixels; i++) {
    const alpha = data[i * 4 + 3];
    // Skip completely transparent pixels if any
    if (alpha > 15) {
      candidateIndices.push(i);
    }
  }

  // If candidate count is less than 50 (e.g. practically empty image), fall back to all
  const useIndices = candidateIndices.length > 50 ? candidateIndices : Array.from({ length: totalPixels }, (_, i) => i);

  // Subsample or duplicate to hit targetCount
  const finalIndices: number[] = [];
  if (useIndices.length <= targetCount) {
    // Replicate / oversample
    const ratio = targetCount / useIndices.length;
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.floor(i / ratio);
      finalIndices.push(useIndices[idx % useIndices.length]);
    }
  } else {
    // Downsample uniformly
    const step = useIndices.length / targetCount;
    for (let i = 0; i < targetCount; i++) {
      finalIndices.push(useIndices[Math.floor(i * step)]);
    }
  }

  const count = finalIndices.length;
  const positions = new Float32Array(count * 2);
  const colors = new Float32Array(count * 4);
  const luminances = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const pixelIdx = finalIndices[i];
    const x = pixelIdx % gridW;
    const y = Math.floor(pixelIdx / gridW);

    // Subtle jitter to break up grid banding
    const jitterX = (Math.random() - 0.5) * (0.8 / gridW);
    const jitterY = (Math.random() - 0.5) * (0.8 / gridH);

    const nx = (((x / (gridW - 1)) * 2 - 1) + jitterX) * scaleX;
    const ny = (((1 - (y / (gridH - 1)) * 2)) + jitterY) * scaleY;

    const pOffset = pixelIdx * 4;
    const r = data[pOffset] / 255;
    const g = data[pOffset + 1] / 255;
    const b = data[pOffset + 2] / 255;
    const a = data[pOffset + 3] / 255;

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    positions[i * 2] = nx;
    positions[i * 2 + 1] = ny;

    colors[i * 4] = r;
    colors[i * 4 + 1] = g;
    colors[i * 4 + 2] = b;
    colors[i * 4 + 3] = a;

    luminances[i] = lum;
  }

  return {
    width: gridW,
    height: gridH,
    count,
    positions,
    colors,
    luminances
  };
}
