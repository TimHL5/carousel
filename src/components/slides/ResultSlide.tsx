import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';
import ElementWrapper from '@/components/editor/ElementWrapper';

export default function ResultSlide(props: SlideProps) {
  const { slide, theme, style, dimensions, fontScale, contentGap, bodyLineHeight, bodyMaxWidth, headlineScale, editMode, selectedElementId, onElementSelect, previewScale, onOverrideCommit, onOverrideRemove, slideIndex } = props;
    const scale = dimensions.width / 1080;
const getOverride = (id: string) => slide.overrides?.find((o) => o.id === id);
  const editorProps = { editMode, scale, previewScale: previewScale || 1, slideIndex, onSelect: onElementSelect, onOverrideCommit, onOverrideRemove };
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
        <ElementWrapper elementId="headline" isSelected={selectedElementId === 'headline'} override={getOverride('headline')} {...editorProps} style={{
            fontSize: s(40 * headlineScale), fontWeight: 700, lineHeight: 1.2, color: theme.text, marginBottom: p(contentGap),
          }}>
          {slide.headline}
        </ElementWrapper>
      )}
      {slide.body && (
        <div
          style={{
            fontSize: s(24),
            fontWeight: 400,
            lineHeight: bodyLineHeight,
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
