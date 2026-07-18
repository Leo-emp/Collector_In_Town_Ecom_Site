// Dictionary loader — imports JSON translation files based on locale
// Uses dynamic imports so only the requested locale's translations are loaded
// Marked as server-only to prevent translation files from bloating client bundles
import "server-only";

// Map of locale codes to their dictionary import functions
// Each function lazy-loads the JSON file only when that locale is requested
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((mod) => mod.default),
  my: () => import("./dictionaries/my.json").then((mod) => mod.default),
};

// Type for supported locales — derived from the dictionaries object keys
export type Locale = keyof typeof dictionaries;

// Type-guard — checks if a string is a valid locale
// Also narrows the type from string to Locale for TypeScript
export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

// All supported locales as an array — used by generateStaticParams
export const locales: Locale[] = Object.keys(dictionaries) as Locale[];

// Default locale — English
export const defaultLocale: Locale = "en";

// Load the dictionary for a given locale
// Returns a flat object of nested translation keys → translated strings
export const getDictionary = async (locale: Locale) => dictionaries[locale]();

// Type for the dictionary object — inferred from the English JSON
export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
