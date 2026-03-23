import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';

export default function CloseSlide(props: SlideProps) {
  const { slide, theme, style, dimensions, fontScale, contentGap, headlineScale } = props;
  const scale = dimensions.width / 1080;
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;
  const isBoldCard = style.id === 'bold-card';

  const content = (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
      {slide.headline && (
        <div
          style={{
            fontSize: s(40 * headlineScale),
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
      {(slide.logo || props.showLogo) && (
        <div
          style={{
            fontSize: s(14),
            fontWeight: 500,
            color: theme.accent,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
          }}
        >
          MLV
        </div>
      )}
    </div>
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
