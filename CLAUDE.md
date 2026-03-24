# MLV Carousel Generator

## Project overview
A production-ready Next.js web app that turns structured text into professionally designed carousel slides for Instagram and LinkedIn. Built for the MLV (Mam La Viet) team — founders, Growth Lead, PMAs, and Brand Ambassadors can produce on-brand carousels without design skills.

**The tool replaces Canva/Figma for carousel creation.** Brand consistency is enforced at the code level.

## Tech stack
- **Framework:** Next.js 16+ (App Router)
- **Styling:** Tailwind CSS 4
- **Font:** Inter (via `next/font/google`)
- **Image export:** `html-to-image` (DOM → PNG at exact pixel dimensions)
- **PDF export:** `jspdf` (for LinkedIn document posts)
- **ZIP packaging:** `jszip` + `file-saver`
- **Deployment:** Vercel
- **State:** React useState/useReducer only (no external state library)
- **Database:** None — all content entered at generation time, exported as files

## Architecture
```
src/
├── app/
│   ├── layout.tsx          # Root layout, Inter font, dark theme
│   ├── page.tsx            # Main 3-panel UI
│   └── globals.css         # Tailwind + CSS variables for themes
├── components/
│   ├── ContentInput.tsx    # Left panel: textarea + parser + slide list
│   ├── SlidePreview.tsx    # Center panel: live preview with navigation
│   ├── Settings.tsx        # Right panel: platform, theme, style, export
│   ├── CaptionArea.tsx     # Bottom: caption display + copy button
│   ├── Toast.tsx           # Toast notifications (bottom-center)
│   ├── editor/             # Visual editor components (Canva-like)
│   │   ├── ElementWrapper.tsx    # Wraps each slide element — click, drag, resize, inline edit
│   │   ├── SelectionOverlay.tsx  # Blue dashed selection border + 8 resize handles
│   │   └── FloatingToolbar.tsx   # Font size, weight, color swatches, visibility, reset
│   └── slides/             # Slide type renderers (one component per type)
│       ├── SlideLayout.tsx # Shared wrapper: padding, dots, accent bar, counter
│       ├── SlideRenderer.tsx # Dispatcher — routes slide.type to the right component
│       ├── HookSlide.tsx
│       ├── StepSlide.tsx
│       ├── SplitSlide.tsx
│       ├── ResultSlide.tsx
│       ├── ConceptSlide.tsx
│       ├── CloseSlide.tsx
│       ├── CloseCTASlide.tsx
│       ├── QuoteSlide.tsx
│       └── TextSlide.tsx
├── lib/
│   ├── parser.ts           # Text → slide data parser
│   ├── serializer.ts       # Slide data → text serializer (inverse of parser)
│   ├── useUndoReducer.ts   # Undo/redo history wrapper for useReducer
│   ├── themes.ts           # Theme definitions + CSS variable mapping
│   ├── styles.ts           # Design style variant definitions
│   ├── dimensions.ts       # Export dimension presets
│   └── export.ts           # PNG/ZIP/PDF export logic
└── types/
    └── carousel.ts         # TypeScript types for slides, themes, styles
```

## Brand
- **Primary background:** #0A0A0A
- **Primary text:** #F5F5F5
- **Accent:** #6AC670 (MLV green)
- **Secondary text:** #9CA3AF
- **Card surface:** #111118
- **Font:** Inter weights 400 (body), 500 (subtitles/labels), 700 (headlines) via next/font/google
- **Border radius:** 12px for cards, 8px for buttons/inputs
- **Borders:** 1px rgba(255,255,255,0.06) on dark surfaces

## Key constraints
- All slide rendering is client-side. No API calls for generation.
- Slide components render at exact pixel dimensions (e.g., 1080×1350) using fixed inline styles. The preview scales with CSS `transform: scale()` but the DOM node stays at export size. WYSIWYG.
- Export quality is paramount: no blurry text, no clipped edges, no color shifts between preview and export.
- The parser must be forgiving — handle messy input, extra whitespace, missing brackets. Never crash. Fall back to `[text]` slide type if unrecognized.
- No user accounts, no database, no backend. Fully client-side tool.

## Visual editor (Canva-like)
The app includes a visual editor (toggle via "Edit" button in header) that lets users directly manipulate slide elements:
- **Click** to select an element (headline, body, sub, cta, etc.)
- **Drag** to reposition (8px snap-to-grid, Shift disables snap)
- **Resize** via 8-point handles on selection overlay
- **FloatingToolbar** appears above selected element: font size ±, weight L/M/B, 5 color swatches + hex input, visibility toggle, reset
- **Double-click** text elements for inline editing via contentEditable (Cmd+Enter commits, Escape cancels)
- **Undo/Redo** via Cmd+Z / Cmd+Shift+Z (skips contentEditable — browser handles text undo)

Architecture: `ElementWrapper` wraps each text element in slide renderers. Overrides (`ElementOverride`) stored per-slide in `slide.overrides[]`. Elements without overrides stay in flexbox flow; elements with position overrides switch to `position: absolute`. Hidden export nodes always render with `editMode=false` — no editor chrome in exports.

Key types: `CarouselState.editMode`, `CarouselState.selectedElementId`, `CarouselState.editingElementId`, `ElementOverride` (id, x, y, width, height, fontSize, fontWeight, color, visible, rotation).

## Export dimensions
| Preset | Width | Height | Use case |
|--------|-------|--------|----------|
| Instagram Square | 1080 | 1080 | Standard IG carousel |
| Instagram Portrait | 1080 | 1350 | Max feed real estate (default) |
| LinkedIn Square | 1080 | 1080 | LinkedIn document post |
| LinkedIn Portrait | 1080 | 1350 | LinkedIn document post (portrait) |
| Twitter/X | 1200 | 675 | X/Twitter posts |

## Slide types
`[hook]`, `[step]`, `[split]`, `[result]`, `[concept]`, `[close]`, `[close-cta]`, `[quote]`, `[text]`

## Design themes (5 built-in + custom theme builder)
Custom themes are in scope for v1: 5 color pickers (bg, text, accent, secondary, card) saving to localStorage.
1. MLV Dark (default): #0A0A0A bg, #6AC670 accent
2. MLV Light: #FAFAFA bg, #2D6A4F accent
3. Midnight Blue: #0F172A bg, #38BDF8 accent
4. Warm Minimal: #FFF8F0 bg, #EA580C accent
5. Monochrome: #000000 bg, #FFFFFF accent

## Design style variants (3)
1. Clean Step: left accent bar, background step numbers, dot indicator
2. Bold Card: content in rounded cards, pill step badges, "01/08" counter
3. Minimal Type: pure typography, no decoration, font weight contrast, progress bar

## Testing approach
- Unit tests for the parser (all slide types, edge cases, malformed input)
- Visual regression tests for slide renderers (each type × each theme × each style)
- Export tests: verify PNG dimensions, PDF page count, ZIP contents
- Integration test: paste sample content → parse → preview → export → verify output

## Design philosophy
This is a VISUAL PRODUCT. The output — the carousel slides — IS the product. If the slides look mediocre, nobody will use this over Canva. Every design decision must be intentional. The slide renderers are not backend components that happen to produce visuals — they are the core product surface.

Design principles for slide output:
- Dark backgrounds with high-contrast text (stands out in Instagram/LinkedIn feeds)
- One idea per slide, maximum 25 words
- Typography at Instagram scale (1080px canvas viewed at ~375px on phones): hook headlines 56px/700, slide headlines 40px/700, body 24px/400, sub 20px/500, CTA 18px/500 uppercase
- Left-aligned text throughout (never centered — differentiates from Canva templates, reads more confident)
- Generous padding (48px at 1080px width). Never cramped.
- Accent color used sparingly: accent bars, step numbers, CTA buttons, active indicators. Never as background fill.
- No stock imagery. Clean text-on-background or text-in-card layouts.
- The dot indicator at bottom center grounds every slide and shows progress.

Design principles for the app UI:
- The app itself uses the MLV dark theme: #08080C background, #111118 surfaces
- The app should feel like a professional design tool, not a hackathon project
- Settings panel should be clean and scannable — dropdowns, not cluttered buttons
- The slide preview is the hero — it should dominate the viewport
- Export buttons should feel like primary actions (accent-colored)

## Design System
Always read DESIGN_SYSTEM.md before making any visual or UI decisions.
All font choices, colors, spacing, typography scale, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN_SYSTEM.md.

## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.

Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /review, /ship, /browse, /qa, /qa-only, /design-review,
/setup-browser-cookies, /retro, /investigate, /document-release, /codex, /careful,
/freeze, /guard, /unfreeze, /gstack-upgrade.

If gstack skills aren't working, run `cd .claude/skills/gstack && ./setup` to build the binary and register skills.

### gstack workflow for this project (FOLLOW THIS ORDER)

See DESIGN.md for the full design doc (approved via /office-hours).

**Phase 0: Think + Design (before any code)**
1. `/office-hours` — DONE. Design doc approved. See DESIGN.md.
2. `/plan-ceo-review` — CEO-level review of the design doc
3. `/design-consultation` — Build the complete visual design system. Writes DESIGN_SYSTEM.md.
4. `/plan-design-review` — Rates the design system 0-10, pushes quality higher
5. `/plan-eng-review` — Lock architecture, data flow, component interfaces, test plan

**Phase 1: Data Layer Foundation**
6. Build `types/carousel.ts`, `lib/themes.ts`, `lib/styles.ts`, `lib/dimensions.ts`
7. Gate: types compile, all slide/theme/style combinations representable

**Phase 2: Slide Renderers (Quality Investment)**
8. Build all 9 slide type components in `components/slides/`
9. `/design-review` — Visual review against DESIGN_SYSTEM.md
10. Gate: visual regression snapshots for all 135 combinations (5 themes × 3 styles × 9 types)

**Phase 3: Export Pipeline**
11. Build `lib/export.ts` — PNG, PDF, ZIP export
12. `/review` — Code review of export logic
13. `/qa http://localhost:3000` — Real browser testing of all export formats
14. `/investigate` — If any export bugs, systematic root-cause debugging

**Phase 4: Parser + Input UI**
15. Build `lib/parser.ts` + `components/ContentInput.tsx`
16. `/review` — Code review
17. Gate: unit tests for all slide types, edge cases, malformed input

**Phase 5: Assembly + Polish**
18. Wire 3-panel layout, SlidePreview, Settings, CaptionArea
19. `/review` + `/qa` — Final pass
20. `/codex` — Second opinion before shipping
21. `/ship` — Tests pass, PR opened, deploy to Vercel
22. `/document-release` — Update README and all docs

**Phase 6: Visual Editor (Canva-like)**
23. Build editor state, ElementWrapper, selection overlay, drag-to-move, resize, floating toolbar, inline text editing
24. `/review` + `/codex` — Cross-model review (Claude + Codex gpt-5.4)
25. `/qa` — Full editor workflow browser testing
26. `/design-review` — Editor chrome visual consistency with DESIGN_SYSTEM.md
27. `/ship` — PR created
28. `/document-release` — Update all docs

**Post-launch**
29. `/retro` — After first week of team usage, review what to improve
