/**
 * Internationalization configuration.
 * Supported locales and their display names.
 */

export const locales = [
  "en",
  "es",
  "fr",
  "de",
  "pt",
  "ja",
  "zh",
  "ar",
  "ko",
  "ru",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espa\u00f1ol",
  fr: "Fran\u00e7ais",
  de: "Deutsch",
  pt: "Portugu\u00eas",
  ja: "\u65e5\u672c\u8a9e",
  zh: "\u4e2d\u6587",
  ar: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
  ko: "\ud55c\uad6d\uc5b4",
  ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
};

export const rtlLocales: Locale[] = ["ar"];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
