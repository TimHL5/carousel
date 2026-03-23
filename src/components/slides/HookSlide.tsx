import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';

export default function HookSlide(props: SlideProps) {
  const { slide, theme, dimensions, fontScale, contentGap, bodyMaxWidth, headlineScale } = props;
  const scale = dimensions.width / 1080;
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;

  return (
    <SlideLayout {...props}>
      {slide.headline && (
        <div
          style={{
            fontSize: s(56 * headlineScale),
            fontWeight: 700,
            lineHeight: 1.1,
            color: theme.text,
            maxWidth: `${bodyMaxWidth}%`,
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
            maxWidth: '80%',
            marginBottom: p(contentGap),
          }}
        >
          {slide.sub}
        </div>
      )}
      {slide.cta && (
        <div
          style={{
            fontSize: s(18),
            fontWeight: 500,
            color: theme.accent,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          }}
        >
          {slide.cta}
        </div>
      )}
    </SlideLayout>
  );
}
