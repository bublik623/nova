import { AvailableLanguage } from "@/types/Language";

export interface TranslationPageProps {
  nextSectionRoute: string;
  isSavingDraft: boolean;
  readonly: boolean;
}

export interface TranslationPageEvents {
  (e: "hasUnsavedChanges", hasUnsavedChanges: boolean): void;
}

export interface TranslationFormProps<T> {
  initialValues: T;
  curationValues: T;
  diffValues?: T;
  language: AvailableLanguage;
  hasDiff?: boolean;
  readonly?: boolean;
}
