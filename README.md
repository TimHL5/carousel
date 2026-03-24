# MLV Carousel Generator

A web app that turns structured text into professionally designed carousel slides for Instagram and LinkedIn. Built for the MLV team — paste your script, pick a theme, export pixel-perfect slides.

## Features

- **9 slide types:** hook, step, split, result, concept, close, close-cta, quote, text
- **5 built-in themes** + custom theme builder with localStorage persistence
- **3 style variants:** Clean Step (accent bars + dots), Bold Card (cards + badges), Minimal Type (pure typography)
- **Visual editor:** Click to select, drag to reposition, resize with handles, edit text inline (double-click), change font size/weight/color via floating toolbar
- **Export:** PNG (single slide or ZIP), PDF, clipboard copy — all at exact pixel dimensions (1080×1350 default)
- **Undo/Redo:** Full history for all editor actions (Cmd+Z / Cmd+Shift+Z)
- **Layout controls:** Padding, gap, accent bar width, text alignment, vertical alignment, line height, body width, headline scale
- **Zero backend:** Fully client-side. No accounts, no database, no API calls.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app pre-loads a sample carousel so you see the full pipeline immediately.

## Tech Stack

- **Next.js 16+** (App Router) with React 19
- **Tailwind CSS 4** for app UI styling
- **Inter** font via `next/font/google` (400, 500, 700)
- **html-to-image** for DOM → PNG export
- **jspdf** for PDF export
- **jszip** + **file-saver** for ZIP packaging
- **Vitest** for unit testing (29 tests)

## How It Works

1. **Paste** a structured script in the left panel (SLIDE N [type] / HEADLINE: / BODY: format)
2. **Preview** renders live in the center panel at exact export dimensions
3. **Customize** theme, style, dimensions, and layout in the right panel
4. **Edit visually** — toggle Edit mode to drag, resize, and restyle elements directly on the slide
5. **Export** as PNG, ZIP, or PDF

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for full architecture, design system reference, and development workflow.

## Design System

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for typography scale, color palette, spacing tokens, and style variant specs.
