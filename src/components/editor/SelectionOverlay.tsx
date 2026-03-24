'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ElementOverride } from '@/types/carousel';

interface SelectionOverlayProps {
  selectedElementId: string | null;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  previewScale: number;
  slideIndex: number;
  onOverrideCommit?: (slideIndex: number, override: ElementOverride) => void;
  currentOverride?: ElementOverride;
}

interface Rect {
  x: number; y: number; width: number; height: number;
}

const HANDLE_SIZE = 8;
const MIN_SIZE = 20;

export default function SelectionOverlay({
  selectedElementId, canvasRef, previewScale, slideIndex, onOverrideCommit, currentOverride,
}: SelectionOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  const resizeRef = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);

  const updateRect = useCallback(() => {
    if (!selectedElementId || !canvasRef.current) { setRect(null); return; }
    const escapedId = CSS.escape(selectedElementId);
    const el = canvasRef.current.querySelector(`[data-element-id="${escapedId}"]`);
    if (!el) { setRect(null); return; }
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setRect({
      x: elRect.left - canvasRect.left, y: elRect.top - canvasRect.top,
      width: elRect.width, height: elRect.height,
    });
  }, [selectedElementId, canvasRef]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    const timer = setTimeout(updateRect, 100);
    return () => {
      window.removeEventListener('resize', updateRect);
      clearTimeout(timer);
      if (resizeRef.current) {
        window.removeEventListener('mousemove', resizeRef.current.move);
        window.removeEventListener('mouseup', resizeRef.current.up);
      }
    };
  }, [updateRect]);

  const handleResizeStart = useCallback((e: React.MouseEvent, handleIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!rect || !selectedElementId || !onOverrideCommit) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = rect.width / previewScale;
    const startH = rect.height / previewScale;

    // Determine which edges this handle controls
    const isLeft = handleIndex === 0 || handleIndex === 7 || handleIndex === 6;
    const isRight = handleIndex === 2 || handleIndex === 3 || handleIndex === 4;
    const isTop = handleIndex === 0 || handleIndex === 1 || handleIndex === 2;
    const isBottom = handleIndex === 4 || handleIndex === 5 || handleIndex === 6;

    const startRectX = rect.x;
    const startRectY = rect.y;

    const handleMove = (moveE: MouseEvent) => {
      const dx = (moveE.clientX - startX) / previewScale;
      const dy = (moveE.clientY - startY) / previewScale;
      let newW = startW;
      let newH = startH;
      let newX = startRectX;
      let newY = startRectY;
      if (isRight) newW = Math.max(MIN_SIZE, startW + dx);
      if (isLeft) { newW = Math.max(MIN_SIZE, startW - dx); newX = startRectX + (startW - newW) * previewScale; }
      if (isBottom) newH = Math.max(MIN_SIZE, startH + dy);
      if (isTop) { newH = Math.max(MIN_SIZE, startH - dy); newY = startRectY + (startH - newH) * previewScale; }
      setRect((prev) => prev ? {
        ...prev,
        x: newX, y: newY,
        width: newW * previewScale,
        height: newH * previewScale,
      } : null);
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      resizeRef.current = null;
      // Commit final size
      setRect((finalRect) => {
        if (finalRect && onOverrideCommit) {
          onOverrideCommit(slideIndex, {
            id: selectedElementId,
            ...currentOverride,
            width: Math.max(MIN_SIZE, finalRect.width / previewScale),
            height: Math.max(MIN_SIZE, finalRect.height / previewScale),
          } as ElementOverride);
        }
        return finalRect;
      });
      setTimeout(updateRect, 50);
    };

    resizeRef.current = { move: handleMove, up: handleUp };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [rect, selectedElementId, previewScale, slideIndex, onOverrideCommit, currentOverride, updateRect]);

  if (!rect || !selectedElementId) return null;

  const handles = [
    { x: rect.x, y: rect.y, cursor: 'nwse-resize' },
    { x: rect.x + rect.width / 2, y: rect.y, cursor: 'ns-resize' },
    { x: rect.x + rect.width, y: rect.y, cursor: 'nesw-resize' },
    { x: rect.x + rect.width, y: rect.y + rect.height / 2, cursor: 'ew-resize' },
    { x: rect.x + rect.width, y: rect.y + rect.height, cursor: 'nwse-resize' },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height, cursor: 'ns-resize' },
    { x: rect.x, y: rect.y + rect.height, cursor: 'nesw-resize' },
    { x: rect.x, y: rect.y + rect.height / 2, cursor: 'ew-resize' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      <div style={{
        position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: rect.height,
        border: '2px dashed #38BDF8', borderRadius: 2, pointerEvents: 'none',
      }} />
      {handles.map((h, i) => (
        <div
          key={i}
          onMouseDown={(e) => handleResizeStart(e, i)}
          style={{
            position: 'absolute',
            left: h.x - HANDLE_SIZE / 2, top: h.y - HANDLE_SIZE / 2,
            width: HANDLE_SIZE, height: HANDLE_SIZE,
            backgroundColor: '#FFFFFF', border: '1px solid #38BDF8',
            borderRadius: 1, cursor: h.cursor, pointerEvents: 'auto',
          }}
        />
      ))}
    </div>
  );
}
