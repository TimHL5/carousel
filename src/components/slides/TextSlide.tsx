import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';

export default function TextSlide(props: SlideProps) {
  const { slide, theme, style, dimensions, fontScale, contentGap } = props;
  const scale = dimensions.width / 1080;
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;
  const isBoldCard = style.id === 'bold-card';
  const isMinimal = style.id === 'minimal-type';

  const content = (
    <>
      {slide.headline && (
        <div
          style={{
            fontSize: s(40),
            fontWeight: 700,
            lineHeight: 1.2,
            color: theme.text,
            marginBottom: p(contentGap),
          }}
        >
          {slide.headline}
        </div>
      )}
      {slide.body && (
        <div
          style={{
            fontSize: s(24),
            fontWeight: 400,
            lineHeight: 1.5,
            color: isMinimal ? theme.text : theme.secondary,
            whiteSpace: 'pre-line' as const,
          }}
        >
          {slide.body}
        </div>
      )}
    </>
  );

  return (
    <SlideLayout {...props} contentJustify="center">
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
