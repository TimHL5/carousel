import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';

export default function CloseCTASlide(props: SlideProps) {
  const { slide, theme, style, dimensions, fontScale, contentGap } = props;
  const scale = dimensions.width / 1080;
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;
  const isBoldCard = style.id === 'bold-card';

  const content = (
    <>
      {slide.headline && (
        <div
          style={{
            fontSize: s(40),
            fontWeight: 700,
            lineHeight: 1.2,
            color: theme.text,
            marginBottom: p(contentGap / 2),
          }}
        >
          {slide.headline}
        </div>
      )}
      {slide.sub && (
        <div
          style={{
            fontSize: s(20),
            fontWeight: 400,
            lineHeight: 1.4,
            color: theme.secondary,
            marginBottom: p(contentGap),
          }}
        >
          {slide.sub}
        </div>
      )}
      {slide.cta && (
        <div
          style={{
            display: 'inline-block',
            backgroundColor: theme.accent,
            color: theme.bg,
            fontSize: s(18),
            fontWeight: 500,
            padding: `${p(16)}px ${p(32)}px`,
            borderRadius: 9999,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          }}
        >
          {slide.cta}
        </div>
      )}
      {(slide.logo || props.showLogo) && (
        <div
          style={{
            fontSize: s(14),
            fontWeight: 500,
            color: theme.accent,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
            marginTop: p(contentGap),
          }}
        >
          MLV
        </div>
      )}
    </>
  );

  return (
    <SlideLayout {...props} showLogo={false} contentJustify="flex-end">
      {isBoldCard ? (
        <div
          style={{
            backgroundColor: theme.card,
            borderRadius: p(12),
            padding: p(24),
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {content}
        </div>
      ) : (
        content
      )}
    </SlideLayout>
  );
}
