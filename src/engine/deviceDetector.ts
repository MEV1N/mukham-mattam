import type { DensityTier } from '../types';

export interface DeviceProfile {
  tier: DensityTier;
  targetCount: number;
  isMobile: boolean;
  hasWebGL: boolean;
  dpr: number;
}

export function detectDeviceCapabilities(): DeviceProfile {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Check WebGL availability
  let hasWebGL = false;
  try {
    const canvas = document.createElement('canvas');
    hasWebGL = Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    hasWebGL = false;
  }

  // Determine appropriate tier
  let tier: DensityTier = 'high';
  if (!hasWebGL) {
    tier = 'low';
  } else if (isMobile) {
    tier = 'medium';
  } else {
    // Check hardware concurrency if available
    const cores = navigator.hardwareConcurrency || 4;
    if (cores >= 8) {
      tier = 'high';
    } else if (cores <= 2) {
      tier = 'medium';
    }
  }

  const counts: Record<DensityTier, number> = {
    low: 25000,
    medium: 50000,
    high: 90000,
    ultra: 140000
  };

  return {
    tier,
    targetCount: counts[tier],
    isMobile,
    hasWebGL,
    dpr
  };
}

export function getParticleCountForTier(tier: DensityTier): number {
  const counts: Record<DensityTier, number> = {
    low: 25000,
    medium: 50000,
    high: 90000,
    ultra: 140000
  };
  return counts[tier] || 70000;
}
