import { z } from "zod";

export enum DocumentFlow {
  RAW = "RAW",
  CURATION = "CURATION",
  MANUAL_TRANSLATION = "MANUAL_TRANSLATION",
  AUTOTRANSLATION = "AUTOTRANSLATION",
  MEDIA = "MEDIA",
}

// ExperienceFlowCode
export const experienceFlowCodes = ["BASE", "CURATION", "MANUAL_TRANSLATION", "AUTOTRANSLATION", "MEDIA"] as const;
export type ExperienceFlowCode = (typeof experienceFlowCodes)[number];
export const ExperienceFlowCodeSchema = z.enum(experienceFlowCodes);

// ExperienceStatusCode
export const experienceStatusCodes = [
  "IN_CREATION",
  "BEING_CURATED",
  "UP_TO_DATE",
  "IN_REVIEW",
  "SENT_TO_REVIEW",
  "TO_BE_EDIT",
  "READY",
  "ARCHIVED",
] as const;
export type ExperienceStatusCode = (typeof experienceStatusCodes)[number];
export const ExperienceStatusCodeSchema = z.enum(experienceStatusCodes);

export enum RawStatusCode {
  IN_CREATION = "IN_CREATION",
  BEING_CURATED = "BEING_CURATED",
  UP_TO_DATE = "UP_TO_DATE",
  IN_REVIEW = "IN_REVIEW",
  SENT_TO_REVIEW = "SENT_TO_REVIEW",
}

export enum DocumentStatus {
  DRAFT = "DRAFT", // "In creation" in the frontend
  TO_BE_EDIT = "TO_BE_EDIT",
  IN_REVIEW = "IN_REVIEW",
  READY = "READY",
}

/**
 * Content type of a document
 */
export enum DocumentContentType {
  RAW = "raw",
  EDITORIAL = "editorial",
  TRANSLATION = "translation",
  MEDIA = "media",
}
export const DocumentContentTypeSchema = z.nativeEnum(DocumentContentType);
