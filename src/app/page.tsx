'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import SlideRenderer from '@/components/slides/SlideRenderer';
import ContentInput from '@/components/ContentInput';
import { parseCarousel } from '@/lib/parser';
import { THEMES } from '@/lib/themes';
import { STYLES } from '@/lib/styles';
import {
  exportSlide,
  exportAllAsZip,
  exportAsPdf,
  copySlideToClipboard,
} from '@/lib/export';
import type { SlideData, Theme, StyleVariant, CarouselData } from '@/types/carousel';

// Sample carousel content — pre-loaded on first visit
const SAMPLE_CONTENT = `TITLE: How to build an app in a weekend using Claude
PILLAR: Build
TYPE: 80% value

---

SLIDE 1 [hook]
HEADLINE: You don't need to learn to code to build an app.
SUB: Here's how to ship a product this weekend.
CTA: SWIPE →

---

SLIDE 2 [split]
HEADLINE: The old way vs. the new way
LEFT:
OLD WAY

Learn Python — 6 months
Learn a framework — 3 months
Build — 3 months
Ship — 1 year later
RIGHT:
NEW WAY

Open Claude
Describe what you want
Copy the code
Ship — this weekend

---

SLIDE 3 [step]
NUM: 01
HEADLINE: Define the problem
BODY: Don't start with "I want to build an app."

Start with: "What's a problem I see every day?"

---

SLIDE 4 [step]
NUM: 02
HEADLINE: Write the prompt
BODY: Tell Claude exactly what you want. Be specific.

"Build me a web app where users enter their city, cuisine preference, and budget."

---

SLIDE 5 [step]
NUM: 03
HEADLINE: Deploy it
BODY: Use Vercel, Netlify, or Replit to put it live in 5 minutes.

Your app now has a real URL.
You just shipped a product.

---

SLIDE 6 [result]
HEADLINE: What you now have
BODY: ✦ A live product
✦ Real user feedback
✦ A story for your college apps

All in one weekend.

---

SLIDE 7 [quote]
HEADLINE: The best way to predict the future is to build it.
SUB: Alan Kay

---

SLIDE 8 [close]
HEADLINE: Save this. Try it this weekend.
SUB: Follow @mlvignite for more.
LOGO: true

---

CAPTION:
Most students think they need to spend 6 months learning to code before they can build anything.

Claude is the printing press. Your ideas are the book.

#MLV #BuildDontPrepare #StudentFounder`;

const theme: Theme = THEMES[0];
const style: StyleVariant = STYLES[0];
const dims = { width: 1080, height: 1350 };
const previewScale = 0.45;

export default function Home() {
  const [rawText, setRawText] = useState(SAMPLE_CONTENT);
  const [carousel, setCarousel] = useState<CarouselData>(() => parseCarousel(SAMPLE_CONTENT));
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slides = carousel.slides;
  const totalSlides = slides.length;

  // Debounced auto-parse on text change (300ms)
  const handleTextChange = useCallback((text: string) => {
    setRawText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const parsed = parseCarousel(text);
      setCarousel(parsed);
      setSelectedSlideIndex((prev) => Math.min(prev, Math.max(0, parsed.slides.length - 1)));
    }, 300);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSlidesReorder = useCallback((fromIndex: number, toIndex: number) => {
    setCarousel((prev) => {
      const newSlides = [...prev.slides];
      const [moved] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, moved);
      return { ...prev, slides: newSlides };
    });
  }, []);

  // Trim stale refs when slide count changes
  const getSlideNodes = useCallback(() => {
    return slideRefs.current.slice(0, slides.length).filter(Boolean) as HTMLDivElement[];
  }, [slides.length]);

  // Status timeout management — clear previous timeout before setting new one
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showStatus = useCallback((msg: string, duration = 3000) => {
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    setExportStatus(msg);
    statusTimeoutRef.current = setTimeout(() => setExportStatus(''), duration);
  }, []);

  const handleExportZip = async () => {
    setExporting(true);
    try {
      showStatus('Exporting...');
      const nodes = getSlideNodes();
      const result = await exportAllAsZip(nodes, carousel.title || 'carousel', theme.id, (cur, tot) => {
        showStatus(`Exporting ${cur}/${tot}...`);
      });
      showStatus(result.success
        ? (result.failedSlides.length > 0 ? `Downloaded! (${result.failedSlides.length} failed)` : 'Downloaded!')
        : `Failed: ${result.error}`
      );
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      showStatus('Generating PDF...');
      const nodes = getSlideNodes();
      const result = await exportAsPdf(nodes, carousel.title || 'carousel', theme.id, dims, (cur, tot) => {
        showStatus(`Rendering ${cur}/${tot}...`);
      });
      showStatus(result.success ? 'PDF downloaded!' : `Failed: ${result.error}`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportSingle = async (index: number) => {
    const node = slideRefs.current[index];
    if (!node) return;
    setExporting(true);
    try {
      const result = await exportSlide(node, `slide-${String(index + 1).padStart(2, '0')}.png`);
      showStatus(result.success ? 'Slide downloaded!' : `Failed: ${result.error}`);
    } finally {
      setExporting(false);
    }
  };

  const handleCopySlide = async (index: number) => {
    const node = slideRefs.current[index];
    if (!node) return;
    setExporting(true);
    try {
      const result = await copySlideToClipboard(node, `slide-${String(index + 1).padStart(2, '0')}.png`);
      showStatus(result.success ? (result.error === 'clipboard-fallback' ? 'Saved as file' : 'Copied!') : `Failed: ${result.error}`);
    } finally {
      setExporting(false);
    }
  };

  const currentSlide = slides[selectedSlideIndex];

  const btnStyle: React.CSSProperties = {
    padding: '10px 20px', backgroundColor: '#6AC670', color: '#0A0A0A',
    border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  };
  const btnGhostStyle: React.CSSProperties = {
    ...btnStyle, backgroundColor: 'transparent', color: '#F5F5F5',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  return (
    <main style={{ backgroundColor: '#08080C', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700, margin: 0 }}>
            MLV Carousel Generator
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: 11, margin: 0 }}>
            {carousel.title || 'Untitled'} · {totalSlides} slides · {theme.name} · {style.name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={btnStyle} onClick={handleExportZip} disabled={exporting || totalSlides === 0}>
            Download ZIP
          </button>
          <button style={btnGhostStyle} onClick={handleExportPdf} disabled={exporting || totalSlides === 0}>
            PDF
          </button>
          {exportStatus && (
            <span style={{ color: '#6AC670', fontSize: 12, fontWeight: 500 }}>{exportStatus}</span>
          )}
        </div>
      </div>

      {/* 3-panel layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel: input */}
        <div style={{ width: '25%', minWidth: 240, padding: 16, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto' }}>
          <ContentInput
            rawText={rawText}
            slides={slides}
            selectedSlideIndex={selectedSlideIndex}
            onTextChange={handleTextChange}
            onSlideSelect={setSelectedSlideIndex}
            onSlidesReorder={handleSlidesReorder}
          />
        </div>

        {/* Center panel: preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#08080C' }}>
          {currentSlide ? (
            <>
              <div
                style={{
                  width: dims.width * previewScale,
                  height: dims.height * previewScale,
                  overflow: 'hidden',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                }}
              >
                <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
                  <SlideRenderer
                    slide={currentSlide}
                    slideIndex={selectedSlideIndex}
                    totalSlides={totalSlides}
                    theme={theme}
                    style={style}
                    dimensions={dims}
                    showLogo={false}
                    fontScale={1}
                  />
                </div>
              </div>
              {/* Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                <button
                  onClick={() => setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1))}
                  disabled={selectedSlideIndex === 0}
                  style={{ ...btnGhostStyle, padding: '6px 12px', fontSize: 14, opacity: selectedSlideIndex === 0 ? 0.3 : 1 }}
                >
                  ◀
                </button>
                <span style={{ color: '#9CA3AF', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                  {selectedSlideIndex + 1} / {totalSlides}
                </span>
                <button
                  onClick={() => setSelectedSlideIndex(Math.min(totalSlides - 1, selectedSlideIndex + 1))}
                  disabled={selectedSlideIndex >= totalSlides - 1}
                  style={{ ...btnGhostStyle, padding: '6px 12px', fontSize: 14, opacity: selectedSlideIndex >= totalSlides - 1 ? 0.3 : 1 }}
                >
                  ▶
                </button>
                <button
                  onClick={() => handleCopySlide(selectedSlideIndex)}
                  disabled={exporting}
                  style={{ ...btnGhostStyle, padding: '6px 12px', fontSize: 11 }}
                >
                  Copy
                </button>
                <button
                  onClick={() => handleExportSingle(selectedSlideIndex)}
                  disabled={exporting}
                  style={{ ...btnGhostStyle, padding: '6px 12px', fontSize: 11 }}
                >
                  PNG
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
              <p style={{ marginBottom: 8 }}>Your slides will appear here</p>
              <p style={{ fontSize: 12 }}>Paste a carousel script in the left panel</p>
            </div>
          )}
        </div>

        {/* Right panel: settings (placeholder) */}
        <div style={{ width: '20%', minWidth: 200, padding: 16, borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: 12 }}>
            Settings
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Platform</div>
          <div style={{ fontSize: 12, color: '#F5F5F5', marginBottom: 16 }}>Instagram Portrait (1080 × 1350)</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Theme</div>
          <div style={{ fontSize: 12, color: '#F5F5F5', marginBottom: 16 }}>{theme.name}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Style</div>
          <div style={{ fontSize: 12, color: '#F5F5F5', marginBottom: 16 }}>{style.name}</div>
        </div>
      </div>

      {/* Caption bar */}
      {carousel.caption && (
        <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, fontSize: 12, color: '#9CA3AF', whiteSpace: 'pre-line', maxHeight: 80, overflowY: 'auto' }}>
            {carousel.caption}
          </div>
          <button
            style={{ ...btnGhostStyle, padding: '4px 12px', fontSize: 11, flexShrink: 0 }}
            onClick={() => { navigator.clipboard.writeText(carousel.caption || '').then(() => showStatus('Caption copied!')).catch(() => showStatus('Copy failed')); }}
          >
            Copy Caption
          </button>
        </div>
      )}

      {/* Hidden full-size slides for export */}
      <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        {slides.map((slide, i) => (
          <div key={`export-${i}`} ref={(el) => { slideRefs.current[i] = el; }}>
            <SlideRenderer slide={slide} slideIndex={i} totalSlides={totalSlides} theme={theme} style={style} dimensions={dims} showLogo={false} fontScale={1} />
          </div>
        ))}
      </div>
    </main>
  );
}
