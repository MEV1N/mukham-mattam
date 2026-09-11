import type { PresetImage } from '../types';

/**
 * Generates an ultra high-contrast, artistic 512x512 image using offscreen Canvas
 */
function createPresetDataUri(drawFn: (ctx: CanvasRenderingContext2D, size: number) => void): string {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Transparent background so only subject pixels are sampled as particles
  ctx.clearRect(0, 0, size, size);

  drawFn(ctx, size);

  return canvas.toDataURL('image/png');
}

// Preset 1: Cyberpunk Neon Skull
const skullDataUri = createPresetDataUri((ctx, s) => {
  const center = s / 2;

  // Background radial glow
  const bgGrad = ctx.createRadialGradient(center, center, 50, center, center, 240);
  bgGrad.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
  bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, s, s);

  // Skull cranium
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.arc(center, center - 40, 110, Math.PI * 0.8, Math.PI * 2.2);
  ctx.lineTo(center + 65, center + 90);
  ctx.lineTo(center - 65, center + 90);
  ctx.closePath();
  ctx.fill();

  // Cheekbones & Jaw
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(center - 50, center + 85, 100, 45);

  // Neon Teeth
  ctx.fillStyle = '#00f0ff';
  for (let i = -35; i <= 35; i += 18) {
    ctx.fillRect(center + i - 6, center + 90, 12, 16);
    ctx.fillRect(center + i - 6, center + 110, 12, 16);
  }

  // Eye sockets
  ctx.fillStyle = '#07090e';
  ctx.beginPath();
  ctx.ellipse(center - 45, center - 20, 32, 40, -0.15, 0, Math.PI * 2);
  ctx.ellipse(center + 45, center - 20, 32, 40, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Glowing cyber iris
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(center - 45, center - 20, 14, 0, Math.PI * 2);
  ctx.arc(center + 45, center - 20, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Nasal cavity
  ctx.fillStyle = '#07090e';
  ctx.beginPath();
  ctx.moveTo(center, center + 25);
  ctx.lineTo(center - 15, center + 55);
  ctx.lineTo(center + 15, center + 55);
  ctx.closePath();
  ctx.fill();

  // Cyber circuits on cranium
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(center - 80, center - 80);
  ctx.lineTo(center - 30, center - 110);
  ctx.lineTo(center + 30, center - 110);
  ctx.lineTo(center + 80, center - 70);
  ctx.stroke();
  ctx.shadowBlur = 0;
});

// Preset 2: Apollo Astronaut Visor
const astronautDataUri = createPresetDataUri((ctx, s) => {
  const center = s / 2;

  // Helmet outer shell
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(center, center, 170, 0, Math.PI * 2);
  ctx.fill();

  // Helmet collar & suit
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(center - 160, center + 140, 320, 120);

  // Visor rim
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(center, center - 10, 130, 105, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gold reflective visor
  const visorGrad = ctx.createLinearGradient(center - 110, center - 90, center + 110, center + 80);
  visorGrad.addColorStop(0, '#f59e0b');
  visorGrad.addColorStop(0.3, '#d97706');
  visorGrad.addColorStop(0.6, '#4f46e5');
  visorGrad.addColorStop(1, '#06b6d4');
  ctx.fillStyle = visorGrad;
  ctx.beginPath();
  ctx.ellipse(center, center - 10, 118, 92, 0, 0, Math.PI * 2);
  ctx.fill();

  // Reflected Earth in visor
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(center - 30, center - 25, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(center - 40, center - 30, 18, 0, Math.PI * 2);
  ctx.fill();

  // Sun flare specular glare
  const flareGrad = ctx.createRadialGradient(center + 45, center - 45, 2, center + 45, center - 45, 60);
  flareGrad.addColorStop(0, '#ffffff');
  flareGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  flareGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = flareGrad;
  ctx.beginPath();
  ctx.arc(center + 45, center - 45, 60, 0, Math.PI * 2);
  ctx.fill();
});

// Preset 3: Bioluminescent Lotus
const lotusDataUri = createPresetDataUri((ctx, s) => {
  const center = s / 2;

  // Water ripples
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.lineWidth = 2;
  for (let r = 80; r < 240; r += 40) {
    ctx.beginPath();
    ctx.ellipse(center, center + 80, r, r * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Outer glowing petals
  const petals = 12;
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    ctx.save();
    ctx.translate(center, center + 40);
    ctx.rotate(angle);

    const grad = ctx.createLinearGradient(0, 0, 0, -140);
    grad.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
    grad.addColorStop(0.7, 'rgba(236, 72, 153, 0.8)');
    grad.addColorStop(1, '#00f0ff');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-45, -70, 0, -140);
    ctx.quadraticCurveTo(45, -70, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  // Inner radiant golden core
  const coreGrad = ctx.createRadialGradient(center, center + 40, 5, center, center + 40, 50);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.4, '#fbbf24');
  coreGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(center, center + 40, 50, 0, Math.PI * 2);
  ctx.fill();
});

// Preset 4: Quantum Eye
const eyeDataUri = createPresetDataUri((ctx, s) => {
  const center = s / 2;

  // Sclera / Eye shape
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(center - 210, center);
  ctx.quadraticCurveTo(center, center - 150, center + 210, center);
  ctx.quadraticCurveTo(center, center + 150, center - 210, center);
  ctx.fill();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Iris outer glow
  const irisGrad = ctx.createRadialGradient(center, center, 20, center, center, 95);
  irisGrad.addColorStop(0, '#00f0ff');
  irisGrad.addColorStop(0.4, '#3b82f6');
  irisGrad.addColorStop(0.8, '#8b5cf6');
  irisGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(center, center, 95, 0, Math.PI * 2);
  ctx.fill();

  // Iris radial fibers
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += 0.1) {
    ctx.beginPath();
    ctx.moveTo(center + Math.cos(a) * 35, center + Math.sin(a) * 35);
    ctx.lineTo(center + Math.cos(a) * 90, center + Math.sin(a) * 90);
    ctx.stroke();
  }

  // Pupil
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(center, center, 35, 0, Math.PI * 2);
  ctx.fill();

  // Specular light reflection
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(center - 15, center - 18, 12, 0, Math.PI * 2);
  ctx.arc(center + 12, center + 14, 6, 0, Math.PI * 2);
  ctx.fill();
});

// Preset 5: Solar Eclipse
const eclipseDataUri = createPresetDataUri((ctx, s) => {
  const center = s / 2;

  // Corona rays
  const rays = 36;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 4;
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    const len = 140 + Math.sin(i * 3) * 50;
    ctx.beginPath();
    ctx.moveTo(center + Math.cos(angle) * 110, center + Math.sin(angle) * 110);
    ctx.lineTo(center + Math.cos(angle) * (110 + len), center + Math.sin(angle) * (110 + len));
    ctx.stroke();
  }

  // Glowing outer corona
  const coronaGrad = ctx.createRadialGradient(center, center, 100, center, center, 200);
  coronaGrad.addColorStop(0, '#fef08a');
  coronaGrad.addColorStop(0.3, '#f59e0b');
  coronaGrad.addColorStop(0.7, '#ea580c');
  coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(center, center, 200, 0, Math.PI * 2);
  ctx.fill();

  // Diamond ring effect (bright flare at top right)
  const flareGrad = ctx.createRadialGradient(center + 75, center - 75, 4, center + 75, center - 75, 70);
  flareGrad.addColorStop(0, '#ffffff');
  flareGrad.addColorStop(0.4, '#fed7aa');
  flareGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = flareGrad;
  ctx.beginPath();
  ctx.arc(center + 75, center - 75, 70, 0, Math.PI * 2);
  ctx.fill();

  // Dark lunar silhouette
  ctx.fillStyle = '#020408';
  ctx.beginPath();
  ctx.arc(center, center, 110, 0, Math.PI * 2);
  ctx.fill();
});

// Preset 6: Geometric Mandala
const mandalaDataUri = createPresetDataUri((ctx, s) => {
  const center = s / 2;

  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;

  for (let r = 40; r <= 180; r += 28) {
    const points = (r / 28) * 3 + 3;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const x = center + Math.cos(a) * r;
      const y = center + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(center, center - 160);
  ctx.lineTo(center + 140, center + 85);
  ctx.lineTo(center - 140, center + 85);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#a855f7';
  ctx.beginPath();
  ctx.moveTo(center, center + 160);
  ctx.lineTo(center + 140, center - 85);
  ctx.lineTo(center - 140, center - 85);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(center, center, 14, 0, Math.PI * 2);
  ctx.fill();
});

export const CAPPIBARA_IMAGE: PresetImage = {
  id: 'cappibara',
  name: 'Cappibara',
  category: 'Target Form',
  thumbnail: '/cappibara.jpeg',
  dataUri: '/cappibara.jpeg'
};

export const NANDHANA_IMAGE = CAPPIBARA_IMAGE;

export const PRESET_IMAGES: PresetImage[] = [
  CAPPIBARA_IMAGE,
  {
    id: 'cyber-skull',
    name: 'Cyber Skull',
    category: 'Cyberpunk',
    thumbnail: skullDataUri,
    dataUri: skullDataUri
  },
  {
    id: 'astronaut',
    name: 'Cosmic Visor',
    category: 'Sci-Fi',
    thumbnail: astronautDataUri,
    dataUri: astronautDataUri
  },
  {
    id: 'lotus',
    name: 'Neon Lotus',
    category: 'Nature',
    thumbnail: lotusDataUri,
    dataUri: lotusDataUri
  },
  {
    id: 'quantum-eye',
    name: 'Quantum Eye',
    category: 'Vision',
    thumbnail: eyeDataUri,
    dataUri: eyeDataUri
  },
  {
    id: 'solar-eclipse',
    name: 'Solar Eclipse',
    category: 'Cosmos',
    thumbnail: eclipseDataUri,
    dataUri: eclipseDataUri
  },
  {
    id: 'geometric-mandala',
    name: 'Sacred Mandala',
    category: 'Abstract',
    thumbnail: mandalaDataUri,
    dataUri: mandalaDataUri
  }
];
