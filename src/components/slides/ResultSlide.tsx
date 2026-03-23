import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';

export default function ResultSlide(props: SlideProps) {
  const { slide, theme, style, dimensions, fontScale } = props;
  const scale = dimensions.width / 1080;
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;
  const isBoldCard = style.id === 'bold-card';
  const isMinimal = style.id === 'minimal-type';

  // Replace bullet markers (✦, •, -, *) at line starts with accent-colored ✦
  const renderBody = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const bulletMatch = line.match(/^[\s]*(✦|•|[-*])\s*/);
      if (bulletMatch) {
        const content = line.slice(bulletMatch[0].length);
        return (
          <div key={i} style={{ display: 'flex', gap: p(8), marginBottom: p(4) }}>
            <span style={{ color: theme.accent }}>✦</span>
            <span>{content}</span>
          </div>
        );
      }
      return (
        <div key={i} style={{ marginBottom: p(4) }}>
          {line}
        </div>
      );
    });
  };

  const content = (
    <>
      {slide.headline && (
        <div
          style={{
            fontSize: s(40),
            fontWeight: 700,
            lineHeight: 1.2,
            color: theme.text,
            marginBottom: p(16),
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
          }}
        >
          {renderBody(slide.body)}
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
