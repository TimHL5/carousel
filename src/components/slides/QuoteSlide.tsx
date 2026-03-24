import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';
import ElementWrapper from '@/components/editor/ElementWrapper';

export default function QuoteSlide(props: SlideProps) {
  const { slide, theme, style, dimensions, fontScale, accentBarWidth, contentGap, headlineScale, editMode, selectedElementId, onElementSelect, previewScale, onOverrideCommit, onOverrideRemove, slideIndex } = props;
    const scale = dimensions.width / 1080;
const getOverride = (id: string) => slide.overrides?.find((o) => o.id === id);
  const editorProps = { editMode, scale, previewScale: previewScale || 1, slideIndex, onSelect: onElementSelect, onOverrideCommit, onOverrideRemove };
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;
  const isBoldCard = style.id === 'bold-card';
  const isMinimal = style.id === 'minimal-type';

  const quoteContent = (
    <div style={{ display: 'flex', gap: p(contentGap * 0.67) }}>
      {/* Accent bar for quote — clean-step and bold-card */}
      {!isMinimal && accentBarWidth > 0 && (
        <div
          style={{
            width: p(accentBarWidth),
            backgroundColor: theme.accent,
            borderRadius: p(2),
            flexShrink: 0,
          }}
        />
      )}
      <div>
        {slide.headline && (
          <ElementWrapper elementId="quote-text" isSelected={selectedElementId === 'quote-text'} override={getOverride('quote-text')} {...editorProps} style={{
              fontSize: s(40 * headlineScale), fontWeight: 700, lineHeight: 1.2, color: theme.text, marginBottom: p(contentGap),
            }}>
            {slide.headline}
          </ElementWrapper>
        )}
        {slide.sub && (
          <div
            style={{
              fontSize: s(20),
              fontWeight: 400,
              lineHeight: 1.4,
              color: theme.secondary,
            }}
          >
            — {slide.sub}
          </div>
        )}
      </div>
    </div>
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
          {quoteContent}
        </div>
      ) : (
        quoteContent
      )}
    </SlideLayout>
  );
}
