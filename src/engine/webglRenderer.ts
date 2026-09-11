import type { ColorMode, EasingType, ShiftSettings } from '../types';
import type { MatchedParticles } from './pixelMatcher';

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_sourcePos;
attribute vec2 a_targetPos;
attribute vec4 a_sourceColor;
attribute vec4 a_targetColor;
attribute vec4 a_randomParams; // [scatterRadius, angleOffset, speedFactor, delayOffset]

uniform float u_progress;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_mouseForce;
uniform float u_randomness;
uniform int u_easingType;
uniform int u_colorMode;
uniform float u_particleSize;
uniform float u_aspect;

varying vec4 v_color;
varying float v_arch;

// Perlin C2 Smootherstep: zero 1st and 2nd derivatives for serene, fluid gliding
float sereneSmoother(float t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  float delay = a_randomParams.w;
  
  // Smoothly distributed local time per particle with gentle stagger
  float localT = clamp((u_progress - delay * 0.22) / max(0.001, 1.0 - delay * 0.22), 0.0, 1.0);
  
  // Velvety, relaxing easing curve (no jerky snaps)
  float easedT = sereneSmoother(localT);

  // Direct, smooth base trajectory from source to target
  vec2 basePos = mix(a_sourcePos, a_targetPos, easedT);

  // Soft, symmetrical arch envelope peaking gently at midpoint
  float arch = sin(localT * 3.14159265);
  v_arch = arch;

  // Subtle, relaxing laminar drift (pure smooth curve, NO quirky spinning or wiggling)
  float angle = a_randomParams.y;
  vec2 driftDir = vec2(cos(angle), sin(angle));
  
  // Tiny lateral breathing offset (subtle and relaxing)
  float driftMag = a_randomParams.x * u_randomness * (arch * arch);
  vec2 displacement = driftDir * driftMag;

  vec2 currentPos = basePos + displacement;

  // Whisper-soft mouse interaction (calm and delicate)
  if (u_mouseForce > 0.01) {
    vec2 mouseVec = currentPos - u_mouse;
    mouseVec.x *= u_aspect;
    float mouseDist = length(mouseVec);
    float mouseRadius = 0.16;

    if (mouseDist < mouseRadius && mouseDist > 0.0001) {
      float influence = 1.0 - mouseDist / mouseRadius;
      influence = influence * influence;

      vec2 normDelta = normalize(mouseVec);
      normDelta.x /= u_aspect;

      // Extremely subtle, soft deflection
      currentPos += normDelta * 0.012 * influence * u_mouseForce;
    }
  }

  // Smooth, gradual color metamorphosis
  vec4 color = mix(a_sourceColor, a_targetColor, easedT);
  v_color = color;

  // Fine, delicate particle point size with subtle breathing
  gl_Position = vec4(currentPos, 0.0, 1.0);
  gl_PointSize = u_particleSize * (1.0 + arch * 0.10);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec4 v_color;
varying float v_arch;

void main() {
  // Circular point sprite with soft anti-aliased edge
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);

  if (dist > 0.5) {
    discard;
  }

  // Soft velvety falloff (calm, non-glaring)
  float alpha = smoothstep(0.5, 0.08, dist);
  
  // Whisper-soft gentle core illumination
  float core = smoothstep(0.20, 0.0, dist) * 0.20;

  vec3 rgb = v_color.rgb + vec3(core);

  gl_FragColor = vec4(rgb, v_color.a * alpha * 0.95);
}
`;

export class WebGLParticleRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;

  // Buffers
  private sourcePosBuffer: WebGLBuffer | null = null;
  private targetPosBuffer: WebGLBuffer | null = null;
  private sourceColorBuffer: WebGLBuffer | null = null;
  private targetColorBuffer: WebGLBuffer | null = null;
  private randomParamsBuffer: WebGLBuffer | null = null;

  // Attribute locations
  private aSourcePos = -1;
  private aTargetPos = -1;
  private aSourceColor = -1;
  private aTargetColor = -1;
  private aRandomParams = -1;

  // Uniform locations
  private uProgressLoc: WebGLUniformLocation | null = null;
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uMouseLoc: WebGLUniformLocation | null = null;
  private uMouseForceLoc: WebGLUniformLocation | null = null;
  private uRandomnessLoc: WebGLUniformLocation | null = null;
  private uEasingTypeLoc: WebGLUniformLocation | null = null;
  private uColorModeLoc: WebGLUniformLocation | null = null;
  private uParticleSizeLoc: WebGLUniformLocation | null = null;
  private uAspectLoc: WebGLUniformLocation | null = null;

  private particleCount = 0;
  private mousePos = { x: -999, y: -999 };
  private mouseForce = 0;
  private targetMouseForce = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initGL();
  }

  private initGL(): boolean {
    const gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });

    if (!gl) {
      console.warn('WebGL not supported, falling back');
      return false;
    }
    this.gl = gl;

    const vertShader = this.createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = this.createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    if (!vertShader || !fragShader) return false;

    const program = gl.createProgram();
    if (!program) return false;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('WebGL program link failed:', gl.getProgramInfoLog(program));
      return false;
    }

    this.program = program;

    // Attributes
    this.aSourcePos = gl.getAttribLocation(program, 'a_sourcePos');
    this.aTargetPos = gl.getAttribLocation(program, 'a_targetPos');
    this.aSourceColor = gl.getAttribLocation(program, 'a_sourceColor');
    this.aTargetColor = gl.getAttribLocation(program, 'a_targetColor');
    this.aRandomParams = gl.getAttribLocation(program, 'a_randomParams');

    // Uniforms
    this.uProgressLoc = gl.getUniformLocation(program, 'u_progress');
    this.uTimeLoc = gl.getUniformLocation(program, 'u_time');
    this.uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
    this.uMouseForceLoc = gl.getUniformLocation(program, 'u_mouseForce');
    this.uRandomnessLoc = gl.getUniformLocation(program, 'u_randomness');
    this.uEasingTypeLoc = gl.getUniformLocation(program, 'u_easingType');
    this.uColorModeLoc = gl.getUniformLocation(program, 'u_colorMode');
    this.uParticleSizeLoc = gl.getUniformLocation(program, 'u_particleSize');
    this.uAspectLoc = gl.getUniformLocation(program, 'u_aspect');

    // Create GPU buffers
    this.sourcePosBuffer = gl.createBuffer();
    this.targetPosBuffer = gl.createBuffer();
    this.sourceColorBuffer = gl.createBuffer();
    this.targetColorBuffer = gl.createBuffer();
    this.randomParamsBuffer = gl.createBuffer();

    return true;
  }

  private createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  public uploadParticles(data: MatchedParticles) {
    const gl = this.gl;
    if (!gl) return;

    this.particleCount = data.count;

    // Upload source positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sourcePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.sourcePositions, gl.STATIC_DRAW);

    // Upload target positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.targetPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.targetPositions, gl.STATIC_DRAW);

    // Upload source colors
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sourceColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.sourceColors, gl.STATIC_DRAW);

    // Upload target colors
    gl.bindBuffer(gl.ARRAY_BUFFER, this.targetColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.targetColors, gl.STATIC_DRAW);

    // Upload random params
    gl.bindBuffer(gl.ARRAY_BUFFER, this.randomParamsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.randomParams, gl.STATIC_DRAW);
  }

  public setMouse(normalizedX: number, normalizedY: number, active: boolean) {
    this.mousePos.x = normalizedX;
    this.mousePos.y = normalizedY;
    this.targetMouseForce = active ? 1.0 : 0.0;
  }

  public render(progress: number, timeSec: number, settings: ShiftSettings) {
    const gl = this.gl;
    if (!gl || !this.program || this.particleCount === 0) return;

    // Smoothly interpolate mouse disturbance force
    this.mouseForce += (this.targetMouseForce - this.mouseForce) * 0.15;

    // Configure viewport & clear
    const width = this.canvas.width;
    const height = this.canvas.height;
    gl.viewport(0, 0, width, height);

    gl.clearColor(0.02, 0.025, 0.035, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable high-performance additive/screen blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.useProgram(this.program);

    // Uniforms
    gl.uniform1f(this.uProgressLoc, progress);
    gl.uniform1f(this.uTimeLoc, timeSec);
    gl.uniform2f(this.uMouseLoc, this.mousePos.x, this.mousePos.y);
    gl.uniform1f(this.uMouseForceLoc, this.mouseForce);
    gl.uniform1f(this.uRandomnessLoc, settings.randomness);

    // Easing enum mapping
    const easingMap: Record<EasingType, number> = {
      cinematic: 0,
      explosive: 1,
      gravitational: 2,
      quantum: 3
    };
    gl.uniform1i(this.uEasingTypeLoc, easingMap[settings.easing] ?? 0);

    // Color mode mapping
    const colorModeMap: Record<ColorMode, number> = {
      source: 0,
      morph: 1,
      chroma: 2
    };
    gl.uniform1i(this.uColorModeLoc, colorModeMap[settings.colorMode] ?? 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    gl.uniform1f(this.uParticleSizeLoc, settings.particleSize * dpr);
    gl.uniform1f(this.uAspectLoc, width / height);

    // Bind attribute buffers
    if (this.aSourcePos >= 0) {
      gl.enableVertexAttribArray(this.aSourcePos);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.sourcePosBuffer);
      gl.vertexAttribPointer(this.aSourcePos, 2, gl.FLOAT, false, 0, 0);
    }

    if (this.aTargetPos >= 0) {
      gl.enableVertexAttribArray(this.aTargetPos);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.targetPosBuffer);
      gl.vertexAttribPointer(this.aTargetPos, 2, gl.FLOAT, false, 0, 0);
    }

    if (this.aSourceColor >= 0) {
      gl.enableVertexAttribArray(this.aSourceColor);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.sourceColorBuffer);
      gl.vertexAttribPointer(this.aSourceColor, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.aTargetColor >= 0) {
      gl.enableVertexAttribArray(this.aTargetColor);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.targetColorBuffer);
      gl.vertexAttribPointer(this.aTargetColor, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.aRandomParams >= 0) {
      gl.enableVertexAttribArray(this.aRandomParams);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.randomParamsBuffer);
      gl.vertexAttribPointer(this.aRandomParams, 4, gl.FLOAT, false, 0, 0);
    }

    gl.drawArrays(gl.POINTS, 0, this.particleCount);
  }

  public isSupported(): boolean {
    return this.gl !== null;
  }

  public getParticleCount(): number {
    return this.particleCount;
  }

  public destroy() {
    const gl = this.gl;
    if (!gl) return;

    if (this.sourcePosBuffer) gl.deleteBuffer(this.sourcePosBuffer);
    if (this.targetPosBuffer) gl.deleteBuffer(this.targetPosBuffer);
    if (this.sourceColorBuffer) gl.deleteBuffer(this.sourceColorBuffer);
    if (this.targetColorBuffer) gl.deleteBuffer(this.targetColorBuffer);
    if (this.randomParamsBuffer) gl.deleteBuffer(this.randomParamsBuffer);
    if (this.program) gl.deleteProgram(this.program);
  }
}
