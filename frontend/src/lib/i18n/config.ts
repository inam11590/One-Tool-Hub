export type SupportedLocale = "en" | "ur";

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  lang: string;
  flag: string;
  isDefault: boolean;
}

export const LOCALES: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    lang: "en",
    flag: "🇺🇸",
    isDefault: true,
  },
  ur: {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    dir: "rtl",
    lang: "ur",
    flag: "🇵🇰",
    isDefault: false,
  },
};

export const DEFAULT_LOCALE: SupportedLocale = "en";
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ["en", "ur"];

/**
 * Checks whether a candidate string is a supported locale.
 */
export function isSupportedLocale(candidate?: string | null): candidate is SupportedLocale {
  return candidate === "en" || candidate === "ur";
}

/**
 * Resolves the locale from a given pathname.
 * e.g. /ur/tools -> "ur", /tools -> "en"
 */
export function getLocaleFromPathname(pathname: string): SupportedLocale {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (clean === "/ur" || clean.startsWith("/ur/")) {
    return "ur";
  }
  return "en";
}

/**
 * Formats a localized path given an English route and target locale.
 * e.g. formatLocalizedPath("/tools/json-formatter", "ur") -> "/ur/tools/json-formatter"
 *      formatLocalizedPath("/ur/tools/json-formatter", "en") -> "/tools/json-formatter"
 */
export function formatLocalizedPath(path: string, targetLocale: SupportedLocale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  // Strip existing /ur prefix if present
  let basePath = clean;
  if (basePath === "/ur") {
    basePath = "/";
  } else if (basePath.startsWith("/ur/")) {
    basePath = basePath.slice(3);
  }

  if (targetLocale === "en") {
    return basePath;
  }

  // targetLocale === "ur"
  if (basePath === "/") {
    return "/ur";
  }
  return `/ur${basePath}`;
}
