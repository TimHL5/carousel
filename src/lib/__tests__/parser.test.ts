import { describe, it, expect } from 'vitest';
import { parseCarousel } from '../parser';

describe('parseCarousel', () => {
  // ── Empty / malformed input ──────────────────────────────

  it('returns empty result for empty string', () => {
    const result = parseCarousel('');
    expect(result.title).toBe('');
    expect(result.slides).toHaveLength(0);
  });

  it('returns empty result for whitespace-only input', () => {
    const result = parseCarousel('   \n\n  ');
    expect(result.title).toBe('');
    expect(result.slides).toHaveLength(0);
  });

  it('treats random text as a single [text] slide', () => {
    const result = parseCarousel('Just some random text here.');
    expect(result.slides).toHaveLength(1);
    expect(result.slides[0].type).toBe('text');
    expect(result.slides[0].body).toBe('Just some random text here.');
  });

  // ── Metadata extraction ──────────────────────────────────

  it('extracts TITLE, PILLAR, TYPE from metadata section', () => {
    const input = `TITLE: How to build an app
PILLAR: Build
TYPE: 80% value

---

SLIDE 1 [hook]
HEADLINE: Test headline`;
    const result = parseCarousel(input);
    expect(result.title).toBe('How to build an app');
    expect(result.pillar).toBe('Build');
    expect(result.type).toBe('80% value');
  });

  // ── All 9 slide types ────────────────────────────────────

  it('parses [hook] slide', () => {
    const input = `---\nSLIDE 1 [hook]\nHEADLINE: Big headline\nSUB: Subtitle here\nCTA: SWIPE →`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('hook');
    expect(result.slides[0].headline).toBe('Big headline');
    expect(result.slides[0].sub).toBe('Subtitle here');
    expect(result.slides[0].cta).toBe('SWIPE →');
  });

  it('parses [step] slide with NUM', () => {
    const input = `---\nSLIDE 1 [step]\nNUM: 01\nHEADLINE: Step title\nBODY: Step body text`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('step');
    expect(result.slides[0].num).toBe('01');
    expect(result.slides[0].headline).toBe('Step title');
    expect(result.slides[0].body).toBe('Step body text');
  });

  it('parses [split] slide with LEFT and RIGHT', () => {
    const input = `---\nSLIDE 1 [split]\nHEADLINE: Comparison\nLEFT:\nOLD WAY\nSlow\nRIGHT:\nNEW WAY\nFast`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('split');
    expect(result.slides[0].left).toContain('OLD WAY');
    expect(result.slides[0].right).toContain('NEW WAY');
  });

  it('parses [result] slide', () => {
    const input = `---\nSLIDE 1 [result]\nHEADLINE: Results\nBODY: ✦ Item 1\n✦ Item 2`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('result');
    expect(result.slides[0].body).toContain('✦ Item 1');
  });

  it('parses [concept] slide with LABEL', () => {
    const input = `---\nSLIDE 1 [concept]\nLABEL: Key concept\nHEADLINE: Concept Name\nBODY: Explanation`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('concept');
    expect(result.slides[0].label).toBe('Key concept');
  });

  it('parses [close] slide with LOGO', () => {
    const input = `---\nSLIDE 1 [close]\nHEADLINE: Save this.\nSUB: Follow us.\nLOGO: true`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('close');
    expect(result.slides[0].logo).toBe(true);
  });

  it('parses [close-cta] slide', () => {
    const input = `---\nSLIDE 1 [close-cta]\nHEADLINE: Ready?\nCTA: Join now`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('close-cta');
    expect(result.slides[0].cta).toBe('Join now');
  });

  it('parses [quote] slide', () => {
    const input = `---\nSLIDE 1 [quote]\nHEADLINE: The future is now.\nSUB: Someone Famous`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('quote');
    expect(result.slides[0].sub).toBe('Someone Famous');
  });

  it('parses [text] slide', () => {
    const input = `---\nSLIDE 1 [text]\nHEADLINE: Title\nBODY: Some body text`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('text');
  });

  // ── Edge cases ───────────────────────────────────────────

  it('defaults to [text] when brackets are missing', () => {
    const input = `---\nSLIDE 1\nHEADLINE: No brackets here`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('text');
    expect(result.slides[0].headline).toBe('No brackets here');
  });

  it('defaults to [text] for unrecognized type', () => {
    const input = `---\nSLIDE 1 [unknown]\nHEADLINE: Unknown type`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('text');
  });

  it('handles missing fields gracefully (undefined, not crash)', () => {
    const input = `---\nSLIDE 1 [hook]`;
    const result = parseCarousel(input);
    expect(result.slides[0].type).toBe('hook');
    expect(result.slides[0].headline).toBeUndefined();
    expect(result.slides[0].body).toBeUndefined();
    expect(result.slides[0].cta).toBeUndefined();
  });

  it('preserves multi-line BODY with blank lines', () => {
    const input = `---\nSLIDE 1 [step]\nHEADLINE: Title\nBODY: Line one\n\nLine three\n\nLine five`;
    const result = parseCarousel(input);
    expect(result.slides[0].body).toBe('Line one\n\nLine three\n\nLine five');
  });

  it('handles case insensitivity (headline: vs HEADLINE:)', () => {
    const input = `---\nSLIDE 1 [hook]\nheadline: lowercase field\nsub: also lowercase`;
    const result = parseCarousel(input);
    expect(result.slides[0].headline).toBe('lowercase field');
    expect(result.slides[0].sub).toBe('also lowercase');
  });

  it('handles extra whitespace around fields', () => {
    const input = `---\nSLIDE 1 [hook]\nHEADLINE:   spaced out   \nSUB:  also spaced  `;
    const result = parseCarousel(input);
    expect(result.slides[0].headline).toBe('spaced out');
    expect(result.slides[0].sub).toBe('also spaced');
  });

  it('extracts CAPTION from the last section', () => {
    const input = `TITLE: Test\n\n---\n\nSLIDE 1 [hook]\nHEADLINE: Hello\n\n---\n\nCAPTION:\nThis is the caption text.\n#hashtag`;
    const result = parseCarousel(input);
    expect(result.caption).toContain('This is the caption text.');
    expect(result.caption).toContain('#hashtag');
  });

  it('parses LOGO: yes and LOGO: 1 as true', () => {
    const input1 = `---\nSLIDE 1 [close]\nLOGO: yes`;
    const input2 = `---\nSLIDE 1 [close]\nLOGO: 1`;
    expect(parseCarousel(input1).slides[0].logo).toBe(true);
    expect(parseCarousel(input2).slides[0].logo).toBe(true);
  });

  it('parses LOGO: false and LOGO: no as false', () => {
    const input1 = `---\nSLIDE 1 [close]\nLOGO: false`;
    const input2 = `---\nSLIDE 1 [close]\nLOGO: no`;
    expect(parseCarousel(input1).slides[0].logo).toBe(false);
    expect(parseCarousel(input2).slides[0].logo).toBe(false);
  });

  // ── Multiple slides ──────────────────────────────────────

  it('parses multiple slides in sequence', () => {
    const input = `TITLE: Multi-slide\n\n---\n\nSLIDE 1 [hook]\nHEADLINE: First\n\n---\n\nSLIDE 2 [step]\nHEADLINE: Second\nBODY: Body text\n\n---\n\nSLIDE 3 [close]\nHEADLINE: Last`;
    const result = parseCarousel(input);
    expect(result.slides).toHaveLength(3);
    expect(result.slides[0].type).toBe('hook');
    expect(result.slides[1].type).toBe('step');
    expect(result.slides[2].type).toBe('close');
  });

  // ── Full sample carousel from MASTER_PROMPT.md ──────────

  it('parses the full sample carousel correctly', () => {
    const input = `TITLE: How to build an app in a weekend using Claude
PILLAR: Build
TYPE: 80% value

---

SLIDE 1 [hook]
HEADLINE: You don't need to learn to code to build an app.
SUB: Here's how to ship a product this weekend.
CTA: SWIPE →

---

SLIDE 2 [split]
HEADLINE: The old way vs. the new way
LEFT:
OLD WAY

Learn Python — 6 months
Learn a framework — 3 months
Build — 3 months
Ship — 1 year later
RIGHT:
NEW WAY

Open Claude
Describe what you want
Copy the code
Ship — this weekend

---

SLIDE 3 [step]
NUM: 01
HEADLINE: Define the problem
BODY: Don't start with "I want to build an app."

Start with: "What's a problem I see every day?"

Example: My friends and I can never decide where to eat. I want to build a random restaurant picker for my city.

---

SLIDE 4 [step]
NUM: 02
HEADLINE: Write the prompt
BODY: Tell Claude exactly what you want. Be specific.

"Build me a web app where users enter their city, cuisine preference, and budget. The app returns 3 random restaurant suggestions using a clean, mobile-friendly UI."

---

SLIDE 5 [step]
NUM: 03
HEADLINE: Deploy it
BODY: Use Vercel, Netlify, or Replit to put it live in 5 minutes.

Your app now has a real URL.
Anyone in the world can use it.

You just shipped a product.

---

SLIDE 6 [step]
NUM: 04
HEADLINE: Share it
BODY: Post it in your school group chat.
Send it to 10 friends.

Ask: would you use this?

You just did customer discovery without even knowing the term.

---

SLIDE 7 [result]
HEADLINE: What you now have
BODY: ✦ A live product
✦ Real user feedback
✦ A story for your college apps

All in one weekend.
No coding bootcamp required.

---

SLIDE 8 [close]
HEADLINE: Save this. Try it this weekend.
SUB: Follow @mlvignite for more.
LOGO: true

---

CAPTION:
Most students think they need to spend 6 months learning to code before they can build anything. In 2026 that's like saying you need to learn to use a printing press before you can write a book.

Claude is the printing press. Your ideas are the book.

Try this weekend and DM me what you built.
Save this post — you'll want it later.

#MLV #BuildDontPrepare #StudentFounder #AI #Claude`;

    const result = parseCarousel(input);

    expect(result.title).toBe('How to build an app in a weekend using Claude');
    expect(result.pillar).toBe('Build');
    expect(result.type).toBe('80% value');
    expect(result.slides).toHaveLength(8);

    expect(result.slides[0].type).toBe('hook');
    expect(result.slides[0].headline).toBe("You don't need to learn to code to build an app.");
    expect(result.slides[0].cta).toBe('SWIPE →');

    expect(result.slides[1].type).toBe('split');
    expect(result.slides[1].left).toContain('OLD WAY');
    expect(result.slides[1].right).toContain('NEW WAY');

    expect(result.slides[2].type).toBe('step');
    expect(result.slides[2].num).toBe('01');

    expect(result.slides[6].type).toBe('result');
    expect(result.slides[6].body).toContain('✦ A live product');

    expect(result.slides[7].type).toBe('close');
    expect(result.slides[7].logo).toBe(true);

    expect(result.caption).toContain('Claude is the printing press');
    expect(result.caption).toContain('#MLV');
  });
});
