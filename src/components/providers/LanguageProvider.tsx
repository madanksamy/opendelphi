"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type Locale, defaultLocale, isRtl } from "@/lib/i18n/config";
import { t as translate } from "@/lib/i18n/translations";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key) => key,
  isRtl: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Load saved locale from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("opendelphi-locale") as Locale | null;
    if (saved) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("opendelphi-locale", newLocale);
    // Update document direction for RTL languages
    document.documentElement.dir = isRtl(newLocale) ? "rtl" : "ltr";
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string) => translate(key, locale),
    [locale]
  );

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t, isRtl: isRtl(locale) }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
