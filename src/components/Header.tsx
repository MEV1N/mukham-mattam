import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from '../engine/audioEngine';

interface HeaderProps {
  onReset: () => void;
  isTransforming: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  const [isMuted, setIsMuted] = React.useState(false);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
  };

  return (
    <header className="minimal-nav">
      <div 
        onClick={onReset}
        className="minimal-brand"
        title="Mukham Mattam"
      >
        Mukham Mattam
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, pointerEvents: 'auto' }}>
        <span className="minimal-tag">Target: Cappibara</span>

        <button
          onClick={toggleMute}
          style={{
            background: 'none',
            border: 'none',
            color: isMuted ? '#666' : '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          title={isMuted ? 'Unmute sound' : 'Mute sound'}
          aria-label="Toggle sound"
        >
          {isMuted ? (
            <VolumeX style={{ width: 16, height: 16 }} />
          ) : (
            <Volume2 style={{ width: 16, height: 16 }} />
          )}
        </button>
      </div>
    </header>
  );
};
