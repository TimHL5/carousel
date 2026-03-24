import { describe, it, expect } from 'vitest';
import { serializeCarousel } from '../serializer';
import { parseCarousel } from '../parser';
import type { CarouselData } from '@/types/carousel';

describe('serializeCarousel', () => {
  it('serializes a simple carousel and parses it back', () => {
    const data: CarouselData = {
      title: 'Test Carousel',
      slides: [
        { type: 'hook', headline: 'Hello World', sub: 'A subtitle', cta: 'SWIPE' },
        { type: 'step', headline: 'Step one', body: 'Do the thing', num: '01' },
      ],
      caption: 'A test caption',
    };

    const text = serializeCarousel(data);
    const parsed = parseCarousel(text);

    expect(parsed.title).toBe('Test Carousel');
    expect(parsed.slides).toHaveLength(2);
    expect(parsed.slides[0].type).toBe('hook');
    expect(parsed.slides[0].headline).toBe('Hello World');
    expect(parsed.slides[0].sub).toBe('A subtitle');
    expect(parsed.slides[0].cta).toBe('SWIPE');
    expect(parsed.slides[1].type).toBe('step');
    expect(parsed.slides[1].headline).toBe('Step one');
    expect(parsed.slides[1].body).toBe('Do the thing');
    expect(parsed.slides[1].num).toBe('01');
    expect(parsed.caption).toBe('A test caption');
  });

  it('handles multi-line body text', () => {
    const data: CarouselData = {
      title: '',
      slides: [
        { type: 'step', headline: 'Title', body: 'Line one\nLine two\nLine three' },
      ],
    };

    const text = serializeCarousel(data);
    const parsed = parseCarousel(text);

    expect(parsed.slides[0].body).toBe('Line one\nLine two\nLine three');
  });

  it('handles split slide with left/right columns', () => {
    const data: CarouselData = {
      title: '',
      slides: [
        { type: 'split', headline: 'Compare', left: 'Old way', right: 'New way' },
      ],
    };

    const text = serializeCarousel(data);
    const parsed = parseCarousel(text);

    expect(parsed.slides[0].type).toBe('split');
    expect(parsed.slides[0].left).toBe('Old way');
    expect(parsed.slides[0].right).toBe('New way');
  });

  it('preserves metadata (pillar, type)', () => {
    const data: CarouselData = {
      title: 'My Carousel',
      pillar: 'Build',
      type: '80% value',
      slides: [{ type: 'hook', headline: 'Hook' }],
    };

    const text = serializeCarousel(data);
    const parsed = parseCarousel(text);

    expect(parsed.title).toBe('My Carousel');
    expect(parsed.pillar).toBe('Build');
    expect(parsed.type).toBe('80% value');
  });

  it('handles empty fields gracefully', () => {
    const data: CarouselData = {
      title: '',
      slides: [{ type: 'text' }],
    };

    const text = serializeCarousel(data);
    expect(text).toContain('SLIDE 1 [text]');
  });
});
