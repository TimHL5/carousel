import type { StyleVariant } from '@/types/carousel';

// 3 structural style variants — same content, different visual treatment
// Each changes decoration and progress indicators, not information architecture
export const STYLES: StyleVariant[] = [
  {
    id: 'clean-step',
    name: 'Clean Step',
    description: 'Left accent bar, background step numbers, dot indicator',
  },
  {
    id: 'bold-card',
    name: 'Bold Card',
    description: 'Content in rounded cards, pill step badges, slide counter',
  },
  {
    id: 'minimal-type',
    name: 'Minimal Type',
    description: 'Pure typography, no decoration, font weight contrast, progress bar',
  },
];

export const DEFAULT_STYLE_ID = 'clean-step';

export function getStyleById(id: string): StyleVariant | undefined {
  return STYLES.find((s) => s.id === id);
}
