import React from 'react';

interface HeaderProps {
  onReset: () => void;
  isTransforming: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
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
        <span className="minimal-tag">Target: Nandhy</span>
      </div>
    </header>
  );
};
