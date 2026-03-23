import type { SlideProps } from '@/types/carousel';
import SlideLayout from './SlideLayout';
import ElementWrapper from '@/components/editor/ElementWrapper';

export default function HookSlide(props: SlideProps) {
  const { slide, theme, dimensions, fontScale, contentGap, contentPadding, bodyMaxWidth, headlineScale, contentAlign, editMode, selectedElementId, onElementSelect } = props;
  const scale = dimensions.width / 1080;
  const p = (px: number) => px * scale;
  const s = (px: number) => px * scale * fontScale;
  const centered = contentAlign === 'center';

  const getOverride = (id: string) => slide.overrides?.find((o) => o.id === id);

  return (
    <SlideLayout {...props}>
      {slide.headline && (
        <ElementWrapper
          elementId="headline"
          editMode={editMode}
          isSelected={selectedElementId === 'headline'}
          override={getOverride('headline')}
          scale={scale}
          onSelect={onElementSelect}
          style={{
            fontSize: s(56 * headlineScale),
            fontWeight: 700,
            lineHeight: 1.1,
            color: theme.text,
            maxWidth: `${bodyMaxWidth}%`,
            marginBottom: p(contentGap / 2),
            ...(centered && { margin: `0 auto ${p(contentGap / 2)}px auto` }),
          }}
        >
          {slide.headline}
        </ElementWrapper>
      )}
      {slide.sub && (
        <ElementWrapper
          elementId="sub"
          editMode={editMode}
          isSelected={selectedElementId === 'sub'}
          override={getOverride('sub')}
          scale={scale}
          onSelect={onElementSelect}
          style={{
            fontSize: s(20),
            fontWeight: 400,
            lineHeight: 1.4,
            color: theme.secondary,
            maxWidth: '80%',
            marginBottom: p(contentGap),
            ...(centered && { margin: `0 auto ${p(contentGap)}px auto` }),
          }}
        >
          {slide.sub}
        </ElementWrapper>
      )}
      {/* CTA: positioned bottom-right, outside text flow */}
      {slide.cta && (
        <ElementWrapper
          elementId="cta"
          editMode={editMode}
          isSelected={selectedElementId === 'cta'}
          override={getOverride('cta')}
          scale={scale}
          onSelect={onElementSelect}
          style={{
            position: 'absolute',
            bottom: p(contentPadding),
            right: p(contentPadding),
            fontSize: s(18),
            fontWeight: 500,
            color: theme.accent,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            zIndex: 3,
          }}
        >
          {slide.cta}
        </ElementWrapper>
      )}
    </SlideLayout>
  );
}
