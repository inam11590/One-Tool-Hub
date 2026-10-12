import { EN_DICTIONARY } from "./dictionaries/en.ts";
import { UR_DICTIONARY } from "./dictionaries/ur.ts";
import { DEFAULT_LOCALE, type SupportedLocale } from "./config.ts";
import type { TranslationDictionary } from "./types.ts";

const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  en: EN_DICTIONARY,
  ur: UR_DICTIONARY,
};

/**
 * Returns the dictionary for the specified locale, falling back to English.
 */
export function getDictionary(locale: SupportedLocale = DEFAULT_LOCALE): TranslationDictionary {
  return DICTIONARIES[locale] ?? EN_DICTIONARY;
}
