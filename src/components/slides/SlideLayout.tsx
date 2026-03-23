import type { SlideProps } from '@/types/carousel';

interface SlideLayoutProps extends SlideProps {
  children: React.ReactNode;
  contentJustify?: 'center' | 'flex-end' | 'flex-start';
}

export default function SlideLayout({
  children,
  slideIndex,
  totalSlides,
  theme,
  style,
  dimensions,
  showLogo,
  fontScale,
  contentPadding,
  contentGap,
  contentAlign,
  contentJustify = 'center',
}: SlideLayoutProps) {
  const scale = dimensions.width / 1080;
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;

  return (
    <div
      style={{
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Bold Card: slide counter top-right */}
      {style.id === 'bold-card' && (
        <div
          style={{
            position: 'absolute',
            top: p(20),
            right: p(20),
            fontSize: s(14),
            fontWeight: 500,
            color: theme.secondary,
            zIndex: 3,
          }}
        >
          {String(slideIndex + 1).padStart(2, '0')}/{String(totalSlides).padStart(2, '0')}
        </div>
      )}

      {/* Content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: contentJustify,
          padding: p(contentPadding),
          position: 'relative',
          zIndex: 2,
          textAlign: contentAlign,
        }}
      >
        {children}
      </div>

      {/* Logo */}
      {showLogo && (
        <div
          style={{
            position: 'absolute',
            bottom: p(contentPadding),
            right: p(contentPadding),
            fontSize: s(14),
            fontWeight: 500,
            color: theme.accent,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
            zIndex: 3,
          }}
        >
          MLV
        </div>
      )}

      {/* Progress indicator */}
      {style.id === 'clean-step' && (
        <div
          style={{
            display: 'flex',
            gap: p(6),
            justifyContent: 'center',
            paddingBottom: p(32),
            position: 'relative',
            zIndex: 2,
          }}
        >
          {Array.from({ length: totalSlides }, (_, i) => (
            <div
              key={i}
              style={{
                width: p(6),
                height: p(6),
                borderRadius: '50%',
                backgroundColor: i === slideIndex ? theme.accent : `${theme.text}33`,
              }}
            />
          ))}
        </div>
      )}

      {style.id === 'minimal-type' && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: p(2),
            backgroundColor: `${theme.text}1A`,
            zIndex: 2,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((slideIndex + 1) / totalSlides) * 100}%`,
              backgroundColor: theme.accent,
            }}
          />
        </div>
      )}
    </div>
  );
}
