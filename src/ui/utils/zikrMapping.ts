/**
 * Zikr Mapping Utility
 * Maps predefined zikrs to their Arabic text, translations, and default target counts.
 * `lang` selects the meaning language ('en' | 'bn').
 * This is a temporary solution until the Zikr schema is extended
 */

import type { Lang } from '../../core/i18n';

export interface ZikrDisplayInfo {
  arabicText: string;
  translation: string;
  defaultTarget: number;
}

interface ZikrMeanings {
  arabicText: string;
  translation: string;
  translationBn: string;
  defaultTarget: number;
}

const ZIKR_MAPPING: Record<string, ZikrMeanings> = {
  'SubhanAllah': {
    arabicText: 'سُبْحَانَ ٱللَّٰهِ',
    translation: 'Glory be to Allah',
    translationBn: 'আল্লাহ পবিত্র',
    defaultTarget: 33,
  },
  'Alhamdulillah': {
    arabicText: 'ٱلْحَمْدُ لِلَّٰهِ',
    translation: 'All praise is for Allah',
    translationBn: 'সকল প্রশংসা আল্লাহর',
    defaultTarget: 33,
  },
  'Allahu Akbar': {
    arabicText: 'ٱللَّٰهُ أَكْبَرُ',
    translation: 'Allah is the Greatest',
    translationBn: 'আল্লাহ সর্বশ্রেষ্ঠ',
    defaultTarget: 34,
  },
  'La ilaha illallah': {
    arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    translation: 'There is no god but Allah',
    translationBn: 'আল্লাহ ছাড়া কোনো উপাস্য নেই',
    defaultTarget: 100,
  },
  'Astaghfirullah': {
    arabicText: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    translation: 'I seek forgiveness from Allah',
    translationBn: 'আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি',
    defaultTarget: 100,
  },
  'Salawat': {
    arabicText: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    translation: 'O Allah, bless Muhammad',
    translationBn: 'হে আল্লাহ, মুহাম্মদের উপর রহমত বর্ষণ করুন',
    defaultTarget: 100,
  },
};

/**
 * Get display info for a zikr by name.
 * Returns default values if zikr is not found (for custom zikrs).
 */
export function getZikrDisplayInfo(name: string, lang: Lang = 'en'): ZikrDisplayInfo {
  const entry = ZIKR_MAPPING[name];
  if (!entry) {
    return {
      arabicText: '',
      translation: lang === 'bn' ? 'কাস্টম জিকির' : 'Custom dhikr',
      defaultTarget: 33,
    };
  }
  return {
    arabicText: entry.arabicText,
    translation: lang === 'bn' ? entry.translationBn : entry.translation,
    defaultTarget: entry.defaultTarget,
  };
}

/**
 * Get all predefined zikr names
 */
export function getPredefinedZikrNames(): string[] {
  return Object.keys(ZIKR_MAPPING);
}
