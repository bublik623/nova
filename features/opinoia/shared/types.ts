import { ExperienceState } from "@/features/experience-shared/utils/get-experience-state";
import { StatusCode } from "@/types/generated/ExperienceRawServiceApi";

export type DocumentType = "RAW_COMMERCIAL" | "OPERATIONAL";
export type DocumentState = StatusCode; // We will need to expand this with the OPERATIONAL statuses, for now this is only the raw statuses
export type Document<T extends DocumentType = DocumentType> = { type: T; state: DocumentState };
export type ExperienceDocuments = { [T in DocumentType]?: Document<T> };

export type OpinoiaExperience = {
  id: string;
  title: string;
  referenceCode: string;
  experienceState: ExperienceState;
  documents: ExperienceDocuments;
};
