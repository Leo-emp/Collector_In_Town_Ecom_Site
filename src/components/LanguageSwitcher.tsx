// Language switcher — client component that toggles between EN and MY
// Replaces the locale segment in the current URL path
"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Props: current locale + dictionary for labels
interface LanguageSwitcherProps {
  lang: string;
  dict: Dictionary;
}

export function LanguageSwitcher({ lang, dict }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Switch locale by replacing the /en or /my prefix in the URL
  // e.g. /en/products → /my/products
  const switchLocale = (newLocale: string) => {
    // Replace the first path segment (locale) with the new locale
    const newPath = pathname.replace(`/${lang}`, `/${newLocale}`);
    router.push(newPath);
  };

  // The other locale — if current is "en", show "my" and vice versa
  const otherLocale = lang === "en" ? "my" : "en";
  const otherLabel =
    lang === "en" ? dict.common.burmese : dict.common.english;

  return (
    <button
      onClick={() => switchLocale(otherLocale)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                 text-text-secondary hover:text-text-primary hover:bg-surface-hover
                 transition-colors border border-border"
      aria-label={`Switch to ${otherLabel}`}
    >
      {/* Globe icon — indicates language selection */}
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a14.25 14.25 0 014 9 14.25 14.25 0 01-4 9 14.25 14.25 0 01-4-9 14.25 14.25 0 014-9z"
        />
      </svg>
      <span>{otherLabel}</span>
    </button>
  );
}
