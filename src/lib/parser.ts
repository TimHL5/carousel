import type { CarouselData, SlideData, SlideType } from '@/types/carousel';

const VALID_TYPES: SlideType[] = [
  'hook', 'step', 'split', 'result', 'concept', 'close', 'close-cta', 'quote', 'text',
];

const FIELD_NAMES = [
  'HEADLINE', 'SUB', 'BODY', 'CTA', 'NUM', 'LABEL', 'LEFT', 'RIGHT', 'LOGO',
  'TITLE', 'PILLAR', 'TYPE', 'SLIDE', 'CAPTION',
];

// Match a field label at the start of a line (case-insensitive)
const FIELD_REGEX = new RegExp(
  `^(${FIELD_NAMES.join('|')})\\s*:`,
  'i',
);

// Parse slide type from "SLIDE N [type]" line
function parseSlideType(line: string): SlideType {
  const match = line.match(/\[([^\]]+)\]/);
  if (!match) return 'text';
  const type = match[1].toLowerCase().trim() as SlideType;
  return VALID_TYPES.includes(type) ? type : 'text';
}

// Parse fields from lines into a key-value map
// Multi-line values continue until the next UPPERCASE field or end
function parseFields(lines: string[]): Record<string, string> {
  const fields: Record<string, string> = {};
  let currentField: string | null = null;
  let currentValue: string[] = [];

  for (const line of lines) {
    const fieldMatch = line.match(FIELD_REGEX);
    if (fieldMatch) {
      // Save previous field
      if (currentField) {
        fields[currentField] = currentValue.join('\n').trim();
      }
      currentField = fieldMatch[1].toUpperCase();
      const valueAfterColon = line.slice(fieldMatch[0].length).trim();
      currentValue = valueAfterColon ? [valueAfterColon] : [];
    } else if (currentField) {
      currentValue.push(line);
    }
  }

  // Save last field
  if (currentField) {
    fields[currentField] = currentValue.join('\n').trim();
  }

  return fields;
}

// Convert fields map to SlideData
function fieldsToSlideData(fields: Record<string, string>, type: SlideType): SlideData {
  const slide: SlideData = { type };

  if (fields.HEADLINE) slide.headline = fields.HEADLINE;
  if (fields.SUB) slide.sub = fields.SUB;
  if (fields.BODY) slide.body = fields.BODY;
  if (fields.CTA) slide.cta = fields.CTA;
  if (fields.NUM) slide.num = fields.NUM;
  if (fields.LABEL) slide.label = fields.LABEL;
  if (fields.LEFT) slide.left = fields.LEFT;
  if (fields.RIGHT) slide.right = fields.RIGHT;
  if (fields.LOGO) {
    const val = fields.LOGO.toLowerCase().trim();
    slide.logo = val === 'true' || val === 'yes' || val === '1';
  }

  return slide;
}

/**
 * Parse structured text into CarouselData.
 * Never throws — malformed input falls back gracefully.
 */
export function parseCarousel(text: string): CarouselData {
  if (!text || !text.trim()) {
    return { title: '', slides: [], caption: '' };
  }

  // Split on --- separator lines
  const sections = text.split(/^---+\s*$/m);

  // Find metadata (first section before any SLIDE line)
  // Find caption (last section starting with CAPTION:)
  // Everything else is slides

  let title = '';
  let pillar: string | undefined;
  let type: string | undefined;
  let caption: string | undefined;
  const slides: SlideData[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n');
    const trimmedLines = lines.map((l) => l.trimEnd());

    // Check if this section is a CAPTION section
    const firstNonEmpty = trimmedLines.find((l) => l.trim().length > 0);
    if (firstNonEmpty && /^CAPTION\s*:/i.test(firstNonEmpty)) {
      const captionLines = trimmedLines.slice(
        trimmedLines.indexOf(firstNonEmpty),
      );
      const captionText = captionLines
        .join('\n')
        .replace(/^CAPTION\s*:\s*/i, '')
        .trim();
      caption = captionText;
      continue;
    }

    // Check if this section contains a SLIDE line
    const slideLineIdx = trimmedLines.findIndex((l) =>
      /^\s*SLIDE\s+\d*/i.test(l),
    );

    if (slideLineIdx >= 0) {
      // This is a slide section
      const slideLine = trimmedLines[slideLineIdx];
      const slideType = parseSlideType(slideLine);
      const fieldLines = trimmedLines.slice(slideLineIdx + 1);
      const fields = parseFields(fieldLines);
      slides.push(fieldsToSlideData(fields, slideType));
    } else if (i === 0) {
      // First section with no SLIDE line — treat as metadata
      const fields = parseFields(trimmedLines);
      if (fields.TITLE) title = fields.TITLE;
      if (fields.PILLAR) pillar = fields.PILLAR;
      if (fields.TYPE) type = fields.TYPE;
    } else {
      // Non-slide, non-metadata, non-caption section
      // Check if it has field-like content → treat as a [text] slide
      const content = section.trim();
      if (content) {
        const fields = parseFields(trimmedLines);
        if (fields.HEADLINE || fields.BODY) {
          slides.push(fieldsToSlideData(fields, 'text'));
        }
        // If no recognizable fields, skip the section (might be blank)
      }
    }
  }

  // If no slides found but there's content, make a single [text] slide
  if (slides.length === 0 && text.trim()) {
    slides.push({ type: 'text', body: text.trim() });
  }

  // Cap at 50 slides to prevent browser tab crashes on huge inputs
  const cappedSlides = slides.slice(0, 50);

  const result: CarouselData = { title, slides: cappedSlides };
  if (pillar) result.pillar = pillar;
  if (type) result.type = type;
  if (caption !== undefined) result.caption = caption;

  return result;
}
