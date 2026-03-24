// Core slide type union — maps to parser [type] tags
export type SlideType =
  | 'hook'
  | 'step'
  | 'split'
  | 'result'
  | 'concept'
  | 'close'
  | 'close-cta'
  | 'quote'
  | 'text';

// Per-element visual override — created when user drags/resizes/edits an element
// No override = default flexbox position. Override = absolute positioning.
export interface ElementOverride {
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

// Data for a single slide — all fields optional except type
// Parser populates what it finds; renderers handle missing fields gracefully
export interface SlideData {
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
  overrides?: ElementOverride[];  // per-element visual overrides from editor
}

// Complete parsed carousel — output of parser.parse()
export interface CarouselData {
  title: string;
  pillar?: string;
  type?: string;
  slides: SlideData[];
  caption?: string;
}

// Theme definition — 5 built-in + user-created custom themes
// All values are hex strings (no CSS variables — must serialize for html-to-image)
export interface Theme {
  id: string;
  name: string;
  bg: string;
  text: string;
  accent: string;
  secondary: string;
  card: string;
}

// Structural style variant — changes decoration, not content
export interface StyleVariant {
  id: string;
  name: string;
  description: string;
}

// Export dimension preset — platform-specific canvas sizes
export interface ExportPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  platform: string;
}

// Single source of truth for all app state
// All fields are serializable JSON — no class instances, no functions
// Backend-ready: can swap useReducer → localStorage → Supabase without rewriting components
export interface CarouselState {
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
  // Layout customization
  contentPadding: number;   // slide edge padding in px (base 1080), default 48
  contentGap: number;       // gap between text blocks in px, default 24
  accentBarWidth: number;   // accent bar width in px, 0 = hidden, default 4
  contentAlign: 'left' | 'center'; // text alignment, default 'left'
  verticalAlign: 'top' | 'center' | 'bottom'; // content vertical position, default 'center'
  bodyLineHeight: number;     // body text line-height, default 1.5
  bodyMaxWidth: number;       // body text max-width as percentage, default 85
  headlineScale: number;      // headline size multiplier, default 1.0
  // Editor
  editMode: boolean;            // toggle between preview and edit mode
  selectedElementId: string | null;  // currently selected element in editor
}

// Undo/redo history wrapper — separates UI concern from data model
// CarouselState stays clean for persistence; history is ephemeral
export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

// Props passed to every slide renderer component
// Renderers are presentational — no internal state, no side effects
export interface SlideProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  theme: Theme;
  style: StyleVariant;
  dimensions: { width: number; height: number };
  showLogo: boolean;
  fontScale: number;
  contentPadding: number;
  contentGap: number;
  accentBarWidth: number;
  contentAlign: 'left' | 'center';
  verticalAlign: 'top' | 'center' | 'bottom';
  bodyLineHeight: number;
  bodyMaxWidth: number;
  headlineScale: number;
  editMode: boolean;
  selectedElementId: string | null;
  onElementSelect?: (elementId: string | null) => void;
}
