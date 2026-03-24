'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import type { ElementOverride } from '@/types/carousel';

interface ElementWrapperProps {
  elementId: string;
  children: React.ReactNode;
  editMode: boolean;
  isSelected: boolean;
  override?: ElementOverride;
  scale: number; // dimensions.width / 1080
  previewScale: number; // CSS transform scale factor for coordinate conversion
  slideIndex: number;
  onSelect?: (elementId: string | null) => void;
  onOverrideCommit?: (slideIndex: number, override: ElementOverride) => void;
  onOverrideRemove?: (slideIndex: number, elementId: string) => void;
  style?: React.CSSProperties;
}

const GRID_SIZE = 8; // snap-to-grid base unit from DESIGN_SYSTEM.md

function snapToGrid(value: number, enabled: boolean): number {
  if (!enabled) return value;
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export default function ElementWrapper({
  elementId,
  children,
  editMode,
  isSelected,
  override,
  scale,
  previewScale,
  slideIndex,
  onSelect,
  onOverrideCommit,
  onOverrideRemove,
  style: passStyle,
}: ElementWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const dragListenersRef = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);

  // Cleanup drag listeners on unmount or editMode change (fixes listener leak)
  useEffect(() => {
    if (!editMode) {
      setIsHovered(false);
      setIsDragging(false);
      setDragPos(null);
      setShowContextMenu(false);
    }
    return () => {
      if (dragListenersRef.current) {
        window.removeEventListener('mousemove', dragListenersRef.current.move);
        window.removeEventListener('mouseup', dragListenersRef.current.up);
        dragListenersRef.current = null;
      }
    };
  }, [editMode]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || isDragging) return;
      e.stopPropagation();
      onSelect?.(elementId);
    },
    [editMode, isDragging, elementId, onSelect],
  );

  // ── Drag behavior ──────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || !isSelected || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      // Get element's current position in slide coordinates
      const el = elementRef.current;
      if (!el) return;
      const parentRect = el.offsetParent?.getBoundingClientRect();
      if (!parentRect) return;
      const elRect = el.getBoundingClientRect();

      // Convert screen mouse position to slide coordinates
      const mouseSlideX = (e.clientX - parentRect.left) / previewScale;
      const mouseSlideY = (e.clientY - parentRect.top) / previewScale;

      // Current element position in slide coordinates
      const elSlideX = (elRect.left - parentRect.left) / previewScale;
      const elSlideY = (elRect.top - parentRect.top) / previewScale;

      // Record offset from mouse to element origin
      dragOffset.current = {
        x: mouseSlideX - elSlideX,
        y: mouseSlideY - elSlideY,
      };

      setIsDragging(true);
      setDragPos({ x: elSlideX, y: elSlideY });

      const handleMouseMove = (moveE: MouseEvent) => {
        const newSlideX = (moveE.clientX - parentRect.left) / previewScale - dragOffset.current.x;
        const newSlideY = (moveE.clientY - parentRect.top) / previewScale - dragOffset.current.y;
        const snapEnabled = !moveE.shiftKey;
        setDragPos({
          x: snapToGrid(newSlideX, snapEnabled),
          y: snapToGrid(newSlideY, snapEnabled),
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        dragListenersRef.current = null;
        setIsDragging(false);
        // Commit final position with bounds clamping
        setDragPos((finalPos) => {
          if (finalPos && onOverrideCommit) {
            // Clamp to slide bounds (0 to slide width/height minus some minimum visible area)
            const maxX = 1080 - 40; // keep at least 40px visible
            const maxY = 1350 - 40;
            onOverrideCommit(slideIndex, {
              id: elementId,
              x: Math.max(0, Math.min(maxX, finalPos.x)),
              y: Math.max(0, Math.min(maxY, finalPos.y)),
              ...(override?.fontSize !== undefined && { fontSize: override.fontSize }),
              ...(override?.fontWeight !== undefined && { fontWeight: override.fontWeight }),
              ...(override?.color !== undefined && { color: override.color }),
              ...(override?.visible !== undefined && { visible: override.visible }),
            });
          }
          return null;
        });
      };

      dragListenersRef.current = { move: handleMouseMove, up: handleMouseUp };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [editMode, isSelected, previewScale, slideIndex, elementId, onOverrideCommit, override],
  );

  // Context menu for "Reset position"
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || override?.x === undefined) return;
      e.preventDefault();
      setShowContextMenu(true);
    },
    [editMode, override],
  );

  const handleResetPosition = useCallback(() => {
    onOverrideRemove?.(slideIndex, elementId);
    setShowContextMenu(false);
  }, [onOverrideRemove, slideIndex, elementId]);

  // Close context menu on click outside
  useEffect(() => {
    if (!showContextMenu) return;
    const handler = () => setShowContextMenu(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showContextMenu]);

  // ── Rendering ──────────────────────────────────────────
  const hasPositionOverride = override && override.x !== undefined && override.y !== undefined;
  const isVisible = override?.visible !== false;

  if (!isVisible && editMode) {
    return (
      <div data-element-id={elementId} onClick={handleClick}
        style={{ ...passStyle, opacity: 0.2, cursor: 'pointer', outline: isSelected ? '2px solid #3B82F6' : 'none' }}>
        {children}
      </div>
    );
  }
  if (!isVisible) return null;

  // Override styles
  const overrideStyles: React.CSSProperties = {};
  if (override?.fontSize !== undefined) overrideStyles.fontSize = override.fontSize * scale;
  if (override?.fontWeight !== undefined) overrideStyles.fontWeight = override.fontWeight;
  if (override?.color !== undefined) overrideStyles.color = override.color;
  if (override?.width !== undefined) overrideStyles.width = override.width * scale;
  if (override?.height !== undefined) overrideStyles.height = override.height * scale;
  if (override?.rotation !== undefined) overrideStyles.transform = `rotate(${override.rotation}deg)`;

  // Position: during drag use local state, otherwise use override or flexbox
  const isBeingDragged = isDragging && dragPos;
  const positionStyles: React.CSSProperties = isBeingDragged
    ? {
        position: 'absolute' as const,
        left: dragPos.x * scale,
        top: dragPos.y * scale,
        zIndex: 20,
        opacity: 0.9,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }
    : hasPositionOverride
      ? {
          position: 'absolute' as const,
          left: (override!.x ?? 0) * scale,
          top: (override!.y ?? 0) * scale,
          zIndex: 10,
        }
      : {};

  // Editor affordances
  const editorStyles: React.CSSProperties = editMode
    ? {
        cursor: isDragging ? 'grabbing' : isSelected ? 'grab' : 'pointer',
        outline: isSelected
          ? '2px solid #3B82F6'
          : isHovered
            ? '1px dashed rgba(59, 130, 246, 0.5)'
            : 'none',
        outlineOffset: 2,
        transition: isDragging ? 'none' : 'outline 0.1s ease-out',
      }
    : {};

  return (
    <>
      <div
        ref={elementRef}
        data-element-id={elementId}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => editMode && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
        style={{
          ...passStyle,
          ...(hasPositionOverride && { bottom: undefined, right: undefined }),
          ...positionStyles,
          ...overrideStyles,
          ...editorStyles,
        }}
      >
        {children}
      </div>
      {/* Context menu */}
      {showContextMenu && elementRef.current && (
        <div
          style={{
            position: 'fixed',
            left: elementRef.current.getBoundingClientRect().right + 4,
            top: elementRef.current.getBoundingClientRect().top,
            backgroundColor: '#111118',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 4,
            padding: '4px 0',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <button
            onClick={handleResetPosition}
            style={{
              display: 'block', width: '100%', padding: '6px 12px',
              background: 'none', border: 'none', color: '#F5F5F5',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            Reset position
          </button>
        </div>
      )}
    </>
  );
}
