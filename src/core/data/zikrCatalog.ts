/**
 * Zikr catalog — the single source of truth for the predefined zikr library:
 * Arabic text, names and meanings in both app languages, sunnah default
 * targets, and the curated Quick Start flag.
 *
 * Lives in core (not ui) because the seeder writes this data onto the Zikr
 * records themselves; the UI reads it back from the records (zikrMapping is
 * a thin adapter on top of this).
 */

import type { Lang } from '../i18n';

export interface ZikrMeanings {
  nameBn: string;
  arabicText: string;
  translation: string;
  translationBn: string;
  defaultTarget: number;
  isQuickStarter: boolean;
}

const ZIKR_MAPPING: Record<string, ZikrMeanings> = {
  'SubhanAllah': {
    nameBn: 'সুবহানাল্লাহ',
    arabicText: 'سُبْحَانَ ٱللَّٰهِ',
    isQuickStarter: true,
    translation: 'Glory be to Allah',
    translationBn: 'আল্লাহ পবিত্র',
    defaultTarget: 33,
  },
  'Alhamdulillah': {
    nameBn: 'আলহামদুলিল্লাহ',
    arabicText: 'ٱلْحَمْدُ لِلَّٰهِ',
    isQuickStarter: true,
    translation: 'All praise is for Allah',
    translationBn: 'সকল প্রশংসা আল্লাহর',
    defaultTarget: 33,
  },
  'Allahu Akbar': {
    nameBn: 'আল্লাহু আকবার',
    arabicText: 'ٱللَّٰهُ أَكْبَرُ',
    isQuickStarter: true,
    translation: 'Allah is the Greatest',
    translationBn: 'আল্লাহ সর্বশ্রেষ্ঠ',
    defaultTarget: 34,
  },
  'La ilaha illallah': {
    nameBn: 'লা ইলাহা ইল্লাল্লাহ',
    arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    isQuickStarter: true,
    translation: 'There is no god but Allah',
    translationBn: 'আল্লাহ ছাড়া কোনো উপাস্য নেই',
    defaultTarget: 100,
  },
  'Astaghfirullah': {
    nameBn: 'আস্তাগফিরুল্লাহ',
    arabicText: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    isQuickStarter: true,
    translation: 'I seek forgiveness from Allah',
    translationBn: 'আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি',
    defaultTarget: 100,
  },
  'Salawat': {
    nameBn: 'সালাওয়াত',
    arabicText: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    isQuickStarter: true,
    translation: 'O Allah, bless Muhammad',
    translationBn: 'হে আল্লাহ, মুহাম্মদের উপর রহমত বর্ষণ করুন',
    defaultTarget: 100,
  },
  'Subhanallahi wa Bihamdihi': {
    nameBn: 'সুবহানাল্লাহি ওয়া বিহামদিহি',
    arabicText: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ',
    isQuickStarter: true,
    translation: 'Glory be to Allah and all praise is His',
    translationBn: 'সব প্রশংসাসহ আল্লাহ পবিত্র',
    defaultTarget: 100,
  },
  'Subhanallahi walhamdulillahi wa La ilaha illallahu wallahu Akbar': {
    nameBn: 'সুবহানাল্লাহি ওয়ালহামদুলিল্লাহ',
    arabicText: 'سُبْحَانَ ٱللَّٰهِ وَٱلْحَمْدُ لِلَّٰهِ وَلَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَٱللَّٰهُ أَكْبَرُ',
    isQuickStarter: false,
    translation: 'Glory, praise, oneness and greatness belong to Allah',
    translationBn: 'আল্লাহ পবিত্র, সকল প্রশংসা আল্লাহর, আল্লাহ ছাড়া কোনো উপাস্য নেই, আল্লাহ সর্বশ্রেষ্ঠ',
    defaultTarget: 100,
  },
  'La ilaha illallahu wahdahu la sharika lah': {
    nameBn: 'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু',
    arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    isQuickStarter: false,
    translation: 'Allah alone, no partner — His is the dominion and the praise',
    translationBn: 'একমাত্র আল্লাহই উপাস্য, কোনো অংশীদার নেই — রাজত্ব ও প্রশংসা তাঁরই',
    defaultTarget: 100,
  },
  'La hawla wa la quwwata illa Billah': {
    nameBn: 'লা হাওলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ',
    arabicText: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ',
    isQuickStarter: true,
    translation: 'There is no might except with Allah',
    translationBn: 'আল্লাহর সাহায্য ছাড়া কোনো শক্তি নেই',
    defaultTarget: 100,
  },
  'Allahumma Ajirni Minan-Nar': {
    nameBn: 'আল্লাহুম্মা আজিরনী মিনান নার',
    arabicText: 'ٱللَّٰهُمَّ أَجِرْنِي مِنَ ٱلنَّارِ',
    isQuickStarter: true,
    translation: 'O Allah, protect me from the Fire',
    translationBn: 'হে আল্লাহ, আমাকে আগুন থেকে হেফাজত করুন',
    defaultTarget: 7,
  },
  'Hasbiyallahu La ilaha illa Huwa': {
    nameBn: 'হাসবিয়াল্লাহ',
    arabicText: 'حَسْبِيَ ٱللَّٰهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ ٱلْعَرْشِ ٱلْعَظِيمِ',
    isQuickStarter: false,
    translation: 'Allah is sufficient for me; in Him I trust',
    translationBn: 'আল্লাহই আমার জন্য যথেষ্ট; আমি তাঁর উপরই ভরসা করি',
    defaultTarget: 7,
  },
  'Bismillahilladhi la Yadurru': {
    nameBn: 'বিসমিল্লাহিল্লাজি লা ইয়াদুররু',
    arabicText: 'بِسْمِ ٱللَّٰهِ ٱلَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي ٱلْأَرْضِ وَلَا فِي ٱلسَّمَاءِ وَهُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ',
    isQuickStarter: true,
    translation: "In Allah's name — nothing can harm",
    translationBn: 'আল্লাহর নামে — যাঁর নামে কিছুই ক্ষতি করতে পারে না',
    defaultTarget: 3,
  },
  'Radhitu Billahi Rabba': {
    nameBn: 'রাদিতু বিল্লাহি রাব্বা',
    arabicText: 'رَضِيتُ بِٱللَّٰهِ رَبًّا وَبِٱلْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّىٰ ٱللَّٰهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    isQuickStarter: false,
    translation: 'I am pleased with Allah as my Lord, Islam as my religion',
    translationBn: 'আল্লাহই আমার রব, ইসলামই আমার দীন, মুহাম্মদ ﷺ আমার নবী',
    defaultTarget: 3,
  },
  "Allahumma A'inni ala Dhikrika": {
    nameBn: 'আল্লাহুম্মা আইন্নি আলা জিক্রিকা',
    arabicText: 'ٱللَّٰهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    isQuickStarter: true,
    translation: 'O Allah, help me remember You, thank You, and worship You well',
    translationBn: 'হে আল্লাহ, আমাকে আপনার স্মরণ, শুকরিয়া ও সুন্দর ইবাদতে সাহায্য করুন',
    defaultTarget: 10,
  },
  'Sayyidul Istighfar': {
    nameBn: 'সাইয়েদুল ইস্তিগফার',
    arabicText: 'ٱللَّٰهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا ٱسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَٱغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ ٱلذُّنُوبَ إِلَّا أَنْتَ',
    isQuickStarter: true,
    translation: 'O Allah, You are my Lord — forgive me, for none forgives sins but You',
    translationBn: 'হে আল্লাহ, আপনিই আমার রব — আমাকে ক্ষমা করুন, ক্ষমাকারী কেবল আপনি',
    defaultTarget: 1,
  },
  "Hasbunallahu wa Ni'mal Wakeel": {
    nameBn: "হাসবুনাল্লাহু ওয়া নি'মাল ওয়াকিল",
    arabicText: 'حَسْبُنَا ٱللَّٰهُ وَنِعْمَ ٱلْوَكِيلُ',
    isQuickStarter: false,
    translation: 'Allah is sufficient for us, and He is the best Disposer',
    translationBn: 'আল্লাহই আমাদের জন্য যথেষ্ট, তিনিই শ্রেষ্ঠ অভিভাবক',
    defaultTarget: 33,
  },
};

export const ZIKR_CATALOG: Array<ZikrMeanings & { name: string }> =
  Object.entries(ZIKR_MAPPING).map(([name, v]) => ({ name, ...v }));

export const ZIKR_CATALOG_BY_NAME = new Map(ZIKR_CATALOG.map(e => [e.name, e]));

/** Resolved display info for a zikr in a given language. */
export interface ZikrDisplayInfo {
  /** Zikr name in the selected language (Bangla name when lang is 'bn'). */
  localizedName: string;
  arabicText: string;
  translation: string;
  defaultTarget: number;
  /** Curated daily starter set — shown in the Home Quick Start rail. */
  isQuickStarter: boolean;
}

export function fallbackDisplayInfo(name: string, lang: Lang): ZikrDisplayInfo {
  return {
    localizedName: name,
    arabicText: '',
    translation: lang === 'bn' ? 'কাস্টম জিকির' : 'Custom dhikr',
    defaultTarget: 33,
    isQuickStarter: false,
  };
}
