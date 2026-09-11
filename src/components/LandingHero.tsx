import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface LandingHeroProps {
  onSelectImage: (fileOrUrl: File | string, name?: string) => void;
  onSelectSample: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSelectImage,
  onSelectSample
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        onSelectImage(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onSelectImage(file);
    }
  };

  return (
    <div className="landing-view">
      <div className="landing-content">
        <h1 className="minimal-title">
          Mukham Mattam.
        </h1>

        <p className="minimal-subtitle">
          Upload any image. Watch every pixel find its way to Cappibara.
        </p>

        {/* Minimal Black and White Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`minimal-dropzone ${isDragging ? 'dragging' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />

          <div className="minimal-icon-box">
            <Upload style={{ width: 22, height: 22 }} />
          </div>

          <h3 className="minimal-drop-text">Drop any image</h3>
          <p className="minimal-drop-sub">
            JPG, PNG, WEBP — Instant transformation
          </p>
        </div>

        {/* Quick Sample Trigger */}
        <div className="demo-trigger-row">
          <span>No image ready?</span>
          <button
            onClick={onSelectSample}
            className="demo-trigger-btn"
          >
            Test with sample image →
          </button>
        </div>
      </div>
    </div>
  );
};
