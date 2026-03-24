import type { CarouselData } from '@/types/carousel';

/**
 * Serialize CarouselData back to the SLIDE N [type] / FIELD: text format.
 * Inverse of parseCarousel() — used when inline text edits update SlideData
 * and the textarea needs to reflect the change.
 */
export function serializeCarousel(data: CarouselData): string {
  const parts: string[] = [];

  // Metadata section
  if (data.title) parts.push(`TITLE: ${data.title}`);
  if (data.pillar) parts.push(`PILLAR: ${data.pillar}`);
  if (data.type) parts.push(`TYPE: ${data.type}`);

  if (parts.length > 0) {
    parts.push('');
    parts.push('---');
    parts.push('');
  }

  // Slides
  data.slides.forEach((slide, i) => {
    parts.push(`SLIDE ${i + 1} [${slide.type}]`);
    if (slide.num !== undefined) parts.push(`NUM: ${slide.num}`);
    if (slide.label) parts.push(`LABEL: ${slide.label}`);
    if (slide.headline) parts.push(`HEADLINE: ${slide.headline}`);
    if (slide.sub) parts.push(`SUB: ${slide.sub}`);
    if (slide.body) parts.push(`BODY: ${slide.body}`);
    if (slide.cta) parts.push(`CTA: ${slide.cta}`);
    if (slide.left) parts.push(`LEFT: ${slide.left}`);
    if (slide.right) parts.push(`RIGHT: ${slide.right}`);
    if (slide.logo) parts.push(`LOGO: true`);
    parts.push('');
    parts.push('---');
    parts.push('');
  });

  // Caption
  if (data.caption) {
    parts.push(`CAPTION:`);
    parts.push(data.caption);
  }

  return parts.join('\n').trim();
}
