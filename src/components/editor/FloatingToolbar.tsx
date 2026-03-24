'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ElementOverride, Theme } from '@/types/carousel';

interface FloatingToolbarProps {
  selectedElementId: string | null;
  override?: ElementOverride;
  theme: Theme;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  previewScale: number;
  slideIndex: number;
  onOverrideCommit: (slideIndex: number, override: ElementOverride) => void;
  onOverrideRemove: (slideIndex: number, elementId: string) => void;
}

const TOOLBAR_HEIGHT = 36;
const TOOLBAR_GAP = 8;

const btnStyle: React.CSSProperties = {
  padding: '4px 8px', fontSize: 11, fontWeight: 500, border: 'none',
  borderRadius: 3, cursor: 'pointer', fontFamily: 'inherit', minHeight: 28,
  transition: 'background 0.1s',
};

export default function FloatingToolbar({
  selectedElementId, override, theme, canvasRef, previewScale,
  slideIndex, onOverrideCommit, onOverrideRemove,
}: FloatingToolbarProps) {
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);
  const [hexInput, setHexInput] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Position toolbar relative to selected element
  useEffect(() => {
    if (!selectedElementId || !canvasRef.current) { setPos(null); return; }
    const escapedId = CSS.escape(selectedElementId);
    const el = canvasRef.current.querySelector(`[data-element-id="${escapedId}"]`);
    if (!el) { setPos(null); return; }
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const x = elRect.left - canvasRect.left + elRect.width / 2;
    const y = elRect.top - canvasRect.top;
    const below = y < TOOLBAR_HEIGHT + TOOLBAR_GAP + 10;
    setPos({ x, y, below });
  }, [selectedElementId, canvasRef, override]);

  const commitOverride = useCallback((patch: Partial<ElementOverride>) => {
    if (!selectedElementId) return;
    onOverrideCommit(slideIndex, {
      id: selectedElementId,
      ...override,
      ...patch,
    } as ElementOverride);
  }, [selectedElementId, slideIndex, override, onOverrideCommit]);

  const handleReset = useCallback(() => {
    if (!selectedElementId) return;
    onOverrideRemove(slideIndex, selectedElementId);
  }, [selectedElementId, slideIndex, onOverrideRemove]);

  if (!pos || !selectedElementId) return null;

  const currentFontSize = override?.fontSize ?? 40; // default headline
  const currentWeight = override?.fontWeight ?? 700;
  const currentColor = override?.color ?? theme.text;
  const isVisible = override?.visible !== false;

  const swatches = [theme.accent, theme.text, theme.secondary, '#FFFFFF', '#000000'];

  return (
    <div
      ref={toolbarRef}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.below ? pos.y + TOOLBAR_GAP + 40 : pos.y - TOOLBAR_HEIGHT - TOOLBAR_GAP,
        transform: 'translateX(-50%)',
        backgroundColor: '#111118',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        zIndex: 30,
        height: TOOLBAR_HEIGHT,
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Font size */}
      <button onClick={() => commitOverride({ fontSize: Math.max(8, currentFontSize - 2) })}
        style={{ ...btnStyle, backgroundColor: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>−</button>
      <span style={{ fontSize: 11, color: '#F5F5F5', minWidth: 28, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
        {Math.round(currentFontSize)}
      </span>
      <button onClick={() => commitOverride({ fontSize: currentFontSize + 2 })}
        style={{ ...btnStyle, backgroundColor: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>+</button>

      <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.08)' }} />

      {/* Font weight */}
      {[400, 500, 700].map((w) => (
        <button key={w} onClick={() => commitOverride({ fontWeight: w })}
          style={{
            ...btnStyle,
            backgroundColor: currentWeight === w ? '#6AC670' : 'rgba(255,255,255,0.06)',
            color: currentWeight === w ? '#0A0A0A' : '#9CA3AF',
            fontWeight: w,
          }}>
          {w === 400 ? 'L' : w === 500 ? 'M' : 'B'}
        </button>
      ))}

      <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.08)' }} />

      {/* Color swatches */}
      {swatches.map((c) => (
        <button key={c} onClick={() => commitOverride({ color: c })}
          style={{
            width: 18, height: 18, borderRadius: 3, border: currentColor === c ? '2px solid #3B82F6' : '1px solid rgba(255,255,255,0.12)',
            backgroundColor: c, cursor: 'pointer', padding: 0, minHeight: 18,
          }} />
      ))}
      <input
        value={hexInput}
        onChange={(e) => setHexInput(e.target.value)}
        onBlur={() => { if (/^#[0-9a-fA-F]{3,6}$/.test(hexInput)) commitOverride({ color: hexInput }); }}
        onKeyDown={(e) => { if (e.key === 'Enter' && /^#[0-9a-fA-F]{3,6}$/.test(hexInput)) commitOverride({ color: hexInput }); }}
        placeholder="#hex"
        style={{
          width: 48, padding: '2px 4px', fontSize: 10, backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, color: '#F5F5F5',
          fontFamily: 'monospace', outline: 'none',
        }}
      />

      <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.08)' }} />

      {/* Visibility toggle */}
      <button onClick={() => commitOverride({ visible: !isVisible })}
        style={{ ...btnStyle, backgroundColor: 'rgba(255,255,255,0.06)', color: isVisible ? '#F5F5F5' : '#EF4444', fontSize: 13 }}>
        {isVisible ? '👁' : '🚫'}
      </button>

      {/* Reset */}
      <button onClick={handleReset}
        style={{ ...btnStyle, backgroundColor: 'rgba(255,255,255,0.06)', color: '#EF4444' }}>
        ↩
      </button>
    </div>
  );
}
