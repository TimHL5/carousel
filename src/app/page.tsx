'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import ContentInput from '@/components/ContentInput';
import SlidePreview from '@/components/SlidePreview';
import Settings from '@/components/Settings';
import CaptionArea from '@/components/CaptionArea';
import Toast from '@/components/Toast';
import { parseCarousel } from '@/lib/parser';
import { THEMES, DEFAULT_THEME_ID, getThemeById } from '@/lib/themes';
import { STYLES, DEFAULT_STYLE_ID, getStyleById } from '@/lib/styles';
import { PRESETS, DEFAULT_PRESET_ID, getPresetById } from '@/lib/dimensions';
import {
  exportSlide,
  exportAllAsZip,
  exportAsPdf,
  copySlideToClipboard,
} from '@/lib/export';
import { useUndoReducer } from '@/lib/useUndoReducer';
import type { CarouselState, Theme } from '@/types/carousel';

// ── Sample content pre-loaded on first visit ──────────────────
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

// ── State reducer ──────────────────────────────────────────────

type Action =
  | { type: 'SET_RAW_TEXT'; text: string }
  | { type: 'PARSE' }
  | { type: 'SELECT_SLIDE'; index: number }
  | { type: 'REORDER_SLIDES'; from: number; to: number }
  | { type: 'SET_THEME'; id: string }
  | { type: 'SET_STYLE'; id: string }
  | { type: 'SET_PRESET'; id: string }
  | { type: 'SET_FONT_SCALE'; scale: number }
  | { type: 'TOGGLE_LOGO' }
  | { type: 'SET_CAPTION'; caption: string }
  | { type: 'SAVE_CUSTOM_THEME'; theme: Theme }
  | { type: 'DELETE_CUSTOM_THEME'; id: string }
  | { type: 'SET_CONTENT_PADDING'; value: number }
  | { type: 'SET_CONTENT_GAP'; value: number }
  | { type: 'SET_ACCENT_BAR_WIDTH'; value: number }
  | { type: 'SET_CONTENT_ALIGN'; value: 'left' | 'center' }
  | { type: 'SET_VERTICAL_ALIGN'; value: 'top' | 'center' | 'bottom' }
  | { type: 'SET_BODY_LINE_HEIGHT'; value: number }
  | { type: 'SET_BODY_MAX_WIDTH'; value: number }
  | { type: 'SET_HEADLINE_SCALE'; value: number }
  | { type: 'RESET_LAYOUT' };

function carouselReducer(state: CarouselState, action: Action): CarouselState {
  switch (action.type) {
    case 'SET_RAW_TEXT':
      return { ...state, rawText: action.text };
    case 'PARSE': {
      const parsed = parseCarousel(state.rawText);
      // Only overwrite caption from parser if caption field was NOT manually edited
      // (i.e., only set it on initial parse or when raw text caption actually changes)
      const parsedCaption = parsed.caption || '';
      const captionFromLastParse = state.carousel?.caption || '';
      const userEditedCaption = state.caption !== captionFromLastParse;
      return {
        ...state,
        carousel: parsed,
        caption: userEditedCaption ? state.caption : (parsedCaption || state.caption),
        selectedSlideIndex: Math.min(state.selectedSlideIndex, Math.max(0, parsed.slides.length - 1)),
      };
    }
    case 'SELECT_SLIDE': {
      const maxIdx = (state.carousel?.slides.length || 1) - 1;
      return { ...state, selectedSlideIndex: Math.max(0, Math.min(action.index, maxIdx)) };
    }
    case 'REORDER_SLIDES': {
      if (!state.carousel) return state;
      const slides = state.carousel.slides;
      if (action.from < 0 || action.from >= slides.length || action.to < 0 || action.to >= slides.length) return state;
      const newSlides = [...slides];
      const [moved] = newSlides.splice(action.from, 1);
      newSlides.splice(action.to, 0, moved);
      return { ...state, carousel: { ...state.carousel, slides: newSlides } };
    }
    case 'SET_THEME':
      return { ...state, selectedThemeId: action.id };
    case 'SET_STYLE':
      return { ...state, selectedStyleId: action.id };
    case 'SET_PRESET':
      return { ...state, selectedPresetId: action.id };
    case 'SET_FONT_SCALE':
      return { ...state, fontScale: action.scale };
    case 'TOGGLE_LOGO':
      return { ...state, showLogo: !state.showLogo };
    case 'SET_CAPTION':
      return { ...state, caption: action.caption };
    case 'SAVE_CUSTOM_THEME': {
      const existing = state.customThemes.filter((t) => t.id !== action.theme.id);
      const updated = [...existing, action.theme];
      try { localStorage.setItem('mlv-custom-themes', JSON.stringify(updated)); } catch { /* storage full */ }
      return { ...state, customThemes: updated, selectedThemeId: action.theme.id };
    }
    case 'DELETE_CUSTOM_THEME': {
      const filtered = state.customThemes.filter((t) => t.id !== action.id);
      try { localStorage.setItem('mlv-custom-themes', JSON.stringify(filtered)); } catch { /* ignore */ }
      return {
        ...state,
        customThemes: filtered,
        selectedThemeId: state.selectedThemeId === action.id ? DEFAULT_THEME_ID : state.selectedThemeId,
      };
    }
    case 'SET_CONTENT_PADDING':
      return { ...state, contentPadding: action.value };
    case 'SET_CONTENT_GAP':
      return { ...state, contentGap: action.value };
    case 'SET_ACCENT_BAR_WIDTH':
      return { ...state, accentBarWidth: action.value };
    case 'SET_CONTENT_ALIGN':
      return { ...state, contentAlign: action.value };
    case 'SET_VERTICAL_ALIGN':
      return { ...state, verticalAlign: action.value };
    case 'SET_BODY_LINE_HEIGHT':
      return { ...state, bodyLineHeight: action.value };
    case 'SET_BODY_MAX_WIDTH':
      return { ...state, bodyMaxWidth: action.value };
    case 'SET_HEADLINE_SCALE':
      return { ...state, headlineScale: action.value };
    case 'RESET_LAYOUT':
      return { ...state, contentPadding: 48, contentGap: 24, accentBarWidth: 4, contentAlign: 'left' as const, verticalAlign: 'center' as const, bodyLineHeight: 1.5, bodyMaxWidth: 85, headlineScale: 1.0 };
    default:
      return state;
  }
}

// ── Initial state ──────────────────────────────────────────────

function isValidTheme(t: unknown): t is Theme {
  if (!t || typeof t !== 'object') return false;
  const obj = t as Record<string, unknown>;
  return typeof obj.id === 'string' && typeof obj.name === 'string' &&
    typeof obj.bg === 'string' && typeof obj.text === 'string' &&
    typeof obj.accent === 'string' && typeof obj.secondary === 'string' &&
    typeof obj.card === 'string';
}

function getInitialState(): CarouselState {
  const parsed = parseCarousel(SAMPLE_CONTENT);
  let customThemes: Theme[] = [];
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('mlv-custom-themes');
      if (saved) {
        const parsed_themes = JSON.parse(saved);
        if (Array.isArray(parsed_themes)) {
          customThemes = parsed_themes.filter(isValidTheme);
        }
      }
    } catch { /* corrupted localStorage — start fresh */ }
  }
  return {
    rawText: SAMPLE_CONTENT,
    carousel: parsed,
    selectedSlideIndex: 0,
    selectedThemeId: DEFAULT_THEME_ID,
    selectedStyleId: DEFAULT_STYLE_ID,
    selectedPresetId: DEFAULT_PRESET_ID,
    showLogo: false,
    fontScale: 1,
    caption: parsed.caption || '',
    customThemes,
    contentPadding: 48,
    contentGap: 24,
    accentBarWidth: 4,
    contentAlign: 'left',
    verticalAlign: 'center',
    bodyLineHeight: 1.5,
    bodyMaxWidth: 85,
    headlineScale: 1.0,
  };
}

// ── Main component ─────────────────────────────────────────────

export default function Home() {
  // Skip undo history for high-frequency actions (keystrokes, slider drags)
  const [history, dispatch, { canUndo, canRedo }] = useUndoReducer(
    carouselReducer,
    getInitialState(),
    ['SET_RAW_TEXT', 'SET_CAPTION', 'SET_FONT_SCALE', 'SET_CONTENT_PADDING', 'SET_CONTENT_GAP', 'SET_ACCENT_BAR_WIDTH', 'SET_BODY_LINE_HEIGHT', 'SET_BODY_MAX_WIDTH', 'SET_HEADLINE_SCALE'],
  );
  const state = history.present;

  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; accent?: string; duration?: number } | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slides = state.carousel?.slides || [];
  const totalSlides = slides.length;
  const allThemes = [...THEMES, ...state.customThemes];
  const theme = allThemes.find((t) => t.id === state.selectedThemeId) || THEMES[0];
  const style = getStyleById(state.selectedStyleId) || STYLES[0];
  const preset = getPresetById(state.selectedPresetId) || PRESETS[1];
  const dims = { width: preset.width, height: preset.height };

  const showToast = useCallback((message: string, accent?: string, duration?: number) => {
    setToast({ message, accent, duration });
  }, []);

  // Debounced auto-parse
  const handleTextChange = useCallback((text: string) => {
    dispatch({ type: 'SET_RAW_TEXT', text });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => dispatch({ type: 'PARSE' }), 300);
  }, [dispatch]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // Export handlers
  const getSlideNodes = useCallback(() => {
    return slideRefs.current.slice(0, totalSlides).filter(Boolean) as HTMLDivElement[];
  }, [totalSlides]);

  const handleExportZip = async () => {
    setExporting(true);
    try {
      showToast('Exporting...');
      const nodes = getSlideNodes();
      const result = await exportAllAsZip(nodes, state.carousel?.title || 'carousel', theme.id, (cur, tot) => {
        showToast(`Exporting ${cur}/${tot}...`);
      });
      if (result.success) {
        showToast(result.failedSlides.length > 0 ? `Downloaded! (${result.failedSlides.length} failed)` : 'Downloaded!');
      } else {
        showToast(`Export failed — try again`, '#EF4444', 0);
      }
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      showToast('Generating PDF...');
      const nodes = getSlideNodes();
      const result = await exportAsPdf(nodes, state.carousel?.title || 'carousel', theme.id, dims, (cur, tot) => {
        showToast(`Rendering ${cur}/${tot}...`);
      });
      showToast(result.success ? 'PDF downloaded!' : 'PDF failed — try again');
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
      showToast(result.success ? 'Slide downloaded!' : 'Export failed');
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
      showToast(result.success ? (result.error === 'clipboard-fallback' ? 'Saved as file' : 'Copied!') : 'Copy failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <main style={{ backgroundColor: '#08080C', minHeight: '100vh', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700, margin: 0 }}>MLV Carousel Generator</h1>
          <p style={{ color: '#9CA3AF', fontSize: 11, margin: 0 }}>
            {state.carousel?.title || 'Untitled'} · {totalSlides} slide{totalSlides !== 1 ? 's' : ''} · {theme.name} · {style.name}
          </p>
        </div>
      </header>

      {/* 3-panel layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Input */}
        <div
          role="region"
          aria-label="Content input"
          style={{ width: '25%', minWidth: 240, padding: 16, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto' }}
        >
          <ContentInput
            rawText={state.rawText}
            slides={slides}
            selectedSlideIndex={state.selectedSlideIndex}
            onTextChange={handleTextChange}
            onSlideSelect={(i) => dispatch({ type: 'SELECT_SLIDE', index: i })}
            onSlidesReorder={(from, to) => dispatch({ type: 'REORDER_SLIDES', from, to })}
          />
        </div>

        {/* Center: Preview */}
        <div role="main" aria-label="Slide preview" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          <SlidePreview
            slides={slides}
            selectedIndex={state.selectedSlideIndex}
            totalSlides={totalSlides}
            theme={theme}
            style={style}
            dimensions={dims}
            showLogo={state.showLogo}
            fontScale={state.fontScale}
            contentPadding={state.contentPadding}
            contentGap={state.contentGap}
            accentBarWidth={state.accentBarWidth}
            contentAlign={state.contentAlign}
            verticalAlign={state.verticalAlign}
            bodyLineHeight={state.bodyLineHeight}
            bodyMaxWidth={state.bodyMaxWidth}
            headlineScale={state.headlineScale}
            onNavigate={(i) => dispatch({ type: 'SELECT_SLIDE', index: i })}
            onExportSingle={handleExportSingle}
            onCopySlide={handleCopySlide}
            exporting={exporting}
            slideRefs={slideRefs}
          />
        </div>

        {/* Right: Settings */}
        <div
          role="complementary"
          aria-label="Settings"
          style={{ width: '22%', minWidth: 220, maxWidth: 300, padding: 16, borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto' }}
        >
          <Settings
            selectedThemeId={state.selectedThemeId}
            selectedStyleId={state.selectedStyleId}
            selectedPresetId={state.selectedPresetId}
            showLogo={state.showLogo}
            fontScale={state.fontScale}
            customThemes={state.customThemes}
            totalSlides={totalSlides}
            exporting={exporting}
            canUndo={canUndo}
            canRedo={canRedo}
            onThemeChange={(id) => dispatch({ type: 'SET_THEME', id })}
            onStyleChange={(id) => dispatch({ type: 'SET_STYLE', id })}
            onPresetChange={(id) => dispatch({ type: 'SET_PRESET', id })}
            onLogoToggle={() => dispatch({ type: 'TOGGLE_LOGO' })}
            onFontScaleChange={(scale) => dispatch({ type: 'SET_FONT_SCALE', scale })}
            onCustomThemeSave={(theme) => dispatch({ type: 'SAVE_CUSTOM_THEME', theme })}
            onCustomThemeDelete={(id) => dispatch({ type: 'DELETE_CUSTOM_THEME', id })}
            onExportZip={handleExportZip}
            onExportPdf={handleExportPdf}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onRedo={() => dispatch({ type: 'REDO' })}
            contentPadding={state.contentPadding}
            contentGap={state.contentGap}
            accentBarWidth={state.accentBarWidth}
            contentAlign={state.contentAlign}
            onContentPaddingChange={(v) => dispatch({ type: 'SET_CONTENT_PADDING', value: v })}
            onContentGapChange={(v) => dispatch({ type: 'SET_CONTENT_GAP', value: v })}
            onAccentBarWidthChange={(v) => dispatch({ type: 'SET_ACCENT_BAR_WIDTH', value: v })}
            onContentAlignChange={(v) => dispatch({ type: 'SET_CONTENT_ALIGN', value: v })}
            verticalAlign={state.verticalAlign}
            bodyLineHeight={state.bodyLineHeight}
            bodyMaxWidth={state.bodyMaxWidth}
            headlineScale={state.headlineScale}
            onVerticalAlignChange={(v) => dispatch({ type: 'SET_VERTICAL_ALIGN', value: v })}
            onBodyLineHeightChange={(v) => dispatch({ type: 'SET_BODY_LINE_HEIGHT', value: v })}
            onBodyMaxWidthChange={(v) => dispatch({ type: 'SET_BODY_MAX_WIDTH', value: v })}
            onHeadlineScaleChange={(v) => dispatch({ type: 'SET_HEADLINE_SCALE', value: v })}
            onResetLayout={() => dispatch({ type: 'RESET_LAYOUT' })}
          />
        </div>
      </div>

      {/* Caption bar */}
      <CaptionArea
        caption={state.caption}
        onCaptionChange={(caption) => dispatch({ type: 'SET_CAPTION', caption })}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          accent={toast.accent}
          duration={toast.duration}
          onDismiss={() => setToast(null)}
        />
      )}
    </main>
  );
}
