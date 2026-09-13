/**
 * Procedural Web Audio API sound generator (disabled - silent mode)
 */
class ProceduralAudioEngine {
  public setMuted(_muted: boolean) {}

  public getMuted(): boolean {
    return true;
  }

  public playDisintegrate() {}

  public playConvergence() {}

  public updateFlowProgress(_progress: number) {}
}

export const audioEngine = new ProceduralAudioEngine();

