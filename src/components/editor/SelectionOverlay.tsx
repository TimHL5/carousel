'use client';

import { useEffect, useState, useCallback } from 'react';

interface SelectionOverlayProps {
  selectedElementId: string | null;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  previewScale: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const HANDLE_SIZE = 8;

export default function SelectionOverlay({ selectedElementId, canvasRef, previewScale }: SelectionOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  const updateRect = useCallback(() => {
    if (!selectedElementId || !canvasRef.current) {
      setRect(null);
      return;
    }
    const escapedId = CSS.escape(selectedElementId);
    const el = canvasRef.current.querySelector(`[data-element-id="${escapedId}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setRect({
      x: elRect.left - canvasRect.left,
      y: elRect.top - canvasRect.top,
      width: elRect.width,
      height: elRect.height,
    });
  }, [selectedElementId, canvasRef]);

  // Update rect on selection change and on resize
  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    // Also update after a short delay to catch React re-renders
    const timer = setTimeout(updateRect, 100);
    return () => {
      window.removeEventListener('resize', updateRect);
      clearTimeout(timer);
    };
  }, [updateRect]);

  if (!rect || !selectedElementId) return null;

  // 8 handle positions: 4 corners + 4 midpoints
  const handles = [
    { x: rect.x, y: rect.y, cursor: 'nwse-resize' },                                           // top-left
    { x: rect.x + rect.width / 2, y: rect.y, cursor: 'ns-resize' },                            // top-center
    { x: rect.x + rect.width, y: rect.y, cursor: 'nesw-resize' },                              // top-right
    { x: rect.x + rect.width, y: rect.y + rect.height / 2, cursor: 'ew-resize' },              // middle-right
    { x: rect.x + rect.width, y: rect.y + rect.height, cursor: 'nwse-resize' },                // bottom-right
    { x: rect.x + rect.width / 2, y: rect.y + rect.height, cursor: 'ns-resize' },              // bottom-center
    { x: rect.x, y: rect.y + rect.height, cursor: 'nesw-resize' },                             // bottom-left
    { x: rect.x, y: rect.y + rect.height / 2, cursor: 'ew-resize' },                           // middle-left
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      {/* Selection border */}
      <div
        style={{
          position: 'absolute',
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          border: '2px dashed #38BDF8',
          borderRadius: 2,
          pointerEvents: 'none',
        }}
      />
      {/* Resize handles (visual only — no drag in Phase 6B) */}
      {handles.map((h, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: h.x - HANDLE_SIZE / 2,
            top: h.y - HANDLE_SIZE / 2,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            backgroundColor: '#FFFFFF',
            border: '1px solid #38BDF8',
            borderRadius: 1,
            cursor: h.cursor,
            pointerEvents: 'none', // visual only until Phase 6D adds drag behavior
          }}
        />
      ))}
    </div>
  );
}
