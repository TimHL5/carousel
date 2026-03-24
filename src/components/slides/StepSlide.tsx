import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';
import ElementWrapper from '@/components/editor/ElementWrapper';

export default function StepSlide(props: SlideProps) {
  const { slide, theme, style, dimensions, fontScale, contentGap, accentBarWidth, contentPadding, bodyLineHeight, bodyMaxWidth, headlineScale, contentAlign, editMode, selectedElementId, onElementSelect, previewScale, onOverrideCommit, onOverrideRemove, slideIndex, editingElementId, onTextCommit, onEditingChange } = props;
    const scale = dimensions.width / 1080;
const getOverride = (id: string) => slide.overrides?.find((o) => o.id === id);
  const editorProps = { editMode, scale, previewScale: previewScale || 1, slideIndex, onSelect: onElementSelect, onOverrideCommit, onOverrideRemove, editingElementId, onTextCommit, onEditingChange };
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;
  const num = slide.num || String(props.slideIndex + 1).padStart(2, '0');
  const isBoldCard = style.id === 'bold-card';
  const isMinimal = style.id === 'minimal-type';
  const centered = contentAlign === 'center';

  const content = (
    <>
      {/* Background step number — clean-step only */}
      {!isBoldCard && !isMinimal && (
        <div
          style={{
            position: 'absolute',
            top: p(contentPadding),
            left: p(contentPadding),
            fontSize: s(160),
            fontWeight: 700,
            lineHeight: 1,
            color: theme.accent,
            opacity: 0.08,
            zIndex: 1,
            pointerEvents: 'none' as const,
          }}
        >
          {num}
        </div>
      )}

      {/* Bold Card: pill badge */}
      {isBoldCard && (
        <div
          style={{
            display: 'inline-block',
            backgroundColor: theme.accent,
            color: theme.bg,
            fontSize: s(14),
            fontWeight: 600,
            padding: `${p(4)}px ${p(12)}px`,
            borderRadius: 9999,
            marginBottom: p(16),
          }}
        >
          {num}
        </div>
      )}

      {/* Step label — clean-step only */}
      {!isBoldCard && !isMinimal && (
        <div
          style={{
            fontSize: s(20),
            fontWeight: 500,
            color: theme.accent,
            marginBottom: p(contentGap / 2),
            position: 'relative',
            zIndex: 2,
          }}
        >
          Step {num}
        </div>
      )}

      {slide.headline && (
        <ElementWrapper elementId="headline" isSelected={selectedElementId === 'headline'} override={getOverride('headline')} textField="headline" {...editorProps} style={{
            fontSize: s(40 * headlineScale), fontWeight: 700, lineHeight: 1.2, color: theme.text,
            marginBottom: p(contentGap / 2), position: 'relative', zIndex: 2,
          }}>
          {slide.headline}
        </ElementWrapper>
      )}

      {slide.body && (
        <ElementWrapper elementId="body" isSelected={selectedElementId === 'body'} override={getOverride('body')} textField="body" {...editorProps} style={{
            fontSize: s(24), fontWeight: 400, lineHeight: bodyLineHeight,
            color: isMinimal ? theme.text : theme.secondary, maxWidth: `${bodyMaxWidth}%`,
            ...(centered && { margin: '0 auto' }), whiteSpace: 'pre-line' as const, position: 'relative', zIndex: 2,
          }}>
          {slide.body}
        </ElementWrapper>
      )}
    </>
  );

  return (
    <SlideLayout {...props} contentJustify="center">
      {/* Accent bar — clean-step only */}
      {!isBoldCard && !isMinimal && accentBarWidth > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '15%',
            bottom: '15%',
            width: p(accentBarWidth),
            backgroundColor: theme.accent,
            zIndex: 2,
          }}
        />
      )}

      {isBoldCard ? (
        <div
          style={{
            backgroundColor: theme.card,
            borderRadius: p(12),
            padding: p(24),
            border: `1px solid rgba(255,255,255,0.06)`,
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
