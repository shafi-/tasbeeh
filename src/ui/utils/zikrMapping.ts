/**
 * Zikr Mapping Utility
 * Maps predefined zikrs to their Arabic text, meanings, and default target
 * counts. Counts follow well-known sunnah practice (e.g. 33/33/34 after
 * prayer, 100x morning/evening remembrances, 7x/3x protective adhkar).
 * `lang` selects the meaning language ('en' | 'bn').
 * This is a temporary solution until the Zikr schema is extended
 */

import type { Lang } from '../../core/i18n';

export interface ZikrDisplayInfo {
  arabicText: string;
  translation: string;
  defaultTarget: number;
  /** Curated daily starter set — shown in the Home Quick Start rail. */
  isQuickStarter: boolean;
}

interface ZikrMeanings {
  arabicText: string;
  translation: string;
  translationBn: string;
  defaultTarget: number;
  isQuickStarter: boolean;
}

const ZIKR_MAPPING: Record<string, ZikrMeanings> = {
  'SubhanAllah': {
    arabicText: 'سُبْحَانَ ٱللَّٰهِ',
    isQuickStarter: true,
    translation: 'Glory be to Allah',
    translationBn: 'আল্লাহ পবিত্র',
    defaultTarget: 33,
  },
  'Alhamdulillah': {
    arabicText: 'ٱلْحَمْدُ لِلَّٰهِ',
    isQuickStarter: true,
    translation: 'All praise is for Allah',
    translationBn: 'সকল প্রশংসা আল্লাহর',
    defaultTarget: 33,
  },
  'Allahu Akbar': {
    arabicText: 'ٱللَّٰهُ أَكْبَرُ',
    isQuickStarter: true,
    translation: 'Allah is the Greatest',
    translationBn: 'আল্লাহ সর্বশ্রেষ্ঠ',
    defaultTarget: 34,
  },
  'La ilaha illallah': {
    arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    isQuickStarter: true,
    translation: 'There is no god but Allah',
    translationBn: 'আল্লাহ ছাড়া কোনো উপাস্য নেই',
    defaultTarget: 100,
  },
  'Astaghfirullah': {
    arabicText: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    isQuickStarter: true,
    translation: 'I seek forgiveness from Allah',
    translationBn: 'আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি',
    defaultTarget: 100,
  },
  'Salawat': {
    arabicText: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    isQuickStarter: true,
    translation: 'O Allah, bless Muhammad',
    translationBn: 'হে আল্লাহ, মুহাম্মদের উপর রহমত বর্ষণ করুন',
    defaultTarget: 100,
  },
  'Subhanallahi wa Bihamdihi': {
    arabicText: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ',
    isQuickStarter: true,
    translation: 'Glory be to Allah and all praise is His',
    translationBn: 'সব প্রশংসাসহ আল্লাহ পবিত্র',
    defaultTarget: 100,
  },
  'Subhanallahi walhamdulillahi wa La ilaha illallahu wallahu Akbar': {
    arabicText: 'سُبْحَانَ ٱللَّٰهِ وَٱلْحَمْدُ لِلَّٰهِ وَلَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَٱللَّٰهُ أَكْبَرُ',
    isQuickStarter: false,
    translation: 'Glory, praise, oneness and greatness belong to Allah',
    translationBn: 'আল্লাহ পবিত্র, সকল প্রশংসা আল্লাহর, আল্লাহ ছাড়া কোনো উপাস্য নেই, আল্লাহ সর্বশ্রেষ্ঠ',
    defaultTarget: 100,
  },
  'La ilaha illallahu wahdahu la sharika lah': {
    arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    isQuickStarter: false,
    translation: 'Allah alone, no partner — His is the dominion and the praise',
    translationBn: 'একমাত্র আল্লাহই উপাস্য, কোনো অংশীদার নেই — রাজত্ব ও প্রশংসা তাঁরই',
    defaultTarget: 100,
  },
  'La hawla wa la quwwata illa Billah': {
    arabicText: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ',
    isQuickStarter: true,
    translation: 'There is no might except with Allah',
    translationBn: 'আল্লাহর সাহায্য ছাড়া কোনো শক্তি নেই',
    defaultTarget: 100,
  },
  'Allahumma Ajirni Minan-Nar': {
    arabicText: 'ٱللَّٰهُمَّ أَجِرْنِي مِنَ ٱلنَّارِ',
    isQuickStarter: true,
    translation: 'O Allah, protect me from the Fire',
    translationBn: 'হে আল্লাহ, আমাকে আগুন থেকে হেফাজত করুন',
    defaultTarget: 7,
  },
  'Hasbiyallahu La ilaha illa Huwa': {
    arabicText: 'حَسْبِيَ ٱللَّٰهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ ٱلْعَرْشِ ٱلْعَظِيمِ',
    isQuickStarter: false,
    translation: 'Allah is sufficient for me; in Him I trust',
    translationBn: 'আল্লাহই আমার জন্য যথেষ্ট; আমি তাঁর উপরই ভরসা করি',
    defaultTarget: 7,
  },
  'Bismillahilladhi la Yadurru': {
    arabicText: 'بِسْمِ ٱللَّٰهِ ٱلَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي ٱلْأَرْضِ وَلَا فِي ٱلسَّمَاءِ وَهُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ',
    isQuickStarter: true,
    translation: "In Allah's name — nothing can harm",
    translationBn: 'আল্লাহর নামে — যাঁর নামে কিছুই ক্ষতি করতে পারে না',
    defaultTarget: 3,
  },
  'Radhitu Billahi Rabba': {
    arabicText: 'رَضِيتُ بِٱللَّٰهِ رَبًّا وَبِٱلْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّىٰ ٱللَّٰهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    isQuickStarter: false,
    translation: 'I am pleased with Allah as my Lord, Islam as my religion',
    translationBn: 'আল্লাহই আমার রব, ইসলামই আমার দীন, মুহাম্মদ ﷺ আমার নবী',
    defaultTarget: 3,
  },
  "Allahumma A'inni ala Dhikrika": {
    arabicText: 'ٱللَّٰهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    isQuickStarter: true,
    translation: 'O Allah, help me remember You, thank You, and worship You well',
    translationBn: 'হে আল্লাহ, আমাকে আপনার স্মরণ, শুকরিয়া ও সুন্দর ইবাদতে সাহায্য করুন',
    defaultTarget: 10,
  },
  'Sayyidul Istighfar': {
    arabicText: 'ٱللَّٰهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا ٱسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَٱغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ ٱلذُّنُوبَ إِلَّا أَنْتَ',
    isQuickStarter: true,
    translation: 'O Allah, You are my Lord — forgive me, for none forgives sins but You',
    translationBn: 'হে আল্লাহ, আপনিই আমার রব — আমাকে ক্ষমা করুন, ক্ষমাকারী কেবল আপনি',
    defaultTarget: 1,
  },
  "Hasbunallahu wa Ni'mal Wakeel": {
    arabicText: 'حَسْبُنَا ٱللَّٰهُ وَنِعْمَ ٱلْوَكِيلُ',
    isQuickStarter: false,
    translation: 'Allah is sufficient for us, and He is the best Disposer',
    translationBn: 'আল্লাহই আমাদের জন্য যথেষ্ট, তিনিই শ্রেষ্ঠ অভিভাবক',
    defaultTarget: 33,
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
      isQuickStarter: false,
    };
  }
  return {
    arabicText: entry.arabicText,
    translation: lang === 'bn' ? entry.translationBn : entry.translation,
    defaultTarget: entry.defaultTarget,
    isQuickStarter: entry.isQuickStarter,
  };
}

/**
 * Get all predefined zikr names
 */
export function getPredefinedZikrNames(): string[] {
  return Object.keys(ZIKR_MAPPING);
}

/** Library zikrs curated for the Home Quick Start rail. */
export function getQuickStartZikrNames(): string[] {
  return Object.entries(ZIKR_MAPPING)
    .filter(([, v]) => v.isQuickStarter)
    .map(([name]) => name);
}
