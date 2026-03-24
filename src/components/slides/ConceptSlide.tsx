import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';
import ElementWrapper from '@/components/editor/ElementWrapper';

export default function ConceptSlide(props: SlideProps) {
  const { slide, theme, style, dimensions, fontScale, contentGap, bodyLineHeight, bodyMaxWidth, headlineScale, editMode, selectedElementId, onElementSelect, previewScale, onOverrideCommit, onOverrideRemove, slideIndex, editingElementId, onTextCommit, onEditingChange } = props;
    const scale = dimensions.width / 1080;
const getOverride = (id: string) => slide.overrides?.find((o) => o.id === id);
  const editorProps = { editMode, scale, previewScale: previewScale || 1, slideIndex, onSelect: onElementSelect, onOverrideCommit, onOverrideRemove, editingElementId, onTextCommit, onEditingChange };
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;
  const isBoldCard = style.id === 'bold-card';
  const isMinimal = style.id === 'minimal-type';

  const content = (
    <>
      {slide.label && !isMinimal && (
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
          {slide.label}
        </div>
      )}
      {slide.headline && (
        <ElementWrapper elementId="headline" isSelected={selectedElementId === 'headline'} override={getOverride('headline')} textField="headline" {...editorProps} style={{
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
