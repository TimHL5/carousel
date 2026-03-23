# VISUAL EDITOR — Build Prompts for Claude Code

Copy-paste these into Claude Code in order.
Wait for each to complete before pasting the next.

═══════════════════════════════════════
STEP 0: PLANNING (run before any code)
═══════════════════════════════════════

PROMPT 0A:

/office-hours

When it asks for context, type:

I want to add a Canva-like visual editor to the MLV Carousel Generator. Read EDITOR_PLAN.md for the full feature spec. Currently the tool has a text parser that creates slides, and users customize via settings panel controls (alignment, padding, font scale). I want to add a direct manipulation layer: click elements to select, drag to reposition, double-click to edit text, resize handles, floating toolbar for font/color. The parser still works as the primary input — the editor lets users fine-tune from there. The key architectural decision is a hybrid rendering model: elements without overrides stay in flexbox, elements with overrides switch to absolute positioning. This means the parser pipeline is unchanged and export works identically.

---

PROMPT 0B:

/plan-ceo-review

---

PROMPT 0C:

/plan-eng-review

Focus on: the coordinate math for screen-to-slide conversion with CSS transform scaling, the hybrid flexbox/absolute positioning model, how ElementOverride interacts with the existing SlideData/CarouselState, and how the editor layer integrates with the existing hidden off-screen export pipeline.

---

═══════════════════════════════════════
PHASE 6A: EDITOR STATE + ELEMENT WRAPPER
═══════════════════════════════════════

PROMPT 6A:

Read EDITOR_PLAN.md. Start Phase 6A: Editor State + Element Wrapper.

1. Add to src/types/carousel.ts:
   - ElementOverride interface (id, x, y, width, height, fontSize, fontWeight, color, visible, rotation)
   - Add overrides?: ElementOverride[] to SlideData
   - Add editMode: boolean to CarouselState
   - Add reducer actions: SET_EDIT_MODE, SET_ELEMENT_OVERRIDE, REMOVE_ELEMENT_OVERRIDE, SET_SELECTED_ELEMENT

2. Build src/components/editor/useEditorState.ts:
   - Custom hook managing: selectedElementId, isDragging, dragStart, isEditing
   - Handlers: onElementClick, onElementDoubleClick, onCanvasClick (deselect), onDragStart, onDragEnd

3. Build src/components/editor/ElementWrapper.tsx:
   - Wraps any children with a div that has data-element-id attribute
   - In edit mode: shows hover outline on mouseover, click selects, adds appropriate cursor
   - If the element has an override with x/y: renders with position absolute at those coordinates
   - If no override: renders normally in the flexbox flow
   - Does NOT handle drag yet (Phase 6C) — just selection

4. Update one slide renderer (HookSlide.tsx) as proof of concept:
   - Wrap headline, sub, and cta each in an ElementWrapper
   - Verify selection works on localhost

Make sure npm run build succeeds.

---

PROMPT 6A-REVIEW:

/review

---

═══════════════════════════════════════
PHASE 6B: EDITOR CANVAS + SELECTION OVERLAY
═══════════════════════════════════════

PROMPT 6B:

Phase 6A complete. Start Phase 6B: EditorCanvas + Selection Overlay.

1. Build src/components/editor/EditorCanvas.tsx:
   - Replaces the current SlidePreview as the main preview component when editMode is true
   - When editMode is false, renders the existing SlidePreview unchanged
   - When editMode is true: renders the slide with ElementWrappers active, adds SelectionOverlay on top
   - Manages the coordinate system: stores canvasRect and previewScale for child components

2. Build src/components/editor/SelectionOverlay.tsx:
   - Absolutely positioned over the canvas
   - When an element is selected: draws a blue dashed border (2px, #38BDF8) around the element's bounding rect
   - Shows 8 resize handles: 4 corners + 4 midpoints (small white squares with blue border, 8x8px)
   - Handles are visual only in this phase — no drag behavior yet

3. Add Edit/Preview toggle to the navigation bar below the slide preview:
   - Two-state toggle: "Edit" and "Preview"
   - Edit mode: shows element selection UI, hover outlines
   - Preview mode: clean view, no editor chrome (current behavior)
   - Default: Preview mode

4. Update ALL 9 slide renderers (not just HookSlide) to wrap their elements in ElementWrapper.
   Each text element gets a unique id:
   - HookSlide: "headline", "sub", "cta"
   - StepSlide: "step-label", "headline", "body", "step-num-bg"
   - SplitSlide: "headline", "left-col", "right-col"
   - ResultSlide: "headline", "body"
   - ConceptSlide: "label", "headline", "body"
   - CloseSlide: "headline", "sub", "logo-mark"
   - CloseCTASlide: "headline", "sub", "cta-button", "logo-mark"
   - QuoteSlide: "quote-text", "attribution", "quote-bar"
   - TextSlide: "headline", "body"
   ElementWrapper only renders interactive behavior when editMode is true.

Make sure npm run build succeeds. Test in browser: toggle edit mode, click elements, see selection boxes.

---

PROMPT 6B-REVIEW:

/review

---

PROMPT 6B-DESIGN:

/design-review

Focus on: selection box styling, handle design, edit/preview toggle button design. Should match the Industrial Minimal aesthetic from DESIGN_SYSTEM.md.

---

═══════════════════════════════════════
PHASE 6C: DRAG-TO-MOVE
═══════════════════════════════════════

PROMPT 6C:

Phase 6B complete. Start Phase 6C: Drag-to-Move.

1. Add drag behavior to ElementWrapper:
   - On mousedown on a selected element: start drag (record mouse offset from element origin)
   - On mousemove: update element visual position in real-time (transform or left/top)
   - On mouseup: commit position — dispatch SET_ELEMENT_OVERRIDE with final x, y
   - Critical math: convert screen coordinates to slide coordinates by dividing by previewScale
   - Get previewScale from EditorCanvas context or prop

2. When an element gets an override with x/y:
   - Switch its rendering from position:relative (flexbox flow) to position:absolute
   - Position at the override coordinates within the slide
   - Other elements without overrides stay in flexbox — they reflow to fill the gap

3. Snap-to-grid:
   - 8px grid snap (base spacing unit from DESIGN_SYSTEM.md)
   - Hold Shift to disable snap (free positioning)
   - Show subtle guide lines at snap points during drag (thin lines, accent color at 20% opacity)

4. Visual feedback:
   - Cursor: grab on hover, grabbing during drag
   - Element has slight opacity reduction (0.9) during drag
   - Drop shadow during drag: 0 4px 12px rgba(0,0,0,0.3)

5. "Reset to auto" action:
   - When user right-clicks a moved element: show a small context menu with "Reset position"
   - Remove the ElementOverride, element returns to its flexbox position

6. IMPORTANT: Make sure the hidden export slides (off-screen container used by html-to-image) do NOT render ElementWrapper in edit mode — they always render in preview/export mode so exported PNGs are clean. But they DO apply position overrides (elements with x/y overrides render at absolute positions in export too).

Make sure npm run build succeeds.

---

PROMPT 6C-REVIEW:

/review

---

PROMPT 6C-QA:

/qa http://localhost:3000

Test: drag an element, verify it moves correctly. Drag multiple elements on same slide. Switch slides and verify overrides persist. Export a slide with overrides and verify the exported PNG has elements at the right positions. Test at different dimension presets (1080x1080 vs 1080x1350).

---

═══════════════════════════════════════
PHASE 6D: RESIZE + FLOATING TOOLBAR
═══════════════════════════════════════

PROMPT 6D:

Phase 6C complete. Start Phase 6D: Resize + Floating Toolbar.

1. Build src/components/editor/DragHandle.tsx:
   - 8 handles on the selection overlay (4 corners + 4 midpoints)
   - Drag a corner: resize proportionally (maintain aspect ratio if Shift held)
   - Drag a midpoint: resize in one dimension only (horizontal or vertical)
   - On resize end: update width/height in ElementOverride
   - Cursor for each handle: nw-resize, n-resize, ne-resize, e-resize, se-resize, s-resize, sw-resize, w-resize

2. Build src/components/editor/FloatingToolbar.tsx:
   - Appears 8px above the selected element's bounding box
   - If too close to top edge of slide: appears below instead
   - Controls (all apply immediately, no save button):
     * Font size: number input with +/- buttons (step: 2px)
     * Font weight: three toggle buttons [Light] [Medium] [Bold] mapping to 400/500/700
     * Color: 5 preset swatches (theme.accent, theme.text, theme.secondary, #FFFFFF, #000000) + small hex input field
     * Text align: [Left] [Center] icon toggle
     * Visibility: eye/eye-off icon toggle (sets visible: false/true in override)
     * Reset: ↩ icon button — removes ALL overrides for this element, returns to auto layout
   - Styling: dark surface (#111118), 1px border rgba(255,255,255,0.08), 8px border-radius, compact height (36px)
   - Each change dispatches SET_ELEMENT_OVERRIDE to the reducer

3. Connect toolbar to element state:
   - When an element is selected, toolbar shows that element's current values
   - If element has overrides: show override values
   - If no overrides: show the default values from theme/style (font size from DESIGN_SYSTEM.md scale, color from theme, etc.)

---

PROMPT 6D-REVIEW:

/review

---

PROMPT 6D-DESIGN:

/design-review

Focus on: FloatingToolbar design, resize handle styling, visual consistency with the Industrial Minimal aesthetic from DESIGN_SYSTEM.md. Toolbar should feel native to the app, not like a bolt-on.

---

═══════════════════════════════════════
PHASE 6E: INLINE TEXT EDITING
═══════════════════════════════════════

PROMPT 6E:

Phase 6D complete. Start Phase 6E: Inline Text Editing.

1. In ElementWrapper, on double-click of a text element (headline, body, sub, cta, label, attribution):
   - Switch the element to contentEditable mode
   - Style the contentEditable div to match the slide element exactly: same font size, weight, color, width, padding, line-height
   - Show a blue border (2px solid #38BDF8) to indicate edit mode
   - Focus the element and select all text
   - Hide the FloatingToolbar while editing (or keep it but disable drag)

2. On blur or Cmd+Enter:
   - Read the innerText from the contentEditable div
   - Dispatch an action that updates the corresponding SlideData field (e.g., editing "headline" updates slide.headline)
   - Exit contentEditable mode
   - Re-serialize: update the ContentInput textarea to reflect the change (convert the modified CarouselData back to the HEADLINE:/BODY: text format)

3. On Escape:
   - Cancel the edit
   - Revert the text to what it was before editing started
   - Exit contentEditable mode

4. Edge cases:
   - Multi-line text (body): preserve line breaks as newlines in the SlideData
   - Empty text after edit: keep the element but show at 30% opacity as a placeholder
   - Prevent drag during text editing (isDragging should not activate while isEditing is true)
   - Don't allow double-click on non-text elements (accent-bar, dot-indicator, step-num-bg)

---

PROMPT 6E-REVIEW:

/review

---

═══════════════════════════════════════
PHASE 6F: POLISH + QA + SHIP
═══════════════════════════════════════

PROMPT 6F:

Phase 6E complete. Final polish for the visual editor.

1. Undo/redo: verify that ALL editor actions are captured by the existing HistoryState wrapper:
   - Element position changes (drag-to-move)
   - Element resize (drag handles)
   - Element style changes (FloatingToolbar)
   - Inline text edits
   - Visibility toggles
   - Reset to auto
   Cmd+Z / Cmd+Shift+Z should work for all of these.

2. Cursor states throughout the editor:
   - Default cursor on canvas background
   - Pointer on hoverable elements in edit mode
   - Grab on selected element (ready to drag)
   - Grabbing during active drag
   - Text cursor when in contentEditable mode
   - Appropriate resize cursors on each of the 8 drag handles

3. Keyboard shortcuts in edit mode:
   - Delete or Backspace: hide selected element (visible: false)
   - Escape: deselect element (or cancel text edit if editing)
   - Tab: cycle forward through elements on current slide
   - Shift+Tab: cycle backward
   - Arrow keys (when element selected, NOT editing text): nudge 1px
   - Shift+Arrow: nudge 8px (one grid unit)

4. Responsiveness: hide the Edit/Preview toggle on screens < 1200px. Editor requires desktop.

5. Performance: make sure dragging is smooth (no jank). Use requestAnimationFrame for drag updates if needed. Debounce state dispatches during drag — only commit on mouseup.

6. Make sure npm run build succeeds with zero errors and zero warnings.

---

PROMPT 6F-REVIEW:

/review

---

PROMPT 6F-QA:

/qa http://localhost:3000

Full editor workflow test:
- Toggle edit mode on
- Click elements on different slide types to verify selection works
- Drag headline to a new position, verify it stays there when navigating away and back
- Resize an element using corner handles
- Change font size and color via FloatingToolbar
- Double-click headline to edit text, type new text, press Cmd+Enter to commit
- Verify the ContentInput textarea updated to reflect the text change
- Switch theme — verify overrides (positions) persist but colors update to new theme
- Export as PNG — verify no editor UI (selection boxes, handles) in the exported image
- Verify overridden element positions ARE present in the exported image
- Undo (Cmd+Z) a drag — verify element returns to previous position
- Test all 9 slide types have their elements wrapped and selectable

---

PROMPT 6F-CODEX:

/codex

---

PROMPT 6F-SHIP:

/ship

---

PROMPT 6F-DOCS:

/document-release
