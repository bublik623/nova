import { ExperienceImage } from "@/features/experience-media/stores/useExperienceMediaStore";
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";
import { ExperienceStatusCode } from "@/types/DocumentStatuses";
import { MixedHighlightValue } from "@/types/Highlights";
import {
  Categories,
  FlowCode,
  Interests,
  VoucherType,
  RawAsterixAdapterInformation,
  ExperienceSource,
} from "@/types/generated/ExperienceRawServiceApi";
import { ContactNumber, ExperienceLocation } from "@/types/generated/MetadataExperiencesApi";

export interface RevisionOptions {
  showNatGeoField?: boolean;
  showAdditionalDescription?: boolean;
}

export type ExperienceRevision =
  | NovaExperienceRevision
  | SpExperienceRevision
  | AsterixExperienceRevision
  | SipExperienceRevision
  | OpinoiaExperienceRevision;

export type NovaExperienceRevision = BaseExperienceRevision<"NOVA"> & CommonExperienceData;
export type SpExperienceRevision = BaseExperienceRevision<"SP"> & CommonExperienceData;
export type AsterixExperienceRevision = BaseExperienceRevision<"ASX"> & CommonExperienceData & AsterixIntegrationData;
export type SipExperienceRevision = BaseExperienceRevision<"SIP"> & CommonExperienceData;
export type OpinoiaExperienceRevision = BaseExperienceRevision<"INTERNAL"> & CommonExperienceData;
export type MediaExperienceRevision = BaseExperienceRevision<any> & MediaData;

type BaseExperienceRevision<TProductType extends ExperienceSource> = {
  productType: TProductType;
  refCode?: string;
  revisionDate?: string;
  flowCode?: FlowCode;
  statusCode?: ExperienceStatusCode;
};

type CommonExperienceData = MediaData & SettingsData & LocationData & ContentSegmentationData & CustomerInfoData;

export type MediaData = {
  images?: ExperienceImage[];
};
export type SettingsData = {
  collectionCriteria?: {
    bestValueGuaranteed?: string;
    createdWithCare?: string;
    exceptionalExperiences?: string;
  };
  title?: string;
  supplierName?: string;
  externalReferenceCode?: string;
  seoTitle?: string;
  experienceCategory?: Categories;
  experienceInterest?: Interests;
  promotionalOption?: string;
  productBrand?: string;
  natGeoTourLevel?: string;
  ownOffer?: string;
};
export type LocationData = {
  location?: ExperienceLocation;
  meetingPointDetails?: string;
};
export type ContentSegmentationData = {
  description?: string;
  seoDescription?: string;
  additionalDescription?: string;
  features?: string[];
  highlights?: MixedHighlightValue;
  included?: MixedHighlightValue;
  nonIncluded?: MixedHighlightValue;
  importantInformation?: MixedHighlightValue;
  duration?: string[];
  markets?: string[];
};

export type CustomerInfoData = {
  emergencyContact?: ContactNumber;
  voucherType?: VoucherType;
  infoVoucher?: string;
};

export type AsterixIntegrationData = RawAsterixIntegrationData & CurationAsterixIntegrationData;

export type RawAsterixIntegrationData = {
  asx_codes?: Array<RawAsterixAdapterInformation>;
};

export type CurationAsterixIntegrationData = {
  serviceAndModalitiesTitleTranslationList?: ServiceAndModalitiesTitleListValue;
};
