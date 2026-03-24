import type { CarouselData } from '@/types/carousel';

const FIELD_NAMES = [
  'HEADLINE', 'SUB', 'BODY', 'CTA', 'NUM', 'LABEL', 'LEFT', 'RIGHT', 'LOGO',
  'TITLE', 'PILLAR', 'TYPE', 'SLIDE', 'CAPTION',
];
const FIELD_START_RE = new RegExp(`^(${FIELD_NAMES.join('|')})\\s*:`, 'i');
const SEPARATOR_RE = /^---+\s*$/;

/** Escape lines in multiline text that could be misinterpreted by the parser */
function escapeFieldText(text: string): string {
  return text.split('\n').map(line => {
    if (FIELD_START_RE.test(line) || SEPARATOR_RE.test(line)) {
      return ' ' + line; // indent by one space to break the pattern
    }
    return line;
  }).join('\n');
}

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
    if (slide.body) parts.push(`BODY: ${escapeFieldText(slide.body)}`);
    if (slide.cta) parts.push(`CTA: ${slide.cta}`);
    if (slide.left) parts.push(`LEFT: ${escapeFieldText(slide.left)}`);
    if (slide.right) parts.push(`RIGHT: ${escapeFieldText(slide.right)}`);
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
