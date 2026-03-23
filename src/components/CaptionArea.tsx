'use client';

import { useState, useCallback } from 'react';

interface CaptionAreaProps {
  caption: string;
  onCaptionChange: (caption: string) => void;
}

export default function CaptionArea({ caption, onCaptionChange }: CaptionAreaProps) {
  const [copyLabel, setCopyLabel] = useState('Copy Caption');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(caption).then(() => {
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy Caption'), 2000);
    }).catch(() => {
      setCopyLabel('Copy failed');
      setTimeout(() => setCopyLabel('Copy Caption'), 2000);
    });
  }, [caption]);

  return (
    <div
      role="region"
      aria-label="Caption"
      style={{
        padding: '12px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <textarea
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Your caption will appear here..."
        style={{
          flex: 1,
          fontSize: 12,
          color: '#F5F5F5',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          minHeight: 40,
          maxHeight: 120,
          fontFamily: 'inherit',
          lineHeight: 1.5,
        }}
      />
      <button
        onClick={handleCopy}
        disabled={!caption}
        style={{
          padding: '6px 12px',
          backgroundColor: 'transparent',
          color: copyLabel === 'Copied!' ? '#6AC670' : '#F5F5F5',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 500,
          cursor: caption ? 'pointer' : 'default',
          fontFamily: 'inherit',
          flexShrink: 0,
          opacity: caption ? 1 : 0.4,
          transition: 'color 0.15s ease-out',
        }}
      >
        {copyLabel}
      </button>
    </div>
  );
}
