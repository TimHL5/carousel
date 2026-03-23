# BUILD PROMPT: MLV Carousel Generator

Phase 0 (Think + Design) is complete. All reviews passed. You are ready to build.

## Source of Truth — Read These First

| File | What it contains | Read before |
|------|-----------------|-------------|
| CLAUDE.md | Project constraints, tech stack, architecture, gstack workflow | Everything |
| DESIGN.md | Product spec, parser grammar, build phase sequence, error handling | Parser + UI work |
| DESIGN_SYSTEM.md | Complete visual spec: typography scale, spacing, colors, all 9 slide types, all 3 style variants, app UI spec, interaction states, accessibility | Every visual decision |
| CEO_REVIEW.md | Scope decisions: 5 accepted expansions with acceptance criteria and phase assignments | Before starting each phase |

**DESIGN.md's phase sequence is the canonical build order.** CLAUDE.md's workflow section references it.

**DESIGN_SYSTEM.md is the visual source of truth.** Every font size, color value, spacing token, and layout decision comes from there. Do not deviate. In `/design-review` and `/qa`, flag any code that doesn't match DESIGN_SYSTEM.md.

---

## BUILD ORDER

### Phase 1: Data Layer Foundation

**Build these files:**
- `src/types/carousel.ts` — All TypeScript types

```typescript
// Core types to define:
type SlideType = 'hook' | 'step' | 'split' | 'result' | 'concept' | 'close' | 'close-cta' | 'quote' | 'text';

interface SlideData {
  type: SlideType;
  headline?: string;
  sub?: string;
  body?: string;
  cta?: string;
  num?: string;
  label?: string;
  left?: string;
  right?: string;
  logo?: boolean;
}

interface CarouselData {
  title: string;
  pillar?: string;
  type?: string;
  slides: SlideData[];
  caption?: string;
}

interface Theme {
  id: string;
  name: string;
  bg: string;
  text: string;
  accent: string;
  secondary: string;
  card: string;
}

interface StyleVariant {
  id: string;
  name: string;
  description: string;
}

interface ExportPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  platform: string;
}

// CEO Review addition: HistoryState wrapper for undo/redo (wired in Phase 5)
interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

// CarouselState: single object holding all app state (backend-ready — all serializable JSON)
interface CarouselState {
  rawText: string;
  carousel: CarouselData | null;
  selectedSlideIndex: number;
  selectedThemeId: string;
  selectedStyleId: string;
  selectedPresetId: string;
  showLogo: boolean;
  fontScale: number;
  caption: string;
  customThemes: Theme[];
}
```

- `src/lib/themes.ts` — 5 built-in themes as typed constants (see DESIGN_SYSTEM.md for exact hex values)
- `src/lib/styles.ts` — 3 style variant definitions
- `src/lib/dimensions.ts` — 5 export presets

**Gate:** `npm run build` succeeds. All types compile. All slide/theme/style/preset combinations are representable.

---

### Phase 2: Slide Renderers (Quality Investment)

**This is where most of the time goes. The slides ARE the product.**

**Build these files (one component per slide type):**
- `src/components/slides/HookSlide.tsx`
- `src/components/slides/StepSlide.tsx`
- `src/components/slides/SplitSlide.tsx`
- `src/components/slides/ResultSlide.tsx`
- `src/components/slides/ConceptSlide.tsx`
- `src/components/slides/CloseSlide.tsx`
- `src/components/slides/CloseCTASlide.tsx`
- `src/components/slides/QuoteSlide.tsx`
- `src/components/slides/TextSlide.tsx`
- `src/components/slides/SlideRenderer.tsx` — Dispatcher that selects the right component by `slide.type`

**Every renderer must follow these rules:**

1. **Presentational only.** No internal state, no side effects. Accepts typed props, returns JSX. Refs managed by parent.

2. **Exact pixel dimensions.** Renders a `<div>` at exactly `dimensions.width × dimensions.height` using fixed inline styles. Not responsive CSS. Same component for preview and export.

3. **Follow DESIGN_SYSTEM.md exactly.** All typography sizes (56/40/24/20/18px), spacing (48px padding at 1080px), accent usage, left alignment, dot indicators — every detail comes from DESIGN_SYSTEM.md.

4. **Inline styles with concrete values.** No CSS variables at render time. Resolve theme values to hex/rgb before passing to components. This is required for html-to-image export to work (CSS variables don't survive foreignObject SVG serialization).

5. **Support all 3 style variants.** Each component conditionally renders based on `style.id`:
   - `clean-step`: accent bar + background step numbers + dot indicator
   - `bold-card`: content in rounded card + pill badges + "01/08" counter
   - `minimal-type`: pure typography + progress bar

6. **Scale proportionally.** All pixel values scale by `dimensions.width / 1080`. Padding, font sizes, spacing — everything.

7. **fontScale multiplier.** All font sizes multiply by the `fontScale` prop (range 0.8-1.2, default 1.0).

**Props interface:**
```typescript
interface SlideProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  theme: Theme;
  style: StyleVariant;
  dimensions: { width: number; height: number };
  showLogo: boolean;
  fontScale: number;
}
```

**After building all 9 renderers:** Run `/design-review`

`/design-review` visually audits every renderer against DESIGN_SYSTEM.md and fixes issues with atomic commits. It catches: wrong font sizes, bad spacing, accent color misuse, alignment issues, dot indicators in wrong position.

**Gate:** Visual regression snapshots for at least 9 combinations (1 theme × 1 style per slide type for rapid iteration). Full 135-combination suite before Phase 2 sign-off.

---

### Phase 3: Export Pipeline

**Build this file:**
- `src/lib/export.ts`

**Three export functions:**

1. **Single PNG:** `html-to-image` `toPng()` with `pixelRatio: 2` for retina quality.

2. **ZIP of all PNGs:** `jszip` + `file-saver`. Files named with slugified title + theme + date per CEO Review (e.g., `how-to-build-an-app-mlv-dark-2026-03-21/slide-01.png`).

3. **PDF:** `jspdf` PNG-to-PDF pipeline. JPEG compression at quality 0.92.

**Critical: the double-render technique.** Web fonts loaded via `next/font` may not render on first DOM-to-PNG capture. Call `toPng()` once (discard result), wait 100ms for font rasterization, then call `toPng()` again for the final capture.

**Critical: no CSS variables in slide renderers.** All theme values must be resolved to concrete hex/rgb before rendering. CSS variables in `calc()`, `backdrop-filter`, and complex gradients don't survive foreignObject SVG serialization.

**CEO Review additions for this phase:**
- **Copy to Clipboard:** `ClipboardItem` with promise-based blob. Chrome-first; non-Chrome falls back to PNG download. Done when clicking "Copy" in Chrome puts the slide image on the clipboard.
- **Export Filename Templating:** Filenames use `slugify(title)-theme-YYYY-MM-DD`. Done when exported files have meaningful names.

**After building export:** Run `/review` then `/qa http://localhost:3000`

`/review` catches code bugs in the export logic.
`/qa` opens a real browser and tests: click each export button, verify PNG dimensions, check PDF page count, test theme switching + re-export.

If export has bugs (blurry text, wrong dimensions, font issues): Run `/investigate` for systematic root-cause debugging.

**Gate:** All slide types export correctly at all 5 dimension presets. PNGs are sharp at 2x. PDFs have correct page count. ZIP filenames match the template.

---

### Phase 4: Parser + Input UI

**Build these files:**
- `src/lib/parser.ts`
- `src/components/ContentInput.tsx`

**Parser format (see DESIGN.md for full grammar):**

```
TITLE: How to build an app using Claude
PILLAR: Build
TYPE: 80% value

---

SLIDE 1 [hook]
HEADLINE: You don't need to learn to code to build an app.
SUB: Here's how to ship a product this weekend.
CTA: SWIPE →

---

SLIDE 2 [step]
NUM: 01
HEADLINE: Define the problem
BODY: Don't start with "I want to build an app."

Start with: "What's a problem I see every day?"

---

CAPTION:
Your caption text here...
```

**Parser rules:**
- Slides separated by `---`
- Fields: UPPERCASE key followed by colon (HEADLINE:, BODY:, SUB:, CTA:, NUM:, LABEL:, LEFT:, RIGHT:, LOGO:)
- Multi-line values continue until next UPPERCASE field or `---`
- Slide type in brackets `[hook]`, `[step]`, etc. — default to `[text]` if missing
- CAPTION: section after last slide pre-fills the caption textarea
- Forgiving: handle extra whitespace, missing fields, inconsistent casing. Never throw.

**CEO Review addition:** Paste-and-Go auto-parsing. Live parsing on paste/edit, debounced 300ms. No separate "Parse" button. Typing in the textarea updates the slide preview automatically.

**ContentInput component:**
- Textarea with monospace font for pasting
- Debounced 300ms auto-parse on change
- Below textarea: slide list showing type badges and first line of headline
- Click slide in list → preview jumps to that slide
- Drag-to-reorder slides (updates CarouselState directly)

**After building parser:** Run `/review`

**Gate:** Comprehensive unit tests for the parser:
- All 9 slide types parse correctly
- Multi-line BODY fields
- Missing brackets → default to [text]
- Missing fields → undefined, not crash
- CAPTION extraction
- Malformed input (empty string, random text, only separators)
- Case insensitivity (HEADLINE vs headline)
- SLIDE N numbering ignored (uses order)

---

### Phase 5: Assembly + Polish

**Build/wire these files:**
- `src/app/page.tsx` — 3-panel layout
- `src/components/SlidePreview.tsx` — Live preview with navigation, CSS transform scaling
- `src/components/Settings.tsx` — Platform, theme (with thumbnails), style, dimensions, font scale, logo toggle, export buttons
- `src/components/CaptionArea.tsx` — Caption textarea + copy button
- `src/app/layout.tsx` — Inter font loading, dark theme, meta tags
- `src/app/globals.css` — Tailwind config + app-level styles

**Layout (from DESIGN_SYSTEM.md):**
- ≥1400px: 3 columns (input 25% / preview 50% / settings 25%)
- 1200-1399px: 3 columns compressed (input 240px min, settings 220px min, preview flex)
- <1200px: 2 columns (input stacks above preview, settings in collapsible sidebar)
- <768px: single column with "Best on desktop" banner

**Preview panel:**
- Render slide at full export dimensions in a hidden off-screen container
- Display a scaled version using CSS `transform: scale(containerWidth / slideWidth)`
- Navigation: `◀ 3/8 ▶` centered below, accent color on hover
- Arrow key navigation when preview is focused

**Settings panel (from DESIGN_SYSTEM.md):**
- Platform preset dropdown
- Theme picker with thumbnail previews (CEO Review: render hook slide at 1/10 scale per theme)
- Style variant selector
- Font scale slider (80%-120%)
- Logo toggle
- Divider
- Export buttons (accent-colored, primary action styling)

**First-run experience:** Pre-load sample carousel from the SAMPLE CONTENT section below. User opens the tool and immediately sees: content in textarea, slides in list, first slide in preview, settings ready. Zero clicks to understanding.

**CEO Review additions for this phase:**
- **Undo/Redo:** Wire `HistoryState<T>` wrapper around useReducer. Cmd+Z / Cmd+Shift+Z. Every CarouselState mutation is undoable/redoable.
- **Theme Preview Thumbnails:** Mini rendered hook slide at 1/10 scale per theme in the theme picker.

**Custom Theme Builder:**
- "Create Custom Theme" button in Settings
- 5 color pickers (bg, text, accent, secondary, card)
- Save to localStorage with user-given name
- Custom themes appear in theme dropdown
- Delete button on custom themes

**Interaction states (from DESIGN_SYSTEM.md):**
- Parse: subtle pulse during 300ms debounce, slide list updates on success
- Export: button → spinner + "Exporting 3/8...", toast on success/failure
- Theme switch: instant re-render
- Copy to clipboard: button text → "Copied!" for 2s
- Undo/redo: buttons grayed when nothing to undo/redo

**Toast notifications (from DESIGN_SYSTEM.md):**
- Dark surface (#111118), white text, 4px accent left border, 4px radius
- Bottom-center, 32px from bottom
- Success: auto-dismiss 3s. Error: persist until dismissed. No icons.

**Accessibility (from DESIGN_SYSTEM.md):**
- Tab order: textarea → slide list → preview nav → settings → export buttons → caption → copy
- ARIA landmarks on all panels
- Focus management: after export returns focus to export button; after paste stays in textarea

**After assembly:** Run `/review` + `/qa http://localhost:3000` + `/codex`

`/review` — final code review
`/qa` — full browser walkthrough: parse sample content, navigate slides, switch themes/styles, export all formats, verify outputs
`/codex` — independent second opinion from OpenAI. Fix anything both models flag.

**Gate:** All features working end-to-end. All tests pass. All exports sharp and correctly dimensioned.

---

### Ship

Run `/ship` — syncs main, runs all tests, audits coverage, pushes, opens PR, deploys to Vercel.
Run `/document-release` — updates README and all docs to match what shipped.

### Post-launch

Run `/retro` after first week of team usage.

---

## SAMPLE CONTENT (pre-load on first visit)

```
TITLE: How to build an app in a weekend using Claude
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

#MLV #BuildDontPrepare #StudentFounder #AI #Claude
```

---

## TESTING REQUIREMENTS

**Parser tests (Phase 4):**
- All 9 slide types parse correctly
- Multi-line BODY fields
- Missing brackets → default to [text]
- Missing fields → undefined, not crash
- CAPTION extraction and pre-fill
- Malformed input (empty string, random text)
- Case insensitivity

**Slide renderer tests (Phase 2):**
- Each of 9 types renders without errors for each theme × style
- Text content appears in rendered output
- Dimensions match preset

**Export tests (Phase 3):**
- PNG at correct dimensions (1080×1350 at pixelRatio 2 = 2160×2700 actual)
- ZIP with correct file count and naming pattern
- PDF with correct page count
- Copy to clipboard works in Chrome

**Integration test (Phase 5):**
- Paste sample content → auto-parse → preview shows slides → switch theme → export ZIP → verify contents

---

## WHAT NOT TO BUILD

- No user accounts or auth
- No database or backend
- No AI content generation
- No collaboration features
- No scheduling or auto-posting
- No analytics or A/B testing
- No keyboard shortcuts (deferred to TODOS.md)
- No mobile layout (desktop-first, "Best on desktop" banner for small screens)
