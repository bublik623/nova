import { ExperienceRawForm } from "@/stores/experience-raw";
import { ExperienceCurationForm } from "@/stores/experience-curation";

export type FormField<T = unknown, K = boolean | undefined> = {
  value: T;
  category?: string;
  validator?: (value: T) => boolean;
  required?: K;
  // here we could add:
  // initialValue: Readonly<T>
  // isModified: boolean - the diff between the initialValue and the currentValue
};

type GenericDocumentForm = ExperienceRawForm | ExperienceCurationForm | Record<string, FormField>;

export interface GenericDocument {
  data?: {
    updated_date?: string;
  };
  fields: GenericDocumentForm;
  modified: boolean | undefined;
}
