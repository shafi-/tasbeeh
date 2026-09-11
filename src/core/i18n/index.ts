/**
 * i18n — tiny dictionary-based translation layer (zero dependencies).
 *
 * - Language lives in the settings store (`language`: 'en' | 'bn'), so it
 *   persists and is reactive through the same Zustand store as dark mode.
 * - Default is detected from the device (navigator.language starts with 'bn').
 * - `en` is the source of truth; missing `bn` keys fall back to English,
 *   and unknown keys render as themselves (never a crash).
 */

import { useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { en } from './locales.en';
import { bn } from './locales.bn';

export type Lang = 'en' | 'bn';
export const LANGUAGES: Array<{ code: Lang; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
];

const locales: Record<Lang, Partial<Record<string, string>>> = { en, bn };

export function detectLanguage(): Lang {
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('bn')) {
    return 'bn';
  }
  return 'en';
}

export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>
): string {
  const raw = locales[lang]?.[key] ?? locales.en[key] ?? key;
  if (!params) return raw;
  return Object.entries(params).reduce(
    // split/join instead of replaceAll: identical semantics, works with the
    // project's ES2020 lib target (replaceAll needs ES2021).
    (acc, [k, v]) => acc.split(`{{${k}}}`).join(String(v)),
    raw
  );
}

/** BCP-47 tag for date/number formatting. */
export function localeTag(lang: Lang): string {
  return lang === 'bn' ? 'bn-BD' : 'en-US';
}

/** Keep <html lang> in sync so fonts and screen readers follow the app language. */
export function applyDocumentLanguage(lang: Lang): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }
}

/**
 * Hook: returns the active language and a bound `t`.
 * Re-renders components when the language setting changes.
 */
export function useI18n(): { lang: Lang; t: (key: string, params?: Record<string, string | number>) => string } {
  const setting = useSettingsStore((s) => s.settings.language) as Lang | undefined;
  const lang: Lang = setting === 'bn' || setting === 'en' ? setting : detectLanguage();
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang]
  );
  return { lang, t };
}
