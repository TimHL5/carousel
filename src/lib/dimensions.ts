import type { ExportPreset } from '@/types/carousel';

// 5 export presets — platform-native dimensions for carousel slides
export const PRESETS: ExportPreset[] = [
  {
    id: 'ig-square',
    name: 'Instagram Square',
    width: 1080,
    height: 1080,
    platform: 'Instagram',
  },
  {
    id: 'ig-portrait',
    name: 'Instagram Portrait',
    width: 1080,
    height: 1350,
    platform: 'Instagram',
  },
  {
    id: 'li-square',
    name: 'LinkedIn Square',
    width: 1080,
    height: 1080,
    platform: 'LinkedIn',
  },
  {
    id: 'li-portrait',
    name: 'LinkedIn Portrait',
    width: 1080,
    height: 1350,
    platform: 'LinkedIn',
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    width: 1200,
    height: 675,
    platform: 'Twitter/X',
  },
];

export const DEFAULT_PRESET_ID = 'ig-portrait';

export function getPresetById(id: string): ExportPreset | undefined {
  return PRESETS.find((p) => p.id === id);
}
