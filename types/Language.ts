export const AVAILABLE_LANGUAGES = [
  "en",
  "es",
  "it",
  "de",
  "fr",
  "nl",
  "pl",
  "pt",
  "ru",
  "dk",
  "no",
  "fi",
  "se",
] as const;

export type AvailableLanguage = (typeof AVAILABLE_LANGUAGES)[number];
