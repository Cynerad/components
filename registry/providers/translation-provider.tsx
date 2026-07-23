import { createContext, ReactNode, useContext, useState } from "react";

export type LanguageType = "en" | "fa";

export type DirectionType = "ltr" | "rtl";

export type TranslationsType<T extends Record<string, string> = Record<string, string>> = Record<
  LanguageType,
  {
    dir: DirectionType;
    locale?: string;
    values: T;
  }
>;

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "fa", label: "Persian (فارسی)" },
] as const;

type LanguageContextType = {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children, defaultLanguage = "en" }: { children: ReactNode; defaultLanguage?: LanguageType }) {
  const [language, setLanguage] = useState<LanguageType>(defaultLanguage);

  const context = {
    language,
    setLanguage,
  };

  return <LanguageContext value={context}>{children}</LanguageContext>;
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  return context;
}

export function useTranslation<T extends Record<string, string>>(translations: TranslationsType<T>, defaultLanguage: LanguageType = "en") {
  const context = useLanguageContext();
  const [localLanguage, setLocalLanguage] = useState<LanguageType>(defaultLanguage);

  const language = context?.language ?? localLanguage;
  const setLanguage = context?.setLanguage ?? setLocalLanguage;

  const { dir, locale, values: t } = translations[language];
  return { language, setLanguage, dir, locale, t };
}
