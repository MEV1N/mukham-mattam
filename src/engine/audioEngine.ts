/**
 * Procedural Web Audio API sound generator for Pixel Shift
 */
class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private flowGain: GainNode | null = null;
  private flowOsc: OscillatorNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.flowGain) {
      this.flowGain.gain.linearRampToValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound when disintegration begins: sub-bass rumble & rising frequency sweep
   */
  public playDisintegrate() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Soft warm ambient sine swell (subtle and relaxing)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 2.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.2);
  }

  /**
   * Sound when particles reorganize & crystalize into the target: crystalline chord
   */
  public playConvergence() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Harmonic pentatonic crystalline chime: C5, E5, G5, B5, D6
    const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const hitTime = now + idx * 0.08;
      gain.gain.setValueAtTime(0.0001, hitTime);
      gain.gain.linearRampToValueAtTime(0.025, hitTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, hitTime + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(hitTime);
      osc.stop(hitTime + 2.2);
    });
  }

  /**
   * Continuous gentle vortex hum updated with progress
   */
  public updateFlowProgress(progress: number) {
    if (this.isMuted || !this.ctx) return;
    
    // Middle progress arch
    const arch = Math.sin(progress * Math.PI);
    if (arch > 0.1 && !this.flowOsc) {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;
      this.flowOsc = ctx.createOscillator();
      this.flowGain = ctx.createGain();
      this.flowOsc.type = 'sine';
      this.flowOsc.frequency.setValueAtTime(95, ctx.currentTime);
      this.flowGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      this.flowOsc.connect(this.flowGain);
      this.flowGain.connect(ctx.destination);
      this.flowOsc.start();
    }

    if (this.flowGain && this.ctx) {
      const targetVol = Math.max(0.0001, arch * 0.015);
      this.flowGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
    }

    if (progress >= 0.95 && this.flowOsc) {
      try {
        this.flowOsc.stop();
        this.flowOsc.disconnect();
      } catch {
        // already stopped
      }
      this.flowOsc = null;
      this.flowGain = null;
    }
  }
}

export const audioEngine = new ProceduralAudioEngine();
