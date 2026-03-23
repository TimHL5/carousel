import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';

export default function SplitSlide(props: SlideProps) {
  const { slide, theme, style, dimensions, fontScale, contentGap } = props;
  const scale = dimensions.width / 1080;
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;
  const isBoldCard = style.id === 'bold-card';

  // Parse left/right content — split on first line as header if it's short and uppercase-ish
  const parseColumn = (text?: string) => {
    if (!text) return { header: undefined, body: '' };
    const lines = text.trim().split('\n');
    const firstLine = lines[0]?.trim() || '';
    // If first line is short and looks like a header (all caps or very short), treat it as header
    if (firstLine.length < 20 && firstLine === firstLine.toUpperCase() && lines.length > 1) {
      return { header: firstLine, body: lines.slice(1).join('\n').trim() };
    }
    return { header: undefined, body: text.trim() };
  };

  const left = parseColumn(slide.left);
  const right = parseColumn(slide.right);

  const columnContent = (
    <div style={{ display: 'flex', gap: p(contentGap), flex: 1 }}>
      {/* Left column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const }}>
        {left.header && (
          <div
            style={{
              fontSize: s(14),
              fontWeight: 500,
              color: theme.accent,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              marginBottom: p(contentGap / 2),
            }}
          >
            {left.header}
          </div>
        )}
        <div
          style={{
            fontSize: s(20),
            fontWeight: 400,
            lineHeight: 1.5,
            color: theme.secondary,
            whiteSpace: 'pre-line' as const,
          }}
        >
          {left.body}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          backgroundColor: `${theme.text}10`,
          alignSelf: 'stretch',
        }}
      />

      {/* Right column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const }}>
        {right.header && (
          <div
            style={{
              fontSize: s(14),
              fontWeight: 500,
              color: theme.accent,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              marginBottom: p(contentGap / 2),
            }}
          >
            {right.header}
          </div>
        )}
        <div
          style={{
            fontSize: s(20),
            fontWeight: 400,
            lineHeight: 1.5,
            color: theme.secondary,
            whiteSpace: 'pre-line' as const,
          }}
        >
          {right.body}
        </div>
      </div>
    </div>
  );

  return (
    <SlideLayout {...props} contentJustify="center">
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

      {isBoldCard ? (
        <div
          style={{
            backgroundColor: theme.card,
            borderRadius: p(12),
            padding: p(24),
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column' as const,
          }}
        >
          {columnContent}
        </div>
      ) : (
        columnContent
      )}
    </SlideLayout>
  );
}
