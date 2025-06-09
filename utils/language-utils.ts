import { AVAILABLE_LANGUAGES, AvailableLanguage } from "@/types/Language";

/**
 * Type guard to check if a value is a valid AvailableLanguage
 */
export function isAvailableLanguage(value: unknown): value is AvailableLanguage {
  return typeof value === "string" && AVAILABLE_LANGUAGES.includes(value as AvailableLanguage);
}

/**
 * Checks if an array contains only valid AvailableLanguage values
 */
export function isArrayOfAvailableLanguages(languages: unknown): languages is AvailableLanguage[] {
  return Array.isArray(languages) && languages.every(isAvailableLanguage);
}
