export const languages = ['en', 'fr', 'de', 'es'] as const;
export type Language = typeof languages[number];

export const defaultLanguage: Language = 'en';

export function isValidLanguage(lang: string): lang is Language {
  return languages.includes(lang as Language);
}

export const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};
