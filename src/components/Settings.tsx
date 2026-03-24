'use client';

import { useState } from 'react';
import SlideRenderer from '@/components/slides/SlideRenderer';
import { THEMES, DEFAULT_THEME_ID } from '@/lib/themes';
import { STYLES, DEFAULT_STYLE_ID } from '@/lib/styles';
import { PRESETS, DEFAULT_PRESET_ID } from '@/lib/dimensions';
import type { Theme, StyleVariant, ExportPreset, SlideData } from '@/types/carousel';

interface SettingsProps {
  selectedThemeId: string;
  selectedStyleId: string;
  selectedPresetId: string;
  showLogo: boolean;
  fontScale: number;
  customThemes: Theme[];
  totalSlides: number;
  exporting: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onThemeChange: (id: string) => void;
  onStyleChange: (id: string) => void;
  onPresetChange: (id: string) => void;
  onLogoToggle: () => void;
  onFontScaleChange: (scale: number) => void;
  onCustomThemeSave: (theme: Theme) => void;
  onCustomThemeDelete: (id: string) => void;
  onExportZip: () => void;
  onExportPdf: () => void;
  onUndo: () => void;
  onRedo: () => void;
  // Layout
  contentPadding: number;
  contentGap: number;
  accentBarWidth: number;
  contentAlign: 'left' | 'center';
  onContentPaddingChange: (v: number) => void;
  onContentGapChange: (v: number) => void;
  onAccentBarWidthChange: (v: number) => void;
  onContentAlignChange: (v: 'left' | 'center') => void;
  verticalAlign: 'top' | 'center' | 'bottom';
  bodyLineHeight: number;
  bodyMaxWidth: number;
  headlineScale: number;
  onVerticalAlignChange: (v: 'top' | 'center' | 'bottom') => void;
  onBodyLineHeightChange: (v: number) => void;
  onBodyMaxWidthChange: (v: number) => void;
  onHeadlineScaleChange: (v: number) => void;
  onResetLayout: () => void;
}

// Mini hook slide for theme previews
const PREVIEW_SLIDE: SlideData = { type: 'hook', headline: 'Aa' };
const PREVIEW_DIMS = { width: 108, height: 135 };

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: '#9CA3AF', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const selectStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', backgroundColor: '#111118',
  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4,
  color: '#F5F5F5', fontSize: 12, fontFamily: 'inherit', marginBottom: 16,
  outline: 'none',
};

export default function Settings(props: SettingsProps) {
  const {
    selectedThemeId, selectedStyleId, selectedPresetId, showLogo, fontScale,
    customThemes, totalSlides, exporting, canUndo, canRedo,
    onThemeChange, onStyleChange, onPresetChange, onLogoToggle, onFontScaleChange,
    onCustomThemeSave, onCustomThemeDelete, onExportZip, onExportPdf, onUndo, onRedo,
    contentPadding, contentGap, accentBarWidth, contentAlign,
    onContentPaddingChange, onContentGapChange, onAccentBarWidthChange, onContentAlignChange,
    verticalAlign, bodyLineHeight, bodyMaxWidth, headlineScale,
    onVerticalAlignChange, onBodyLineHeightChange, onBodyMaxWidthChange, onHeadlineScaleChange,
    onResetLayout,
  } = props;

  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('My Theme');
  const [customColors, setCustomColors] = useState({ bg: '#1a1a2e', text: '#F5F5F5', accent: '#E94560', secondary: '#9CA3AF', card: '#16213E' });

  const allThemes = [...THEMES, ...customThemes];
  const defaultStyle = STYLES.find((s) => s.id === DEFAULT_STYLE_ID) || STYLES[0];

  const handleSaveCustom = () => {
    const theme: Theme = {
      id: `custom-${Date.now()}`,
      name: customName,
      ...customColors,
    };
    try {
      onCustomThemeSave(theme);
      setShowCustom(false);
    } catch {
      // localStorage full — handled by parent
    }
  };

  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '10px 16px', backgroundColor: '#6AC670', color: '#0A0A0A',
    border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', minHeight: 44,
  };
  const btnGhost: React.CSSProperties = {
    ...btnPrimary, backgroundColor: 'transparent', color: '#F5F5F5',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Undo / Redo */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        <button onClick={onUndo} disabled={!canUndo} style={{ ...btnGhost, width: 'auto', padding: '8px 12px', fontSize: 11, minHeight: 36, opacity: canUndo ? 1 : 0.3 }}>
          Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo} style={{ ...btnGhost, width: 'auto', padding: '8px 12px', fontSize: 11, minHeight: 36, opacity: canRedo ? 1 : 0.3 }}>
          Redo
        </button>
      </div>

      {/* Platform */}
      <div style={labelStyle}>Platform</div>
      <select value={selectedPresetId} onChange={(e) => onPresetChange(e.target.value)} style={selectStyle}>
        {PRESETS.map((p) => (
          <option key={p.id} value={p.id}>{p.name} ({p.width}×{p.height})</option>
        ))}
      </select>

      {/* Theme picker with thumbnails */}
      <div style={labelStyle}>Theme</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 16 }}>
        {allThemes.map((t) => (
          <div
            key={t.id}
            onClick={() => onThemeChange(t.id)}
            style={{
              cursor: 'pointer',
              borderRadius: 6,
              overflow: 'hidden',
              border: t.id === selectedThemeId ? '2px solid #6AC670' : '2px solid rgba(255,255,255,0.06)',
              position: 'relative',
            }}
          >
            {/* Mini slide thumbnail */}
            <div style={{ transform: 'scale(1)', transformOrigin: 'top left', width: '100%', aspectRatio: '108/135', overflow: 'hidden' }}>
              <div style={{ transform: `scale(${1})`, transformOrigin: 'top left' }}>
                <SlideRenderer
                  slide={PREVIEW_SLIDE}
                  slideIndex={0}
                  totalSlides={1}
                  theme={t}
                  style={defaultStyle}
                  dimensions={PREVIEW_DIMS}
                  showLogo={false}
                  fontScale={1}
                  contentPadding={12}
                  contentGap={6}
                  accentBarWidth={1}
                  contentAlign="left"
                  verticalAlign="center"
                  bodyLineHeight={1.5}
                  bodyMaxWidth={85}
                  headlineScale={1}
                  editMode={false}
                  selectedElementId={null}
                  previewScale={1}
                />
              </div>
            </div>
            <div style={{ padding: '4px 6px', backgroundColor: '#111118', fontSize: 9, color: t.id === selectedThemeId ? '#6AC670' : '#9CA3AF', textAlign: 'center' }}>
              {t.name}
            </div>
            {/* Delete button for custom themes */}
            {t.id.startsWith('custom-') && (
              <button
                onClick={(e) => { e.stopPropagation(); onCustomThemeDelete(t.id); }}
                style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#EF4444', fontSize: 10, cursor: 'pointer', borderRadius: 2, padding: '1px 4px' }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Custom theme builder */}
      {!showCustom ? (
        <button onClick={() => setShowCustom(true)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 11, marginBottom: 16 }}>
          + Custom Theme
        </button>
      ) : (
        <div style={{ backgroundColor: '#111118', borderRadius: 6, padding: 12, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Theme name" style={{ ...selectStyle, marginBottom: 8 }} />
          {(['bg', 'text', 'accent', 'secondary', 'card'] as const).map((key) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <input
                type="color"
                value={customColors[key]}
                onChange={(e) => setCustomColors((c) => ({ ...c, [key]: e.target.value }))}
                style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              />
              <span style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'capitalize' }}>{key}</span>
              <span style={{ fontSize: 10, color: '#6B7280', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{customColors[key]}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button onClick={handleSaveCustom} style={{ ...btnPrimary, padding: '6px', fontSize: 11 }}>Save</button>
            <button onClick={() => setShowCustom(false)} style={{ ...btnGhost, padding: '6px', fontSize: 11 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Style */}
      <div style={labelStyle}>Style</div>
      <select value={selectedStyleId} onChange={(e) => onStyleChange(e.target.value)} style={selectStyle}>
        {STYLES.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* Font Scale */}
      <div style={labelStyle}>Font Scale: {Math.round(fontScale * 100)}%</div>
      <input
        type="range" min={0.8} max={1.2} step={0.05} value={fontScale}
        onChange={(e) => onFontScaleChange(parseFloat(e.target.value))}
        style={{ width: '100%', marginBottom: 16, accentColor: '#6AC670' }}
      />

      {/* Logo toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, cursor: 'pointer', fontSize: 12, color: '#F5F5F5' }}>
        <input type="checkbox" checked={showLogo} onChange={onLogoToggle} style={{ accentColor: '#6AC670' }} />
        Show MLV logo on slides
      </label>

      {/* Layout */}
      <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />

      <div style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Layout</span>
        <button
          onClick={onResetLayout}
          style={{ background: 'none', border: 'none', color: '#6AC670', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', minHeight: 28 }}
        >
          Reset
        </button>
      </div>

      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Padding: {contentPadding}px</div>
      <input
        type="range" min={24} max={72} step={4} value={contentPadding}
        onChange={(e) => onContentPaddingChange(parseInt(e.target.value))}
        style={{ width: '100%', marginBottom: 12, accentColor: '#6AC670' }}
      />

      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Content Gap: {contentGap}px</div>
      <input
        type="range" min={12} max={48} step={4} value={contentGap}
        onChange={(e) => onContentGapChange(parseInt(e.target.value))}
        style={{ width: '100%', marginBottom: 12, accentColor: '#6AC670' }}
      />

      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Accent Bar: {accentBarWidth === 0 ? 'Off' : `${accentBarWidth}px`}</div>
      <input
        type="range" min={0} max={8} step={1} value={accentBarWidth}
        onChange={(e) => onAccentBarWidthChange(parseInt(e.target.value))}
        style={{ width: '100%', marginBottom: 12, accentColor: '#6AC670' }}
      />

      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Text Align</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {(['left', 'center'] as const).map((align) => (
          <button
            key={align}
            onClick={() => onContentAlignChange(align)}
            style={{
              flex: 1, padding: '10px 0', fontSize: 11, fontWeight: 500, minHeight: 36,
              backgroundColor: contentAlign === align ? '#6AC670' : 'transparent',
              color: contentAlign === align ? '#0A0A0A' : '#9CA3AF',
              border: contentAlign === align ? 'none' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
              textTransform: 'capitalize',
            }}
          >
            {align}
          </button>
        ))}
      </div>

      {/* Vertical Align */}
      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Vertical Align</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {(['top', 'center', 'bottom'] as const).map((v) => (
          <button
            key={v}
            onClick={() => onVerticalAlignChange(v)}
            style={{
              flex: 1, padding: '8px 0', fontSize: 11, fontWeight: 500, minHeight: 36,
              backgroundColor: verticalAlign === v ? '#6AC670' : 'transparent',
              color: verticalAlign === v ? '#0A0A0A' : '#9CA3AF',
              border: verticalAlign === v ? 'none' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
              textTransform: 'capitalize',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Line Height */}
      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Line Height: {bodyLineHeight.toFixed(1)}</div>
      <input
        type="range" min={1.2} max={2.0} step={0.1} value={bodyLineHeight}
        onChange={(e) => onBodyLineHeightChange(parseFloat(e.target.value))}
        style={{ width: '100%', marginBottom: 12, accentColor: '#6AC670' }}
      />

      {/* Body Max Width */}
      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Body Width: {bodyMaxWidth}%</div>
      <input
        type="range" min={60} max={100} step={5} value={bodyMaxWidth}
        onChange={(e) => onBodyMaxWidthChange(parseInt(e.target.value))}
        style={{ width: '100%', marginBottom: 12, accentColor: '#6AC670' }}
      />

      {/* Headline Scale */}
      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Headline Size: {Math.round(headlineScale * 100)}%</div>
      <input
        type="range" min={0.7} max={1.3} step={0.05} value={headlineScale}
        onChange={(e) => onHeadlineScaleChange(parseFloat(e.target.value))}
        style={{ width: '100%', marginBottom: 24, accentColor: '#6AC670' }}
      />

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />

      {/* Export */}
      <button onClick={onExportZip} disabled={exporting || totalSlides === 0} style={{ ...btnPrimary, marginBottom: 8, opacity: totalSlides === 0 ? 0.4 : 1 }}>
        {exporting ? 'Exporting...' : 'Download All (ZIP)'}
      </button>
      <button onClick={onExportPdf} disabled={exporting || totalSlides === 0} style={{ ...btnGhost, opacity: totalSlides === 0 ? 0.4 : 1 }}>
        {exporting ? 'Generating...' : 'Download as PDF'}
      </button>
    </div>
  );
}
