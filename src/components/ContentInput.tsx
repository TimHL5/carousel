'use client';

import { useCallback, useRef, useState } from 'react';
import type { SlideData } from '@/types/carousel';

interface ContentInputProps {
  rawText: string;
  slides: SlideData[];
  selectedSlideIndex: number;
  onTextChange: (text: string) => void;
  onSlideSelect: (index: number) => void;
  onSlidesReorder: (fromIndex: number, toIndex: number) => void;
}

// Type badge colors match the accent green on dark bg
const BADGE_STYLE: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#6AC670',
  color: '#0A0A0A',
  fontSize: 10,
  fontWeight: 600,
  padding: '2px 6px',
  borderRadius: 9999,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  flexShrink: 0,
};

export default function ContentInput({
  rawText,
  slides,
  selectedSlideIndex,
  onTextChange,
  onSlideSelect,
  onSlidesReorder,
}: ContentInputProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((_e: React.DragEvent, index: number) => {
    dragCounter.current++;
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      setDragOverIndex(null);
      dragCounter.current = 0;
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        onSlidesReorder(fromIndex, toIndex);
      }
      setDragIndex(null);
      setDragOverIndex(null);
      dragCounter.current = 0;
    },
    [onSlidesReorder],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Textarea */}
      <textarea
        value={rawText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={`Paste your carousel script here...\n\nFormat:\nTITLE: Your carousel title\n\n---\n\nSLIDE 1 [hook]\nHEADLINE: Your headline\nSUB: Subtitle text\nCTA: SWIPE →`}
        style={{
          width: '100%',
          minHeight: 240,
          backgroundColor: '#111118',
          color: '#F5F5F5',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 4,
          padding: 12,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
          fontSize: 12,
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(106, 198, 112, 0.3)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255,255,255,0.06)';
        }}
      />

      {/* Slide list */}
      {slides.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#9CA3AF',
              marginBottom: 6,
            }}
          >
            {slides.length} slide{slides.length !== 1 ? 's' : ''}
          </div>
          {slides.map((slide, i) => {
            const isSelected = i === selectedSlideIndex;
            const isDragging = i === dragIndex;
            const isDragOver = i === dragOverIndex && dragIndex !== null && dragIndex !== i;

            return (
              <div
                key={i}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, i)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
                onClick={() => onSlideSelect(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  marginBottom: 2,
                  borderRadius: 4,
                  cursor: 'pointer',
                  backgroundColor: isSelected
                    ? 'rgba(106, 198, 112, 0.08)'
                    : 'transparent',
                  borderLeft: isSelected
                    ? '2px solid #6AC670'
                    : '2px solid transparent',
                  opacity: isDragging ? 0.4 : 1,
                  borderTop: isDragOver ? '2px solid #6AC670' : '2px solid transparent',
                  transition: 'background-color 0.15s ease-out',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor =
                      'rgba(255,255,255,0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor =
                      'transparent';
                  }
                }}
              >
                {/* Drag handle */}
                <span
                  style={{
                    color: '#4B5563',
                    fontSize: 10,
                    cursor: 'grab',
                    userSelect: 'none',
                  }}
                >
                  ⠿
                </span>

                {/* Type badge */}
                <span style={BADGE_STYLE}>{slide.type}</span>

                {/* Headline preview */}
                <span
                  style={{
                    fontSize: 12,
                    color: isSelected ? '#F5F5F5' : '#9CA3AF',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {slide.headline || slide.body?.split('\n')[0] || '(no content)'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
