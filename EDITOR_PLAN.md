# VISUAL EDITOR — Feature Plan

## What We're Building

A direct-manipulation editing layer on top of the existing carousel renderer. Users can click any element to select it, drag to reposition, double-click to edit text inline, resize with handles, and adjust font/color via a floating toolbar. Toggle between Preview mode (clean view) and Edit mode (manipulation).

The parser still works: pasting text creates slides with DEFAULT positions (current flexbox layout). The editor lets you customize from there. All overrides survive theme/style changes.

## Architecture Change

### New Type: ElementOverride

Each slide element gets optional position/size overrides. No override = default flexbox position.

```typescript
interface ElementOverride {
  id: string;              // "headline", "body", "sub", "cta", "step-label", "accent-bar", "logo", "dot-indicator"
  x?: number;              // absolute x in slide pixels (0-1080)
  y?: number;              // absolute y
  width?: number;          // override width (undefined = auto)
  height?: number;         // override height (undefined = auto)
  fontSize?: number;       // override font size in slide pixels
  fontWeight?: number;     // override weight
  color?: string;          // override color hex
  visible?: boolean;       // hide/show element (default true)
  rotation?: number;       // degrees rotation (default 0)
}

// SlideData gets new field:
overrides?: ElementOverride[];

// CarouselState gets new field:
editMode: boolean;
```

### Two Rendering Modes (Hybrid)

**Auto mode (default):** Current flexbox layout. Parser creates slides here. Overrides array empty.

**Custom mode:** When an element is dragged/resized, an override is created for THAT element only. It switches from flexbox to absolute positioning. Other elements stay in flexbox flow.

This hybrid approach means:
- Parser pipeline unchanged
- Export works identically (overrides are just different positioning, same DOM to PNG)
- Users can customize individual elements without breaking everything else
- Undo/redo covers position changes (already have HistoryState)

### New Components

```
src/components/editor/
  EditorCanvas.tsx       - Wraps SlidePreview with edit mode overlay
  SelectionOverlay.tsx   - Selection boxes + 8 resize handles over selected element
  DragHandle.tsx         - Corner/edge drag handles for resize
  FloatingToolbar.tsx    - Font size, weight, color, alignment controls
  ElementWrapper.tsx     - Wraps each slide element with selection/drag/edit behavior
  useEditorState.ts      - Hook: selected element ID, drag state, edit mode
```

### Coordinate Math (Critical)

Slide renders at 1080x1350 but displayed scaled (e.g., 0.4x). Mouse events in screen coordinates:

```typescript
// Screen to slide coordinate conversion
const slideX = (mouseX - canvasRect.left) / previewScale;
const slideY = (mouseY - canvasRect.top) / previewScale;

// On drag start: record offset from element origin
const offsetX = slideX - element.x;
const offsetY = slideY - element.y;

// On drag move: new position = mouse position - offset
element.x = slideX - offsetX;
element.y = slideY - offsetY;

// Snap to 8px grid (base unit from DESIGN_SYSTEM.md)
element.x = Math.round(element.x / 8) * 8;
element.y = Math.round(element.y / 8) * 8;
```

### Export Compatibility

Editor overlay is hidden on export. The hidden off-screen slides (already used for export) render WITHOUT editor UI. No change to the html-to-image pipeline.

## Build Phases

### Phase 6A: Editor State + Element Wrapper
- Add ElementOverride type to types/carousel.ts
- Add overrides to SlideData, editMode to CarouselState
- Build useEditorState hook (selectedElementId, isDragging, editMode, dragOffset)
- Build ElementWrapper component shell (click-to-select, hover outline, data-element-id)
- Update one renderer (HookSlide) as proof of concept

### Phase 6B: EditorCanvas + Selection Overlay
- EditorCanvas wraps SlidePreview with edit mode layer
- SelectionOverlay: blue dashed border + 8 resize handles on selected element
- Edit/Preview mode toggle button
- Update ALL 9 slide renderers to wrap elements in ElementWrapper
- Elements selectable with selection state visible

### Phase 6C: Drag-to-Move
- Mousedown/mousemove/mouseup drag behavior in ElementWrapper
- Screen-to-slide coordinate conversion with CSS transform scale factor
- Create/update ElementOverride on drag end
- Element with override: position absolute. Without: flexbox flow.
- Snap-to-grid (8px) with visual guide lines
- Shift disables snap for free positioning

### Phase 6D: Resize + Floating Toolbar
- DragHandle: corner + midpoint resize handles
- FloatingToolbar above selected element:
  - Font size (+/- buttons, step 2px)
  - Font weight toggle (400/500/700)
  - Color: 5 preset swatches + custom hex input
  - Text align: left/center toggle
  - Visibility: eye icon toggle
  - Reset: remove override, return to auto layout
- Toolbar repositions intelligently (flips below if near top edge)

### Phase 6E: Inline Text Editing
- Double-click text element -> contentEditable mode
- Styled to match slide element exactly (font, size, color, width)
- On blur or Cmd+Enter: write text back to SlideData
- Sync ContentInput textarea with changes
- Escape: cancel edit, revert text

### Phase 6F: Polish + QA
- Undo/redo covers all editor actions
- Cursor states: default/pointer/grab/grabbing/text/resize
- Keyboard: Delete hides, Escape deselects, Tab cycles, Arrow nudges (1px, 8px with Shift)
- No editor on < 1200px screens

## gstack Workflow

```
/office-hours        - Describe visual editor, challenge scope
/plan-ceo-review     - Full editor v1 or phase it?
/plan-eng-review     - Lock coordinate math, state model, drag behavior

Phase 6A -> /review
Phase 6B -> /review + /design-review
Phase 6C -> /review + /qa localhost
Phase 6D -> /review + /design-review
Phase 6E -> /review
Phase 6F -> /review + /qa + /codex -> /ship
```

## What NOT to Build (v1 editor)
- No layers panel
- No grouping/ungrouping
- No image upload or custom shapes
- No animation/transition editing
- No collaborative editing
- No ruler/guides beyond snap-to-grid
- No multi-element selection
- No copy-paste elements between slides
