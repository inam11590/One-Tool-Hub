"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  LOCALES,
  SUPPORTED_LOCALES,
  formatLocalizedPath,
  getLocaleFromPathname,
  type SupportedLocale,
} from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = getLocaleFromPathname(pathname || "/");

  const handleLocaleChange = (newLocale: SupportedLocale) => {
    if (newLocale === currentLocale) return;
    const targetPath = formatLocalizedPath(pathname || "/", newLocale);
    router.push(targetPath);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1 text-xs text-slate-700 shadow-2xs">
      <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
      <span className="sr-only">زبان تبدیل کریں / Change Language</span>
      <div className="flex items-center gap-1">
        {SUPPORTED_LOCALES.map((localeCode) => {
          const config = LOCALES[localeCode];
          const isActive = currentLocale === localeCode;

          return (
            <button
              key={localeCode}
              type="button"
              onClick={() => handleLocaleChange(localeCode)}
              aria-pressed={isActive}
              className={`rounded px-1.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {config.nativeName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
