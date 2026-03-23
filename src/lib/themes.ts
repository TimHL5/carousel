import type { Theme } from '@/types/carousel';

// 5 built-in themes — hex values from DESIGN_SYSTEM.md
// Each theme follows the restrained color approach: one accent + neutrals
export const THEMES: Theme[] = [
  {
    id: 'mlv-dark',
    name: 'MLV Dark',
    bg: '#0A0A0A',
    text: '#F5F5F5',
    accent: '#6AC670',
    secondary: '#9CA3AF',
    card: '#111118',
  },
  {
    id: 'mlv-light',
    name: 'MLV Light',
    bg: '#FAFAFA',
    text: '#111118',
    accent: '#2D6A4F',
    secondary: '#6B7280',
    card: '#FFFFFF',
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    bg: '#0F172A',
    text: '#F5F5F5',
    accent: '#38BDF8',
    secondary: '#94A3B8',
    card: '#1E293B',
  },
  {
    id: 'warm-minimal',
    name: 'Warm Minimal',
    bg: '#FFF8F0',
    text: '#1C1917',
    accent: '#EA580C',
    secondary: '#78716C',
    card: '#FFFFFF',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    bg: '#000000',
    text: '#FFFFFF',
    accent: '#FFFFFF',
    secondary: '#A1A1AA',
    card: '#111111',
  },
];

export const DEFAULT_THEME_ID = 'mlv-dark';

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}
