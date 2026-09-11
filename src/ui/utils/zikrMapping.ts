/**
 * Zikr display adapter.
 *
 * Display data (Arabic text, names/meanings, default targets, Quick Start
 * flag) lives on the Zikr records themselves — seeded from the core catalog
 * for predefined zikrs, user-entered for custom ones. This module only maps
 * a record (or a bare predefined name) to language-aware display info.
 */

import type { Lang } from '../../core/i18n';
import {
  ZIKR_CATALOG,
  ZIKR_CATALOG_BY_NAME,
  fallbackDisplayInfo,
  ZikrDisplayInfo,
} from '../../core/data/zikrCatalog';

export type { ZikrDisplayInfo };

/** Minimal record shape needed for display. */
export interface ZikrDisplaySource {
  name: string;
  nameBn?: string;
  arabicText?: string;
  translation?: string;
  translationBn?: string;
  defaultTarget?: number;
  isQuickStarter?: boolean;
}

/**
 * Display info for a Zikr record. Record fields win (custom zikrs carry
 * user-entered content); the catalog fills gaps for predefined zikrs that
 * predate the schema move.
 */
export function getZikrDisplayInfoFromZikr(zikr: ZikrDisplaySource, lang: Lang = 'en'): ZikrDisplayInfo {
  const entry = ZIKR_CATALOG_BY_NAME.get(zikr.name);
  if (entry == null && zikr.arabicText == null && zikr.translation == null) {
    return fallbackDisplayInfo(zikr.name, lang);
  }
  return {
    localizedName: lang === 'bn' ? (zikr.nameBn ?? zikr.name) : zikr.name,
    arabicText: zikr.arabicText ?? entry?.arabicText ?? '',
    translation: lang === 'bn'
      ? (zikr.translationBn ?? zikr.translation ?? entry?.translationBn ?? fallbackDisplayInfo(zikr.name, lang).translation)
      : (zikr.translation ?? entry?.translation ?? fallbackDisplayInfo(zikr.name, lang).translation),
    defaultTarget: zikr.defaultTarget ?? entry?.defaultTarget ?? 33,
    isQuickStarter: zikr.isQuickStarter ?? entry?.isQuickStarter ?? false,
  };
}

/**
 * Display info for a bare predefined zikr name (catalog lookup).
 * Only for callers that hold a name, not a record — e.g. pickers.
 */
export function getZikrDisplayInfo(name: string, lang: Lang = 'en'): ZikrDisplayInfo {
  const entry = ZIKR_CATALOG_BY_NAME.get(name);
  if (!entry) return fallbackDisplayInfo(name, lang);
  return {
    localizedName: lang === 'bn' ? entry.nameBn : name,
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
  return ZIKR_CATALOG.map(e => e.name);
}

/** Library zikrs curated for the Home Quick Start rail. */
export function getQuickStartZikrNames(): string[] {
  return ZIKR_CATALOG.filter(e => e.isQuickStarter).map(e => e.name);
}

export { ZIKR_CATALOG };
