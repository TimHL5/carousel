'use client';

import { useCallback, useState } from 'react';
import type { ElementOverride } from '@/types/carousel';

interface ElementWrapperProps {
  elementId: string;
  children: React.ReactNode;
  editMode: boolean;
  isSelected: boolean;
  override?: ElementOverride;
  scale: number; // dimensions.width / 1080 — for converting override px to render px
  onSelect?: (elementId: string) => void;
  style?: React.CSSProperties; // pass-through styles from the slide component
}

export default function ElementWrapper({
  elementId,
  children,
  editMode,
  isSelected,
  override,
  scale,
  onSelect,
  style: passStyle,
}: ElementWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode) return;
      e.stopPropagation();
      onSelect?.(elementId);
    },
    [editMode, elementId, onSelect],
  );

  // If override has x/y, switch to absolute positioning
  const hasPositionOverride = override && override.x !== undefined && override.y !== undefined;
  const isVisible = override?.visible !== false;

  if (!isVisible && editMode) {
    // In edit mode, show hidden elements as ghosted
    return (
      <div
        data-element-id={elementId}
        onClick={handleClick}
        style={{
          ...passStyle,
          opacity: 0.2,
          cursor: 'pointer',
          outline: isSelected ? '2px solid #3B82F6' : 'none',
        }}
      >
        {children}
      </div>
    );
  }

  if (!isVisible) return null;

  // Override styles: fontSize, fontWeight, color from ElementOverride
  // Use !== undefined (not truthiness) so 0 values are applied correctly
  const overrideStyles: React.CSSProperties = {};
  if (override?.fontSize !== undefined) overrideStyles.fontSize = override.fontSize * scale;
  if (override?.fontWeight !== undefined) overrideStyles.fontWeight = override.fontWeight;
  if (override?.color !== undefined) overrideStyles.color = override.color;
  if (override?.width !== undefined) overrideStyles.width = override.width * scale;
  if (override?.height !== undefined) overrideStyles.height = override.height * scale;
  if (override?.rotation !== undefined) overrideStyles.transform = `rotate(${override.rotation}deg)`;

  const positionStyles: React.CSSProperties = hasPositionOverride
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
        cursor: 'pointer',
        outline: isSelected
          ? '2px solid #3B82F6'
          : isHovered
            ? '1px dashed rgba(59, 130, 246, 0.5)'
            : 'none',
        outlineOffset: 2,
        transition: 'outline 0.1s ease-out',
      }
    : {};

  return (
    <div
      data-element-id={elementId}
      onClick={handleClick}
      onMouseEnter={() => editMode && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...passStyle,
        // Strip conflicting position props when override takes over (e.g., CTA has bottom/right but override uses left/top)
        ...(hasPositionOverride && { bottom: undefined, right: undefined }),
        ...positionStyles,
        ...overrideStyles,
        ...editorStyles,
      }}
    >
      {children}
    </div>
  );
}
