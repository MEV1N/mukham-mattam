import React, { useState, useRef } from 'react';
import { Sliders, Play, Upload, ArrowLeftRight, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { PRESET_IMAGES } from '../presets/sampleImages';
import type { ShiftSettings } from '../types';

interface ImageSetupProps {
  sourceImageUri: string;
  sourceName: string;
  targetImageUri: string | null;
  targetName: string;
  onSelectTargetUri: (uri: string, name: string) => void;
  onSwapImages: () => void;
  onTransform: () => void;
  onChangeSource: () => void;
  settings: ShiftSettings;
  onUpdateSettings: (newSettings: Partial<ShiftSettings>) => void;
  isProcessing: boolean;
  loadingMessage: string;
}

export const ImageSetup: React.FC<ImageSetupProps> = ({
  sourceImageUri,
  sourceName,
  targetImageUri,
  targetName,
  onSelectTargetUri,
  onSwapImages,
  onTransform,
  onChangeSource,
  settings,
  onUpdateSettings,
  isProcessing,
  loadingMessage
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const targetUploadRef = useRef<HTMLInputElement>(null);

  const handleCustomTargetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSelectTargetUri(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="setup-container">
      {/* Step Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span className="badge-tag">STEP 2 OF 2</span>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
          Select Target & Fine-Tune Dynamics
        </span>
      </div>

      <h2 className="setup-title">
        Choose Your <span className="gradient-text">Target Form</span>
      </h2>

      {/* Side-by-Side Visual Deck */}
      <div className="side-by-side-deck">
        {/* Source Card */}
        <div className="preview-box">
          <div className="preview-box-header">
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#00f0ff', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00f0ff', display: 'inline-block' }} />
              Source Image
            </span>
            <button
              onClick={onChangeSource}
              style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Change
            </button>
          </div>

          <div className="preview-image-frame">
            <img src={sourceImageUri} alt="Source" />
          </div>

          <p className="preview-label">{sourceName}</p>
        </div>

        {/* Swap Button */}
        <div className="swap-btn-container">
          <button
            onClick={onSwapImages}
            disabled={!targetImageUri}
            className="btn-swap"
            title="Swap Source and Target"
          >
            <ArrowLeftRight style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Target Card */}
        <div className="preview-box">
          <div className="preview-box-header">
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#8b5cf6', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
              Target: Cappibara
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check style={{ width: 14, height: 14 }} /> Ready
            </span>
          </div>

          <div className="preview-image-frame">
            <img src={targetImageUri || '/cappibara.jpeg'} alt="Target Cappibara" />
          </div>

          <p className="preview-label">{targetName || 'Cappibara'}</p>
        </div>
      </div>

      {/* Target Image Selector Gallery */}
      <div className="target-gallery-wrap">
        <div className="target-gallery-header">
          <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em' }}>
            Select Destination Form:
          </label>
          <button
            onClick={() => targetUploadRef.current?.click()}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '5px 12px', borderColor: 'rgba(0,240,255,0.3)' }}
          >
            <Upload style={{ width: 14, height: 14, color: '#00f0ff' }} />
            Upload Custom Target
          </button>
          <input
            ref={targetUploadRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleCustomTargetUpload}
          />
        </div>

        <div className="target-presets-grid">
          {PRESET_IMAGES.map((preset) => {
            const isSelected = targetImageUri === preset.dataUri;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectTargetUri(preset.dataUri, preset.name)}
                className={`target-preset-item ${isSelected ? 'selected' : ''}`}
              >
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="target-item-thumb"
                />
                <span className="target-item-name">{preset.name}</span>
                <span className="target-item-cat">{preset.category}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Transform Button */}
      <div className="transform-action-wrapper">
        <button
          onClick={onTransform}
          disabled={!targetImageUri || isProcessing}
          className="btn-primary"
          style={{ padding: '16px 44px', fontSize: '1.1rem' }}
        >
          {isProcessing ? (
            <>
              <div style={{ width: 20, height: 20, border: '2px solid #040507', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span>{loadingMessage || 'Processing Pixel Matrix...'}</span>
            </>
          ) : (
            <>
              <Play style={{ width: 18, height: 18, fill: 'currentColor' }} />
              <span>Transform Pixels</span>
              <Sparkles style={{ width: 16, height: 16, opacity: 0.8 }} />
            </>
          )}
        </button>

        <p style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
          Interactive physics & audio activate upon transform
        </p>
      </div>

      {/* Fine-Tune Simulation Accordion */}
      <div className="advanced-settings-wrapper">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="accordion-trigger"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders style={{ width: 14, height: 14, color: '#00f0ff' }} />
            Fine-Tune Simulation Parameters
          </span>
          {showAdvanced ? (
            <ChevronUp style={{ width: 16, height: 16 }} />
          ) : (
            <ChevronDown style={{ width: 16, height: 16 }} />
          )}
        </button>

        {showAdvanced && (
          <div className="accordion-body">
            {/* Duration */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>Duration:</span>
                <span style={{ color: '#00f0ff' }}>{settings.duration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.5"
                value={settings.duration}
                onChange={(e) => onUpdateSettings({ duration: parseFloat(e.target.value) })}
              />
            </div>

            {/* Density */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>Particle Density:</span>
                <span style={{ color: '#00f0ff', textTransform: 'uppercase' }}>{settings.density}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {(['low', 'medium', 'high', 'ultra'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => onUpdateSettings({ density: tier })}
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '4px 0',
                      borderRadius: 6,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: settings.density === tier ? '#00f0ff' : 'rgba(255,255,255,0.04)',
                      color: settings.density === tier ? '#040507' : '#94a3b8',
                      borderColor: settings.density === tier ? '#00f0ff' : 'rgba(255,255,255,0.08)',
                      fontWeight: settings.density === tier ? 'bold' : 'normal'
                    }}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Particle Size */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>Particle Size:</span>
                <span style={{ color: '#00f0ff' }}>{settings.particleSize.toFixed(1)}px</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.5"
                step="0.5"
                value={settings.particleSize}
                onChange={(e) => onUpdateSettings({ particleSize: parseFloat(e.target.value) })}
              />
            </div>

            {/* Turbulence */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>Turbulence / Chaos:</span>
                <span style={{ color: '#00f0ff' }}>{Math.round(settings.randomness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.randomness}
                onChange={(e) => onUpdateSettings({ randomness: parseFloat(e.target.value) })}
              />
            </div>

            {/* Easing */}
            <div>
              <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Trajectory Easing:
              </label>
              <select
                value={settings.easing}
                onChange={(e) => onUpdateSettings({ easing: e.target.value as any })}
              >
                <option value="cinematic">Cinematic Arc (Smooth Quintic)</option>
                <option value="explosive">Explosive Burst & Settling</option>
                <option value="gravitational">Gravitational Harmonic Wave</option>
                <option value="quantum">Quantum Spiral Drift</option>
              </select>
            </div>

            {/* Mapping */}
            <div>
              <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Coherent Pixel Mapping:
              </label>
              <select
                value={settings.mapping}
                onChange={(e) => onUpdateSettings({ mapping: e.target.value as any })}
              >
                <option value="harmonic">Harmonic (Spatial Quadrants + Luminance)</option>
                <option value="spatial">Spatial Flow (Morton Z-Wavefront)</option>
                <option value="luminance">Luminance Affinity (Light to Light)</option>
                <option value="dispersion">Quantum Dispersion (Stochastic Flow)</option>
              </select>
            </div>

            {/* Color Mode */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Color Dynamics:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {[
                  { id: 'source', label: 'Retain Source Colors', desc: 'Exact original pixel palette' },
                  { id: 'morph', label: 'Morph to Target', desc: 'Colors dissolve into target RGB' },
                  { id: 'chroma', label: 'Chroma Velocity Glow', desc: 'Luminous spectral flare in-flight' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => onUpdateSettings({ colorMode: mode.id as any })}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: '1px solid',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: settings.colorMode === mode.id ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.03)',
                      borderColor: settings.colorMode === mode.id ? '#00f0ff' : 'rgba(255,255,255,0.08)'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff', display: 'block' }}>
                      {mode.label}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: 2 }}>
                      {mode.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
