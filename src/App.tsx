import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { CanvasViewport } from './components/CanvasViewport';
import { detectDeviceCapabilities, getParticleCountForTier } from './engine/deviceDetector';
import { loadImage, sampleImagePixels } from './engine/pixelSampler';
import { matchPixels } from './engine/pixelMatcher';
import { NANDHY_IMAGE, PRESET_IMAGES } from './presets/sampleImages';
import type { MatchedParticles } from './engine/pixelMatcher';
import type { SampledImageData, ShiftSettings } from './types';

export function App() {
  const [screen, setScreen] = useState<'landing' | 'transforming'>('landing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchedData, setMatchedData] = useState<MatchedParticles | null>(null);

  // Preloaded Nandhy sampled data
  const nandhyDataRef = useRef<SampledImageData | null>(null);

  const [settings] = useState<ShiftSettings>({
    duration: 6.8,
    density: 'high',
    particleSize: 1.25,
    randomness: 0.08,
    easing: 'cinematic',
    mapping: 'harmonic',
    colorMode: 'morph',
    audioEnabled: false
  });

  // Preload Nandhy on app launch
  useEffect(() => {
    const profile = detectDeviceCapabilities();
    const count = getParticleCountForTier(profile.tier);

    loadImage(NANDHY_IMAGE.dataUri)
      .then((img) => {
        nandhyDataRef.current = sampleImagePixels(img, count);
      })
      .catch((err) => {
        console.error('Failed to preload Nandhy:', err);
      });
  }, []);

  // Instant seamless transformation pipeline
  const processImageToNandhy = useCallback(
    async (fileOrUrl: File | string) => {
      setIsProcessing(true);

      try {
        let sourceImg: HTMLImageElement;
        if (typeof fileOrUrl === 'string') {
          sourceImg = await loadImage(fileOrUrl);
        } else {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fileOrUrl);
          });
          sourceImg = await loadImage(dataUrl);
        }

        const profile = detectDeviceCapabilities();
        const count = getParticleCountForTier(profile.tier);

        // Ensure target Nandhy data is ready
        let targetData = nandhyDataRef.current;
        if (!targetData) {
          const capImg = await loadImage(NANDHY_IMAGE.dataUri);
          targetData = sampleImagePixels(capImg, count);
          nandhyDataRef.current = targetData;
        }

        // Sample source image
        const sourceData = sampleImagePixels(sourceImg, count);

        // Match pixels directly to Nandhy
        const matched = matchPixels(sourceData, targetData, 'harmonic');

        setMatchedData(matched);
        setIsProcessing(false);
        setScreen('transforming'); // Instantly starts canvas animation!
      } catch (err) {
        console.error('Error shifting to Nandhy:', err);
        setIsProcessing(false);
      }
    },
    []
  );

  // Quick test with sample source image
  const handleSelectSample = () => {
    // Pick the cyber skull or mandala as sample source to turn into Nandhy
    const sampleSrc = PRESET_IMAGES[1] ? PRESET_IMAGES[1].dataUri : NANDHY_IMAGE.dataUri;
    processImageToNandhy(sampleSrc);
  };

  const handleReset = () => {
    setScreen('landing');
    setMatchedData(null);
  };

  return (
    <div className="app-container">
      {/* Minimal Header */}
      <Header
        onReset={handleReset}
        isTransforming={screen === 'transforming'}
      />

      {/* Main Content */}
      <main style={{ width: '100%', height: '100%', position: 'relative' }}>
        {screen === 'landing' && (
          <LandingHero
            onSelectImage={processImageToNandhy}
            onSelectSample={handleSelectSample}
          />
        )}

        {screen === 'transforming' && matchedData && (
          <CanvasViewport
            matchedData={matchedData}
            settings={settings}
            onDropNewImage={processImageToNandhy}
          />
        )}

        {/* Seamless Loading Sweep (Brief micro-moment) */}
        {isProcessing && (
          <div className="seamless-loader">
            <span>DECONSTRUCTING PARTICLES → TARGET: NANDHY</span>
            <div className="loader-bar">
              <div className="loader-bar-fill" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
