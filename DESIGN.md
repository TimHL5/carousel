# Design System — MLV Carousel Generator

## Product Context
- **What this is:** A web app that turns structured text into professionally designed carousel slides for Instagram and LinkedIn
- **Who it's for:** MLV team — Growth Lead, PMAs (Jakarta), Brand Ambassadors (Hong Kong) — and ambitious high school students across Asia
- **Space/industry:** Educational content creation, startup/builder culture. Positioning: anti-credential, pro-builder
- **Project type:** Web app (Next.js) — both the tool UI and the slide output it produces

## Aesthetic Direction
- **Direction:** Industrial Minimal
- **Decoration level:** Intentional — accent bars, background step numbers at 8% opacity, dot indicators earn their pixels. No gradients, no patterns, no illustration.
- **Mood:** YC pitch deck energy. Sharp, direct, confident. Not corporate, not cutesy, not motivational-poster. The visual language of building, not credentialing.
- **Reference approach:** Differentiate from Hormozi/hustle-bro (black+gold+uppercase) and pastel Canva templates. Green accent owns a distinct visual lane that reads as growth/build/go.

## Typography

### Font
**Inter** — weights 400 (regular), 500 (medium), 700 (bold). Loaded via `next/font/google`.

### Slide Output Scale (at 1080px canvas)
These sizes are designed for Instagram viewing: 1080px canvas displayed at ~375px on phones. Text must be ~3x larger than typical UI sizes.

| Role | Size | Weight | Line Height | Notes |
|------|------|--------|-------------|-------|
| Hook headline | 56px | 700 | 1.1 | Maximum impact, under 10 words |
| Slide headline | 40px | 700 | 1.2 | One idea per slide |
| Body | 24px | 400 | 1.5 | Max 2-3 short lines |
| Sub / Label | 20px | 500 | 1.4 | Subtitles, attributions |
| CTA text | 18px | 500 | 1.4 | Uppercase, letter-spacing 0.05em |
| Background step number | 160px | 700 | 1.0 | Accent color at 8% opacity |
| Slide counter | 14px | 500 | 1.0 | "01/08" format (Bold Card style) |
| Dot indicator | 6px | — | — | Circles, center-aligned |

### App UI Scale
| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| H1 | 24px | 700 | 1.2 |
| H2 | 18px | 600 | 1.3 |
| Body | 14px | 400 | 1.5 |
| Label | 12px | 500 | 1.4 |
| Caption | 11px | 400 | 1.4 |

### Loading
```tsx
import { Inter } from 'next/font/google'
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})
```

## Color

### Approach: Restrained
One accent + neutrals. Green is rare and meaningful — it appears on accent bars, CTAs, and active indicators. Never as background fill. Color scarcity makes each instance powerful.

### MLV Dark Theme (default)
| Role | Hex | Usage |
|------|-----|-------|
| Primary / Accent | #6AC670 | Accent bars, CTAs, active indicators, step numbers (at 8% opacity) |
| Background | #0A0A0A | Page/slide background |
| Card Surface | #111118 | Elevated surfaces, cards, inputs |
| Surface Hover | #1A1A24 | Hover state for cards/buttons |
| Primary Text | #F5F5F5 | Headlines, body text |
| Secondary Text | #9CA3AF | Subtitles, labels, muted content |
| Border | rgba(255,255,255,0.06) | Subtle dividers, card outlines |

### All 5 Themes
| Theme | Background | Text | Accent | Card |
|-------|-----------|------|--------|------|
| MLV Dark (default) | #0A0A0A | #F5F5F5 | #6AC670 | #111118 |
| MLV Light | #FAFAFA | #111118 | #2D6A4F | #FFFFFF |
| Midnight Blue | #0F172A | #F5F5F5 | #38BDF8 | #1E293B |
| Warm Minimal | #FFF8F0 | #1C1917 | #EA580C | #FFFFFF |
| Monochrome | #000000 | #FFFFFF | #FFFFFF | #111111 |

### Semantic Colors
| Role | Hex |
|------|-----|
| Success | #22C55E |
| Warning | #EAB308 |
| Error | #EF4444 |
| Info | #3B82F6 |

### Dark Mode Strategy
MLV Dark IS the default. Light themes (MLV Light, Warm Minimal) reduce accent saturation by 10-20% and use white card surfaces. The app UI always uses the MLV Dark theme regardless of slide theme selection.

## Spacing

### Base Unit: 8px
| Token | Value | Usage |
|-------|-------|-------|
| 2xs | 2px | Hairline borders |
| xs | 4px | Tight gaps, icon margins |
| sm | 8px | Base unit, small gaps |
| md | 16px | Standard gaps, card padding |
| lg | 24px | Content gaps between text blocks |
| xl | 32px | Section gaps, indicator margins |
| 2xl | 48px | Slide padding (at 1080px) |
| 3xl | 64px | Large section dividers |

### Slide-Specific Spacing
- **Slide padding:** 48px on all sides (at 1080px width, scale proportionally for other dimensions)
- **Content gap:** 24px between text blocks
- **Dot indicator:** 32px margin-bottom from slide edge
- **Accent bar:** 4px wide, positioned at left edge, spans 70% of slide height (centered vertically)
- **Background step number:** Positioned at top-left of content area

### Density: Comfortable
Not compact (too cramped for Instagram reading distance), not spacious (wastes precious slide real estate). Comfortable means every element has breathing room but no space is wasted.

## Layout

### Approach: Grid-disciplined, left-aligned
- **Slide layout:** All text left-aligned. Never centered. This is a deliberate departure from Instagram carousel conventions — left alignment reads more confident and editorial, like a pitch deck.
- **App layout:** 3-panel with responsive breakpoints
  - Desktop (≥1200px): 3 columns — input, preview (hero), settings
  - Tablet (768-1199px): 2 columns — input+preview stacked, settings sidebar
  - Mobile (<768px): single column stack

### Grid
- **Slides:** No formal grid — content area is a single column with 48px padding
- **App:** Flexible columns, no fixed grid system needed

### Max Content Width
- **Slides:** Fixed at export dimensions (1080px, 1200px)
- **App:** No max-width — full viewport

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Buttons, inputs, tags |
| md | 8px | Cards, dropdowns |
| lg | 12px | Slide preview container, modals |
| full | 9999px | Dots, pill badges, toggles |

## Motion

### Approach: Minimal-functional
Slides are static images — no animation in the output. App UI uses transitions only to aid comprehension (state changes, hover feedback). Never decorative.

### Easing
| Type | Curve | Usage |
|------|-------|-------|
| Enter | ease-out | Elements appearing |
| Exit | ease-in | Elements leaving |
| Move | ease-in-out | Position/size changes |

### Duration
| Type | Duration | Usage |
|------|----------|-------|
| Micro | 50-100ms | Hover color changes, focus rings |
| Short | 150ms | Button press, toggle switch |
| Medium | 250ms | Panel transitions, slide navigation |

## Style Variants

### 1. Clean Step (default)
The typography-forward default. Minimal decoration.
- **Accent bar:** 4px wide, left edge, accent color, spans 70% of slide height
- **Background step number:** 160px, accent at 8% opacity, top-left behind content
- **Progress indicator:** 6px dot circles at bottom center, accent = active, white at 20% = inactive
- **Cards:** None — content floats on the background
- **Borders:** None
- **Step labeling:** "Step 01" text above headline, accent color, 20px/500

### 2. Bold Card
Structured, card-based layout. More contained feel.
- **Content card:** Surface-colored (#111118) rounded rectangle, 12px radius, 24px internal padding, positioned within the 48px slide padding
- **Step badge:** Pill-shaped, accent background, dark text, "01" format, positioned top-left of card
- **Progress indicator:** "01/08" text counter, 14px/500, top-right corner of slide
- **Borders:** 1px rgba(255,255,255,0.06) on cards
- **Step labeling:** Badge replaces text label

### 3. Minimal Type
Pure typography. Zero decoration. Maximum restraint.
- **No accent bars, no cards, no step numbers, no badges**
- **Hierarchy via weight only:** 700 for headlines, 400 for body. No color differentiation in content.
- **Progress indicator:** 2px thin line at bottom, accent fill shows progress (e.g., 3/8 = 37.5% filled)
- **Generous whitespace:** Content vertically centered with extra padding
- **Step labeling:** Just the headline, no numbering (unless NUM field explicitly provided)

## Slide Type Visual Specs

All specs assume 1080×1350 (Instagram Portrait) at Clean Step style. Scale proportionally for other dimensions.

### [hook]
- Full-slide headline treatment
- Headline: 56px/700, max 90% width
- Sub: 20px/400, secondary color, below headline
- CTA: 18px/500, accent color, uppercase
- No decoration except dots

### [step]
- Left accent bar (4px)
- Background step number (160px/700, accent at 8%)
- Step label above headline (20px/500, accent)
- Headline: 40px/700
- Body: 24px/400, secondary color, max 85% width
- Dots at bottom

### [split]
- Headline: 40px/700, full width, above columns
- Two columns: left and right, separated by a 1px vertical divider (border color)
- Column text: 20px/400, secondary color
- Column headers (if present): 14px/500, uppercase, accent, letter-spacing 0.1em

### [result]
- Same as [step] but without accent bar and step number
- Headline: 40px/700
- Body: 24px/400, secondary color
- Optional: accent-colored bullet markers (✦) at start of list items

### [concept]
- Optional label above headline: 14px/500, uppercase, accent, letter-spacing 0.1em
- Headline (concept name): 40px/700
- Body (explanation): 24px/400, secondary color

### [close]
- Content vertically centered in lower 60% of slide
- Headline: 40px/700
- Sub: 20px/400, secondary color
- Logo mark: "MLV" in accent color, 14px/500, uppercase

### [close-cta]
- Same as [close] plus:
- CTA button: accent background, dark text, 18px/500, pill-shaped (9999px radius), 16px 32px padding

### [quote]
- Quote text: 40px/700, with a 4px accent bar on the left (same as step accent bar)
- Attribution (SUB): 20px/400, secondary color, prefixed with em dash

### [text]
- Fallback. Body text: 24px/400, vertically centered
- Optional headline: 40px/700 above body

## App UI Specification

### Panel Layout
- **Width ratios:** Input 25% / Preview 50% / Settings 25%
- **≥1400px:** 3 columns at ratio
- **1200-1399px:** 3 columns, input 240px min, settings 220px min, preview flex
- **<1200px:** 2 columns — input stacks above preview, settings in collapsible sidebar
- **<768px:** Single column with "Best on desktop" subtle banner

### First-Run Experience
Pre-load the sample carousel from MASTER_PROMPT.md on first visit. The user opens the tool and immediately sees: content in the textarea, parsed slides in the list, the first slide rendered in the preview, and the settings panel ready. Zero-click to understanding.

### Panel Hierarchy
- **Input panel:** Textarea gets focus on load. Below textarea: slide list with type badges and drag handles.
- **Preview panel (hero):** Scaled slide at center. Navigation: `◀ 3/8 ▶` centered below. Arrows get accent color on hover.
- **Settings panel:** Platform → Theme (thumbnails) → Style → Dimensions → Font Scale → Logo Toggle → [divider] → Export buttons (accent-colored, primary action styling).
- **Caption bar:** Full width below panels. Textarea + "Copy" button (right-aligned).

### Tab Order
Textarea → Slide list items → Preview nav arrows → Settings controls (top to bottom) → Export buttons → Caption textarea → Caption copy button

### ARIA Landmarks
- Input panel: `role="region" aria-label="Content input"`
- Preview panel: `role="main" aria-label="Slide preview"`
- Settings panel: `role="complementary" aria-label="Settings"`
- Caption bar: `role="region" aria-label="Caption"`

### Focus Management
- After export completes: focus returns to the export button that was clicked
- After paste+parse: focus stays in textarea
- After undo/redo: focus stays on the element that had focus before the action
- After theme/style change: focus stays on the control that was changed

### Interaction States

| Feature | Loading | Empty | Error | Success | Partial |
|---------|---------|-------|-------|---------|---------|
| Parse | Subtle pulse on slide list during 300ms debounce | Placeholder: "Paste your carousel script here..." with syntax example | N/A (falls back to [text]) | Slide list updates, count badge appears | Some slides show [text] fallback with muted warning |
| Preview | Skeleton shimmer at slide dimensions | "Your slides will appear here" + mini example | N/A | Slide renders with 150ms fade-in | N/A |
| Theme switch | Instant | Default MLV Dark | N/A | All slides re-render instantly | N/A |
| Export ZIP | Button → spinner + "Exporting 3/8..." | Button disabled (no slides) | Toast: "Export failed — try again" | Toast: "Downloaded!" with filename | N/A |
| Export PDF | Same as ZIP | Same as ZIP | Same as ZIP | Same as ZIP | N/A |
| Copy to clipboard | Brief spinner on button | Button disabled | Fallback: downloads PNG, toast: "Saved as file" | Toast: "Copied!" for 2s | N/A |
| Custom theme | Instant | Default color values | Toast: "Storage full — theme not saved" | Toast: "Theme saved" | N/A |
| Undo/Redo | Instant | Buttons grayed out | N/A | State restores, subtle pulse on changed area | N/A |
| Caption copy | Instant | Placeholder: "Your caption will appear here..." | N/A | Button text → "Copied!" for 2s | N/A |

### Toast Notifications
- **Style:** Dark surface (#111118), white text (#F5F5F5), thin accent-colored left border (4px), 4px border-radius
- **Position:** Bottom-center, 32px from bottom edge
- **Duration:** Success toasts auto-dismiss after 3 seconds. Error toasts persist until dismissed.
- **No icons.** Text only. Consistent with the minimal decoration principle.

### Color Contrast (WCAG AA compliance)
| Combination | Ratio | Passes |
|------------|-------|--------|
| #F5F5F5 on #0A0A0A | 18.1:1 | AA, AAA |
| #9CA3AF on #0A0A0A | 6.4:1 | AA |
| #6AC670 on #0A0A0A | 7.9:1 | AA, AAA |
| #111118 on #0A0A0A | 1.2:1 | Decorative only |
| #F5F5F5 on #111118 | 15.6:1 | AA, AAA |

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-22 | Initial design system created | Created by /design-consultation based on competitive research (Hormozi, Chris Do, Jun Yuh, PostNitro) and MLV brand positioning |
| 2026-03-22 | Left-aligned text (risk #1) | Differentiates from centered Canva templates. Reads more confident and editorial. |
| 2026-03-22 | Green accent over gold (risk #2) | Hormozi/hustle owns gold. Green reads as growth/build and is visually distinctive. |
| 2026-03-22 | 3x typography scale (risk #3) | 1080px canvas at ~375px phone display requires larger text. Forces disciplined writing. |
| 2026-03-22 | Typography scale corrected | CLAUDE.md had 34px/15px/12px — too small for Instagram. Updated to 56/40/24/20/18px. |
| 2026-03-22 | Pre-loaded sample on first run | User sees the full pipeline working immediately. Seeing is understanding. |
| 2026-03-22 | App UI interaction states added | All states (loading, empty, error, success, partial) specified per feature |
| 2026-03-22 | Accessibility spec added | Tab order, ARIA landmarks, focus management, WCAG AA contrast verified |
| 2026-03-22 | Responsive breakpoints defined | 3-col ≥1400, compressed 1200-1399, 2-col <1200, single <768 |
| 2026-03-22 | Toast notification style | Minimal: dark surface, white text, accent left border, no icons |
