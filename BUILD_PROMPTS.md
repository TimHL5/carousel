MLV CAROUSEL GENERATOR — BUILD PROMPTS
Copy-paste these into Claude Code in order.
Wait for each to complete before pasting the next.

═══════════════════════════════════════
PHASE 2: SLIDE RENDERERS
═══════════════════════════════════════

PROMPT 2A (Build all 9 renderers):

Phase 1 complete. Start Phase 2: Slide Renderers.

Read DESIGN_SYSTEM.md — it is the visual source of truth for every font size, spacing value, color, and layout decision.

Build all 9 slide type components in src/components/slides/:
- HookSlide.tsx
- StepSlide.tsx
- SplitSlide.tsx
- ResultSlide.tsx
- ConceptSlide.tsx
- CloseSlide.tsx
- CloseCTASlide.tsx
- QuoteSlide.tsx
- TextSlide.tsx

Plus SlideRenderer.tsx — a dispatcher that selects the right component by slide.type.

Rules from MASTER_PROMPT.md:
1. Presentational only — no internal state, no side effects
2. Render at exact pixel dimensions using fixed inline styles
3. Follow DESIGN_SYSTEM.md exactly for all visual specs (56/40/24/20/18px typography, 48px padding at 1080px, left-aligned, accent bar specs, dot indicators)
4. Inline styles with concrete hex values — no CSS variables at render time (required for html-to-image export)
5. Support all 3 style variants via the style.id prop (clean-step, bold-card, minimal-type)
6. Scale all pixel values by dimensions.width / 1080
7. Multiply all font sizes by fontScale prop

Build a simple test page at src/app/page.tsx that renders each slide type with sample data so I can visually verify them. Use the MLV Dark theme and Clean Step style as defaults.

---

PROMPT 2B (After renderers are built — run design review):

/design-review

---

═══════════════════════════════════════
PHASE 3: EXPORT PIPELINE
═══════════════════════════════════════

PROMPT 3A (Build export):

Phase 2 complete, design review passed. Start Phase 3: Export Pipeline.

Build src/lib/export.ts with three functions:

1. exportSlide — single PNG via html-to-image toPng() with pixelRatio: 2
2. exportAllAsZip — ZIP of all PNGs via jszip + file-saver. Filenames use slugified title + theme + date per CEO_REVIEW.md (e.g., how-to-build-an-app-mlv-dark-2026-03-22/slide-01.png)
3. exportAsPdf — multi-page PDF via jspdf. JPEG compression at 0.92.

Critical: implement the double-render technique from DESIGN.md — call toPng() once (discard), wait 100ms, call toPng() again for final capture. This fixes web font rendering.

Also implement from CEO_REVIEW.md:
- Copy to Clipboard: ClipboardItem with promise-based blob. Chrome-first; non-Chrome falls back to PNG download.
- Export Filename Templating: slugify(title)-theme-YYYY-MM-DD format.

Wire the export buttons into the test page so I can verify all formats work.

---

PROMPT 3B (Code review):

/review

---

PROMPT 3C (Browser QA):

/qa http://localhost:3000

---

PROMPT 3D (Only if export bugs found):

/investigate

---

═══════════════════════════════════════
PHASE 4: PARSER + INPUT UI
═══════════════════════════════════════

PROMPT 4A (Build parser + input):

Phase 3 complete, export working. Start Phase 4: Parser + Input UI.

Build src/lib/parser.ts following the parser grammar in DESIGN.md exactly. The format uses UPPERCASE field labels (HEADLINE:, BODY:, SUB:, CTA:, NUM:, LABEL:, LEFT:, RIGHT:, LOGO:) with --- separators between slides. Support CAPTION: section at end.

Parser must be forgiving — handle extra whitespace, missing brackets (default to [text]), missing fields (return undefined, not crash), inconsistent casing. Never throw on bad input.

Build src/components/ContentInput.tsx:
- Textarea with monospace font
- Live auto-parsing on paste/edit, debounced 300ms (Paste-and-Go from CEO_REVIEW.md — no separate Parse button)
- Below textarea: slide list showing type badges and first line of headline
- Click slide in list → updates selectedSlideIndex in state
- Drag-to-reorder slides (updates CarouselState directly)

Write comprehensive unit tests for the parser covering: all 9 slide types, multi-line BODY, missing brackets, missing fields, CAPTION extraction, malformed input (empty string, random text), and case insensitivity.

---

PROMPT 4B (Code review):

/review

---

═══════════════════════════════════════
PHASE 5: ASSEMBLY + POLISH
═══════════════════════════════════════

PROMPT 5A (Wire everything together):

Phase 4 complete, parser tested. Start Phase 5: Assembly + Polish.

Read DESIGN_SYSTEM.md's "App UI Specification" section for exact layout specs, interaction states, and accessibility requirements.

Wire the full app:

1. src/app/page.tsx — 3-panel layout per DESIGN_SYSTEM.md breakpoints (≥1400px: 3 columns 25/50/25, 1200-1399: compressed, <1200: 2-col, <768: single with "Best on desktop" banner)

2. src/components/SlidePreview.tsx — render slide at full export dimensions in hidden off-screen container, display scaled version via CSS transform. Navigation: ◀ 3/8 ▶ centered below. Arrow key nav when focused.

3. src/components/Settings.tsx — platform preset dropdown, theme picker with thumbnail previews (CEO_REVIEW.md: render hook slide at 1/10 scale per theme), style variant selector, font scale slider 80-120%, logo toggle, divider, then export buttons (accent-colored primary action).

4. src/components/CaptionArea.tsx — textarea pre-filled from parsed CAPTION, copy button that shows "Copied!" for 2s.

5. src/app/layout.tsx — Inter font loading (400/500/700), dark theme (#08080C), meta tags, favicon.

6. Custom Theme Builder in Settings: "Create Custom Theme" → 5 color pickers → save to localStorage with name → appears in theme dropdown → delete button on custom themes.

7. Undo/Redo from CEO_REVIEW.md: wire HistoryState<T> wrapper around useReducer. Cmd+Z / Cmd+Shift+Z. Every CarouselState mutation undoable/redoable.

8. Interaction states from DESIGN_SYSTEM.md: parse pulse, export spinner with "Exporting 3/8...", toast notifications (dark surface, accent left border, bottom-center).

9. Accessibility from DESIGN_SYSTEM.md: tab order, ARIA landmarks on all panels, focus management.

10. Pre-load sample carousel from MASTER_PROMPT.md as default content on first visit.

Make sure npm run build succeeds with no errors.

---

PROMPT 5B (Code review):

/review

---

PROMPT 5C (Full browser QA):

/qa http://localhost:3000

---

PROMPT 5D (Second opinion):

/codex

---

═══════════════════════════════════════
SHIP
═══════════════════════════════════════

PROMPT 6A:

/ship

---

PROMPT 6B:

/document-release

---

═══════════════════════════════════════
POST-LAUNCH (run after 1 week of use)
═══════════════════════════════════════

PROMPT 7:

/retro
