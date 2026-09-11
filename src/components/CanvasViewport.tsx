import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { MatchedParticles } from '../engine/pixelMatcher';
import { WebGLParticleRenderer } from '../engine/webglRenderer';
import { Canvas2DRenderer } from '../engine/canvas2dFallback';
import { audioEngine } from '../engine/audioEngine';
import type { ShiftSettings } from '../types';

interface CanvasViewportProps {
  matchedData: MatchedParticles;
  settings: ShiftSettings;
  onDropNewImage: (file: File) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  matchedData,
  settings,
  onDropNewImage
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLParticleRenderer | Canvas2DRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fps, setFps] = useState(60);
  const [phaseText, setPhaseText] = useState('TRANSFORMING');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Animation playback state
  const animStateRef = useRef({
    progress: 0.0,
    isPlaying: true,
    startTime: 0,
    hasTriggeredConvergenceAudio: false,
    hasTriggeredDisintegrateAudio: false
  });

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    let renderer: WebGLParticleRenderer | Canvas2DRenderer;
    try {
      const glRenderer = new WebGLParticleRenderer(canvas);
      if (glRenderer.isSupported()) {
        renderer = glRenderer;
      } else {
        renderer = new Canvas2DRenderer(canvas);
      }
    } catch {
      renderer = new Canvas2DRenderer(canvas);
    }

    renderer.uploadParticles(matchedData);
    rendererRef.current = renderer;

    // Reset and automatically start seamless animation immediately
    animStateRef.current = {
      progress: 0.0,
      isPlaying: true,
      startTime: performance.now(),
      hasTriggeredConvergenceAudio: false,
      hasTriggeredDisintegrateAudio: false
    };

    audioEngine.playDisintegrate();
    animStateRef.current.hasTriggeredDisintegrateAudio = true;

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [matchedData]);

  // Main 60-144 FPS seamless animation loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      frameCount++;
      if (now - lastFpsUpdate >= 500) {
        const currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        setFps(Math.min(144, currentFps));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      const state = animStateRef.current;
      const duration = Math.max(0.5, settings.duration);

      if (state.isPlaying) {
        let newProgress = state.progress + dt / duration;

        if (newProgress >= 1.0) {
          newProgress = 1.0;
          state.isPlaying = false; // Settled seamlessly into Cappibara
        }

        state.progress = newProgress;

        if (newProgress > 0.08 && !state.hasTriggeredDisintegrateAudio) {
          audioEngine.playDisintegrate();
          state.hasTriggeredDisintegrateAudio = true;
        }

        audioEngine.updateFlowProgress(newProgress);

        if (newProgress >= 0.90 && !state.hasTriggeredConvergenceAudio) {
          audioEngine.playConvergence();
          state.hasTriggeredConvergenceAudio = true;
        }
      }

      // Update minimal phase description
      const p = state.progress;
      if (p < 0.25) {
        setPhaseText('DISINTEGRATING');
      } else if (p < 0.75) {
        setPhaseText('FLUID METAMORPHOSIS');
      } else if (p < 0.98) {
        setPhaseText('REORGANIZING');
      } else {
        setPhaseText('CAPPIBARA');
      }

      if (rendererRef.current) {
        rendererRef.current.render(state.progress, now * 0.001, settings);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [settings]);

  // Window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse interaction
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    if (rendererRef.current) {
      rendererRef.current.setMouse(x, y, true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.setMouse(-999, -999, false);
    }
  }, []);

  // Touch interaction
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();

    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);

    if (rendererRef.current) {
      rendererRef.current.setMouse(x, y, true);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.setMouse(-999, -999, false);
    }
  }, []);

  // Drag & drop new image directly on the canvas at any time
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        onDropNewImage(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDropNewImage(e.target.files[0]);
    }
  };

  return (
    <div
      className="seamless-canvas-view"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />

      {/* Fullscreen Canvas Centerpiece */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="fullscreen-particle-canvas"
        style={{ touchAction: 'none' }}
      />

      {/* Drag Over Hint */}
      {isDraggingOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            border: '2px dashed #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            color: '#ffffff',
            letterSpacing: '0.1em',
            zIndex: 60
          }}
        >
          DROP TO TRANSFORM INTO CAPPIBARA
        </div>
      )}

      {/* Monochromatic Subtle HUD (No Buttons) */}
      <div className="minimal-canvas-hud">
        <div className="minimal-hud-dot" />
        <span>{phaseText}</span>
        <span>•</span>
        <span>{matchedData.count.toLocaleString()} PARTICLES</span>
        <span>•</span>
        <span>{fps} FPS</span>
      </div>

      {/* Subtle Overlay Hint to Upload Another Image */}
      <div
        className="minimal-drop-overlay-hint"
        onClick={() => fileInputRef.current?.click()}
        title="Click or drag another image to transform"
      >
        DROP NEW IMAGE OR CLICK TO CHANGE ↗
      </div>
    </div>
  );
};
