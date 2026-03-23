'use client';

import { useCallback, useEffect, useRef } from 'react';
import SlideRenderer from '@/components/slides/SlideRenderer';
import type { SlideData, Theme, StyleVariant } from '@/types/carousel';

interface SlidePreviewProps {
  slides: SlideData[];
  selectedIndex: number;
  totalSlides: number;
  theme: Theme;
  style: StyleVariant;
  dimensions: { width: number; height: number };
  showLogo: boolean;
  fontScale: number;
  contentPadding: number;
  contentGap: number;
  accentBarWidth: number;
  contentAlign: 'left' | 'center';
  verticalAlign: 'top' | 'center' | 'bottom';
  bodyLineHeight: number;
  bodyMaxWidth: number;
  headlineScale: number;
  onNavigate: (index: number) => void;
  onExportSingle: (index: number) => void;
  onCopySlide: (index: number) => void;
  exporting: boolean;
  slideRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export default function SlidePreview({
  slides,
  selectedIndex,
  totalSlides,
  theme,
  style,
  dimensions,
  showLogo,
  fontScale,
  contentPadding,
  contentGap,
  accentBarWidth,
  contentAlign,
  verticalAlign,
  bodyLineHeight,
  bodyMaxWidth,
  headlineScale,
  onNavigate,
  onExportSingle,
  onCopySlide,
  exporting,
  slideRefs,
}: SlidePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[selectedIndex];

  // Calculate scale to fit preview in container
  const previewScale = Math.min(
    480 / dimensions.width,
    600 / dimensions.height,
    0.5,
  );

  // Arrow key navigation when preview is focused
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && selectedIndex > 0) {
        e.preventDefault();
        onNavigate(selectedIndex - 1);
      } else if (e.key === 'ArrowRight' && selectedIndex < totalSlides - 1) {
        e.preventDefault();
        onNavigate(selectedIndex + 1);
      }
    },
    [selectedIndex, totalSlides, onNavigate],
  );

  const btnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#F5F5F5',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease-out',
    minHeight: 44,
  };

  if (!currentSlide) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: 14,
        }}
      >
        <p style={{ marginBottom: 8 }}>Your slides will appear here</p>
        <p style={{ fontSize: 12 }}>Paste a carousel script in the left panel</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none',
        padding: 24,
      }}
    >
      {/* Visible preview */}
      <div
        style={{
          width: dimensions.width * previewScale,
          height: dimensions.height * previewScale,
          overflow: 'hidden',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
          <SlideRenderer
            slide={currentSlide}
            slideIndex={selectedIndex}
            totalSlides={totalSlides}
            theme={theme}
            style={style}
            dimensions={dimensions}
            showLogo={showLogo}
            fontScale={fontScale}
            contentPadding={contentPadding}
            contentGap={contentGap}
            accentBarWidth={accentBarWidth}
            contentAlign={contentAlign}
            verticalAlign={verticalAlign}
            bodyLineHeight={bodyLineHeight}
            bodyMaxWidth={bodyMaxWidth}
            headlineScale={headlineScale}
          />
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <button
          onClick={() => onNavigate(Math.max(0, selectedIndex - 1))}
          disabled={selectedIndex === 0}
          aria-label="Previous slide"
          style={{ ...btnStyle, padding: '6px 12px', fontSize: 14, opacity: selectedIndex === 0 ? 0.3 : 1 }}
        >
          ◀
        </button>
        <span style={{ color: '#9CA3AF', fontSize: 13, fontVariantNumeric: 'tabular-nums', minWidth: 50, textAlign: 'center' }}>
          {selectedIndex + 1} / {totalSlides}
        </span>
        <button
          onClick={() => onNavigate(Math.min(totalSlides - 1, selectedIndex + 1))}
          disabled={selectedIndex >= totalSlides - 1}
          aria-label="Next slide"
          style={{ ...btnStyle, padding: '6px 12px', fontSize: 14, opacity: selectedIndex >= totalSlides - 1 ? 0.3 : 1 }}
        >
          ▶
        </button>
        <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        <button
          onClick={() => onCopySlide(selectedIndex)}
          disabled={exporting}
          style={{ ...btnStyle, padding: '5px 10px', fontSize: 11 }}
        >
          Copy
        </button>
        <button
          onClick={() => onExportSingle(selectedIndex)}
          disabled={exporting}
          style={{ ...btnStyle, padding: '5px 10px', fontSize: 11 }}
        >
          PNG
        </button>
      </div>

      {/* Hidden full-size slides for export */}
      <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        {slides.map((slide, i) => (
          <div key={`export-${i}`} ref={(el) => { slideRefs.current[i] = el; }}>
            <SlideRenderer
              slide={slide}
              slideIndex={i}
              totalSlides={totalSlides}
              theme={theme}
              style={style}
              dimensions={dimensions}
              showLogo={showLogo}
              fontScale={fontScale}
              contentPadding={contentPadding}
              contentGap={contentGap}
              accentBarWidth={accentBarWidth}
              contentAlign={contentAlign}
              verticalAlign={verticalAlign}
              bodyLineHeight={bodyLineHeight}
              bodyMaxWidth={bodyMaxWidth}
              headlineScale={headlineScale}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
