/**
 * Zikr Mapping Utility
 * Maps predefined zikrs to their Arabic text, translations, and default target counts
 * This is a temporary solution until the Zikr schema is extended
 */

export interface ZikrDisplayInfo {
  arabicText: string;
  translation: string;
  defaultTarget: number;
}

const ZIKR_MAPPING: Record<string, ZikrDisplayInfo> = {
  'SubhanAllah': {
    arabicText: 'سُبْحَانَ ٱللَّٰهِ',
    translation: 'Glory be to Allah',
    defaultTarget: 33,
  },
  'Alhamdulillah': {
    arabicText: 'ٱلْحَمْدُ لِلَّٰهِ',
    translation: 'Praise be to Allah',
    defaultTarget: 33,
  },
  'Allahu Akbar': {
    arabicText: 'ٱللَّٰهُ أَكْبَرُ',
    translation: 'Allah is the Greatest',
    defaultTarget: 34,
  },
  'La ilaha illallah': {
    arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    translation: 'There is no god but Allah',
    defaultTarget: 100,
  },
  'Astaghfirullah': {
    arabicText: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    translation: 'I seek forgiveness from Allah',
    defaultTarget: 100,
  },
  'Salawat': {
    arabicText: 'صَلَّى ٱللَّٰهُ عَلَيْهِ وَسَلَّمَ',
    translation: 'May Allah bless him and grant him peace',
    defaultTarget: 10,
  },
};

/**
 * Get display info for a zikr by name
 * Returns default values if zikr is not found (for custom zikrs)
 */
export function getZikrDisplayInfo(name: string): ZikrDisplayInfo {
  return ZIKR_MAPPING[name] || {
    arabicText: '',
    translation: 'Custom dhikr',
    defaultTarget: 33,
  };
}

/**
 * Get all predefined zikr names
 */
export function getPredefinedZikrNames(): string[] {
  return Object.keys(ZIKR_MAPPING);
}
