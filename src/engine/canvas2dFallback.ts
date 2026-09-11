import type { ShiftSettings } from '../types';
import type { MatchedParticles } from './pixelMatcher';

export class Canvas2DRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: MatchedParticles | null = null;
  private mousePos = { x: -999, y: -999 };
  private mouseForce = 0;
  private targetMouseForce = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  public uploadParticles(data: MatchedParticles) {
    this.particles = data;
  }

  public setMouse(normalizedX: number, normalizedY: number, active: boolean) {
    this.mousePos.x = normalizedX;
    this.mousePos.y = normalizedY;
    this.targetMouseForce = active ? 1.0 : 0.0;
  }

  public render(progress: number, _timeSec: number, settings: ShiftSettings) {
    const ctx = this.ctx;
    if (!ctx || !this.particles) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const halfW = width * 0.5;
    const halfH = height * 0.5;

    ctx.clearRect(0, 0, width, height);

    this.mouseForce += (this.targetMouseForce - this.mouseForce) * 0.15;

    const count = this.particles.count;
    const sp = this.particles.sourcePositions;
    const tp = this.particles.targetPositions;
    const sc = this.particles.sourceColors;
    const tc = this.particles.targetColors;
    const rp = this.particles.randomParams;

    const size = settings.particleSize;
    const halfSize = size * 0.5;
    const randomness = settings.randomness;
    const colorMode = settings.colorMode;

    ctx.globalCompositeOperation = 'screen';

    // Step through particles (subsample if count is large for 2D canvas performance)
    const step = count > 30000 ? 2 : 1;

    for (let i = 0; i < count; i += step) {
      const delay = rp[i * 4 + 3];
      const scatter = rp[i * 4];
      const angle = rp[i * 4 + 1];

      const localT = Math.max(0, Math.min(1, (progress - delay * 0.22) / Math.max(0.001, 1 - delay * 0.22)));
      // C2 Smootherstep ease
      const easedT = localT * localT * localT * (localT * (localT * 6.0 - 15.0) + 10.0);

      const sx = sp[i * 2];
      const sy = sp[i * 2 + 1];
      const tx = tp[i * 2];
      const ty = tp[i * 2 + 1];

      let bx = sx + (tx - sx) * easedT;
      let by = sy + (ty - sy) * easedT;

      const arch = Math.sin(localT * Math.PI);
      if (arch > 0.001) {
        const rad = scatter * randomness * (arch * arch);
        bx += Math.cos(angle) * rad;
        by += Math.sin(angle) * rad;
      }

      // Delicate mouse deflection
      if (this.mouseForce > 0.01) {
        const dx = bx - this.mousePos.x;
        const dy = by - this.mousePos.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.16 && d > 0.0001) {
          const inf = (1 - d / 0.16) ** 2 * this.mouseForce * 0.015;
          bx += (dx / d) * inf;
          by += (dy / d) * inf;
        }
      }

      // Convert WebGL [-1, 1] to screen [0, W]
      const px = halfW + bx * halfW - halfSize;
      const py = halfH - by * halfH - halfSize; // invert y

      // Color
      let r = sc[i * 4];
      let g = sc[i * 4 + 1];
      let b = sc[i * 4 + 2];
      const a = sc[i * 4 + 3];

      if (colorMode === 'morph') {
        r += (tc[i * 4] - r) * easedT;
        g += (tc[i * 4 + 1] - g) * easedT;
        b += (tc[i * 4 + 2] - b) * easedT;
      }

      ctx.fillStyle = `rgba(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)}, ${a})`;
      ctx.fillRect(px, py, size, size);
    }
  }

  public isSupported(): boolean {
    return this.ctx !== null;
  }

  public destroy() {
    this.particles = null;
  }
}
