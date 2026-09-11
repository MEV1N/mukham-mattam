import React from 'react';
import { X, Sparkles, Cpu, Waves, MousePointer, ShieldCheck } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn-icon modal-close-btn"
          title="Close modal"
        >
          <X style={{ width: 16, height: 16, color: '#fff' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div className="brand-icon-box">
            <div className="brand-icon-inner">
              <Sparkles style={{ width: 18, height: 18, color: '#00f0ff' }} />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
              About Pixel Shift
            </h3>
            <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>
              Rearrange Reality • Interactive Particle Installation
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '60vh', overflowY: 'auto', paddingRight: 6 }}>
          <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Cpu style={{ width: 16, height: 16, color: '#00f0ff' }} /> Zero-Overhead GPU Pipeline
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Pixel Shift deconstructs digital images into up to 140,000 independent particles. All trajectory math, curl noise fields, and easing functions execute in parallel on the GPU via custom WebGL vertex shaders at a steady 60–120 FPS.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Waves style={{ width: 16, height: 16, color: '#8b5cf6' }} /> Harmonic Coherent Mapping
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Rather than random index matching, our algorithm pairs pixels based on spatial quadtree proximity and luminance similarity. Luminous source pixels intuitively reconstruct highlights in the target image.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <MousePointer style={{ width: 16, height: 16, color: '#ec4899' }} /> Fluid Cursor Disturbance
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Hover your mouse or drag your finger across the canvas during any phase of transformation. The particle field responds with real-time gravitational deflection and vortex swirl without breaking destination convergence.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <ShieldCheck style={{ width: 16, height: 16, color: '#10b981' }} /> 100% Private Client-Side
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
              All image sampling, pixel mapping, and rendering occur entirely in your browser memory. No images or data are ever transmitted to any external server.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '8px 22px' }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
