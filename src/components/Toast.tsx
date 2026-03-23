'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  accent?: string;
  onDismiss: () => void;
  duration?: number; // 0 = persist until dismissed
}

export default function Toast({ message, accent = '#6AC670', onDismiss, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 150); // wait for fade-out
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : 8}px)`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
        backgroundColor: '#111118',
        color: '#F5F5F5',
        fontSize: 13,
        fontWeight: 500,
        padding: '10px 16px',
        borderRadius: 4,
        borderLeft: `4px solid ${accent}`,
        zIndex: 1000,
        pointerEvents: 'auto',
        maxWidth: 400,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>{message}</span>
        {duration === 0 && (
          <button
            onClick={() => { setVisible(false); setTimeout(onDismiss, 150); }}
            style={{
              background: 'none', border: 'none', color: '#9CA3AF',
              cursor: 'pointer', fontSize: 14, padding: '0 4px',
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
