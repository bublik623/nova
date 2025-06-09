"use strict";
export type Error = { code?: string; message?: string };
export type ExperienceCreate = {
  metadata: { supplier_id: SupplierId; experience_source: ExperienceSource };
  raw: { commercial: { title: Title } };
};
export type Experience = {
  id?: Id;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
  created_by_user?: CreatedByUser;
  updated_by_user?: UpdatedByUser;
  metadata?: Metadata;
  collection_criteria?: CollectionCriteria;
  legacy_adapter_information?: LegacyAdapterInformationV3;
  raw?: Raw;
  editorial?: Editorial;
};
export type Metadata = MetadataCreate &
  MetadataUpdate & {
    reference_code?: ReferenceCode;
    global_status?: GlobalStatus;
    imported?: Imported;
  };
export type MetadataCreate = {
  reference_code?: ReferenceCode;
  supplier_id?: SupplierId;
  experience_source?: ExperienceSource;
};
export type MetadataUpdate = {
  supplier_id?: SupplierId;
  external_reference_code?: ExternalReferenceCode;
  curation_level?: CurationLevel;
  priority?: Priority;
};
export type CollectionCriteria = unknown;
export type LegacyAdapterInformation = { asx_codes?: Array<AsxCode> };
export type LegacyAdapterInformationV3 = { asx_codes?: Array<AsxCodeV3> };
export type AsxCodeV3 = {
  service_code?: AsterixServiceCode;
  modality_codes?: Array<AsterixModalityCode>;
};
export type AsxCode = {
  code?: AsterixServiceCode;
  modality_codes?: Array<AsterixModalityCode>;
};
export type Raw = {
  id?: string;
  flow_code?: FlowCode;
  status_code?: StatusCode;
  functional?: FunctionalV3;
  commercial?: CommercialV3;
  media?: RawMediaV3;
  auto_publish_fields?: AutoPublishFields;
  manual_publish_fields?: ManualPublishFields;
};
export type Editorial = {
  media_content?: MediaDistribution;
  translations_content?: Array<TranslationDistribution>;
};
export type MediaDistribution = {
  id?: Id;
  status?: DistributionStatus;
  distribution_date?: DistributionDate;
};
export type TranslationDistribution = MediaDistribution & {
  language_code?: LanguageCode;
};
export type FunctionalV3 = {
  premades?: Premades;
  place?: Place;
  booking_information?: BookingInformationV3;
};
export type CommercialV3 = {
  title?: Title;
  description?: Description;
  additional_description?: AdditionalDescription;
  voucher_information?: InfoVoucher;
  meeting_point_details?: MeetingPointDetails;
  custom_highlights?: Array<CustomHighlights>;
  custom_included?: Array<CustomIncluded>;
  custom_non_included?: Array<CustomNonIncluded>;
  custom_important_information?: Array<CustomImportantInformation>;
};
export type Premades = unknown;
export type Place = unknown;
export type BookingInformationV3 = {
  voucher_type?: VoucherType;
  emergency_phone_code?: CountryCallingCode;
  emergency_phone_number?: PhoneNumber;
};
export type RawImageV3 = {
  file_name: FileName;
  preview_url: PreviewUrl;
  visualization_order?: VisualizationOrder;
  image_type?: ImageType;
  status?: ImageStatus;
  batch_id?: BatchId;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type RawMediaV3 = { images?: Array<RawImageV3> };
export type Commercial = {
  title: Title;
  description?: Description;
  additional_description?: AdditionalDescription;
  info_voucher?: InfoVoucher;
  meeting_point_details?: MeetingPointDetails;
  custom_highlights?: Array<CustomHighlights>;
  custom_included?: Array<CustomIncluded>;
  custom_non_included?: Array<CustomNonIncluded>;
  custom_important_information?: Array<CustomImportantInformation>;
};
export type CustomIncluded = {
  code?: string;
  name: string;
  visualization_order?: VisualizationOrder;
};
export type CustomNonIncluded = {
  code?: string;
  name: string;
  visualization_order?: VisualizationOrder;
};
export type CustomHighlights = {
  code?: string;
  name: string;
  visualization_order?: VisualizationOrder;
};
export type CustomImportantInformation = {
  code?: string;
  name: string;
  visualization_order?: VisualizationOrder;
};
export type CurationLevel =
  | "DEDICATED"
  | "FULL_CURATION"
  | "SOFT_CURATION"
  | "SELF_MANAGEMENT"
  | "TO_BE_DEDICATED"
  | "TO_BE_FULL_CURATED"
  | "TO_BE_SOFT_CURATED"
  | "TO_BE_SELF_MANAGED";
export type CountryCallingCode = string;
export type PhoneNumber = string;
export type Imported = boolean;
export type Priority = number;
export type AutoPublishFields = boolean;
export type ManualPublishFields = boolean;
export type Title = string;
export type Description = string;
export type SecondDescription = string;
export type ThirdDescription = string;
export type AdditionalDescription = string;
export type Highlights = Array<string>;
export type Included = Array<string>;
export type NonIncluded = Array<string>;
export type ImportantInformation = Array<string>;
export type Brand = string;
export type Promotional = string;
export type Classification = string;
export type Features = Array<string>;
export type Durations = Array<string>;
export type AdditionalServices = Array<string>;
export type Categories = Array<string>;
export type Interests = Array<string>;
export type Markets = Array<string>;
export type AdditionalCities = Array<string>;
export type Venues = Array<string>;
export type InfoVoucher = string;
export type MeetingPointDetails = string;
export type Option = { code: string; description: string };
export type FunctionalRaw = {
  asterix_id?: AsterixId;
  external_reference_code?: ExternalReferenceCode;
  core_id?: CoreId;
  options?: Array<Option>;
  highlights?: Highlights;
  included?: Included;
  non_included?: NonIncluded;
  important_information?: ImportantInformation;
  additional_services?: AdditionalServices;
  categories?: Categories;
  interests?: Interests;
  location?: Location;
  markets?: Markets;
  additional_cities?: AdditionalCities;
  booking_information?: BookingInformation;
  venues?: Venues;
};
export type CommercialRaw = {
  title: Title;
  description?: Description;
  additional_description?: AdditionalDescription;
  info_voucher?: InfoVoucher;
  meeting_point_details?: MeetingPointDetails;
  custom_highlights?: Array<CustomHighlights>;
  custom_included?: Array<CustomIncluded>;
  custom_non_included?: Array<CustomNonIncluded>;
  custom_important_information?: Array<CustomImportantInformation>;
};
export type RawElement = {
  id?: Id;
  experience_id: ExperienceId;
  functional?: FunctionalRaw;
  commercial: CommercialRaw;
  status_code: StatusCode;
  flow_code: FlowCode;
  collection_criteria?: CollectionCriteria;
  media?: RawMedia;
  legacy_adapter_information?: RawLegacyAdapterInformation;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type RawSnapshot = {
  id?: string;
  snapshot_date?: CreationDate;
  version_id?: string;
  user_version?: string;
  raw?: RawElement;
};
export type Snapshot = {
  id?: Id;
  reference_code?: ReferenceCode;
  experience_id?: ExperienceId;
  supplier_id?: SupplierId;
  version_id?: VersionId;
  version_status?: VersionStatus;
  user_version?: User;
  additional_notes?: string;
  experience_commercial_information?: ExperienceCommercialInformation;
  experience_functional_information?: ExperienceFunctionallInformation;
};
export type DistributionContent = {
  id?: Id;
  reference_code?: ReferenceCode;
  supplier_id?: SupplierId;
  experience_source?: ExperienceSource;
  media_content?: MediaContent;
  translation_content_list?: Array<TranslationContent>;
  global_status?: GlobalStatus;
  curation_level?:
    | "DEDICATED"
    | "FULL_CURATION"
    | "SOFT_CURATION"
    | "SELF_MANAGEMENT"
    | "TO_BE_DEDICATED"
    | "TO_BE_FULL_CURATED"
    | "TO_BE_SOFT_CURATED"
    | "TO_BE_SELF_MANAGED";
  priority?: number;
  imported?: boolean;
  operational_content?: OperationalContent;
};
export type GeneralInformation = {
  external_reference_code?: ExternalReferenceCode;
  categories?: Categories;
  interests?: Interests;
  markets?: Markets;
  features?: AdditionalServices;
  duration?: AdditionalServices;
  promotional_option?: AdditionalServices;
  product_brand?: AdditionalServices;
  emergency_contact_number?: ContactNumber;
  voucher_type?: VoucherType;
  location?: Location;
  additional_cities?: AdditionalCities;
  venues?: Venues;
};
export type ExperienceContent = {
  id: Id;
  supplier_id?: SupplierId;
  experience_source?: ExperienceSource;
  general_information?: GeneralInformation;
  media?: Media;
  translations?: Array<ExperienceContentTranslation>;
  version?: number;
};
export type MediaContent = {
  distribution_date?: DistributionDate;
  id?: Id;
  distribution_status?: DistributionStatus;
};
export type Image = {
  file_name?: FileName;
  preview_url?: PreviewUrl;
  visualization_order?: VisualizationOrder;
  image_type?: ImageType;
};
export type Media = { images?: Array<Image> };
export type OperationalContent = {
  id?: Id;
  distribution_status?: DistributionStatus;
  distribution_date?: DistributionDate;
};
export type RawMedia = { images?: Array<RawImage> };
export type RawImage = {
  file_name?: FileName;
  preview_url?: PreviewUrl;
  visualization_order?: VisualizationOrder;
  image_type?: ImageType;
  status?: ImageStatus;
  batch_id?: BatchId;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceContentImage = {
  file_name?: FileName;
  preview_url?: PreviewUrl;
  visualization_order?: VisualizationOrder;
  image_type?: ImageType;
  status?: ImageStatus;
  batch_id?: BatchId;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type RawLegacyAdapterInformation = {
  asx_codes?: Array<RawAsterixAdapterInformation>;
};
export type RawAsterixAdapterInformation = {
  code?: AsterixServiceCode;
  modality_codes?: Array<AsterixModalityCode>;
};
export type TranslationContent = {
  distribution_date?: DistributionDate;
  id?: Id;
  language_code: LanguageCode;
  distribution_status?: DistributionStatus;
};
export type ExperienceCommercialInformation = {
  experience_media?: ExperienceMedia;
  translations?: Array<Translation>;
};
export type ExperienceMedia = {
  id?: Id;
  flow_code?: FlowCode;
  status_code?: StatusCode;
  images?: Array<Image>;
};
export type Translation = {
  language_code?: LanguageCode;
  experience_translation?: ExperienceTranslation;
  customs?: CustomTranslations;
  asx_service_code_translations?: Array<AsxServiceCodeTranslation>;
  option_translations?: Array<OptionTranslation>;
};
export type OptionTranslation = {
  id?: Id;
  optionId?: string;
  asx_service_code_translation_id?: string;
  asx_modality_code?: string;
  automatic_translation?: AutomaticTranslation;
  flow_code?: FlowCode;
  status_code?: StatusCode;
  name?: Name;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type AsxServiceCodeTranslation = {
  id?: Id;
  code?: string;
  automatic_translation?: AutomaticTranslation;
  flow_code?: FlowCode;
  status_code?: StatusCode;
  name?: Name;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceTranslation = {
  id?: Id;
  title?: Title;
  text1?: Description;
  text2?: SecondDescription;
  text3?: ThirdDescription;
  seo_title?: Title;
  seo_description?: Description;
  info_voucher?: InfoVoucher;
  meeting_point_details?: MeetingPointDetails;
  flow_code?: FlowCode;
  status_code?: StatusCode;
  curation_quality?: CurationQuality;
  name?: Name;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type CustomTranslations = {
  custom_highlights?: Array<CustomContent>;
  custom_included?: Array<CustomContent>;
  custom_non_included?: Array<CustomContent>;
  custom_important_information?: Array<CustomContent>;
};
export type ExperienceContentTranslation = {
  language_code?: LanguageCode;
  title?: Title;
  text1?: Description;
  text2?: SecondDescription;
  text3?: ThirdDescription;
  seo_title?: Title;
  seo_description?: Description;
  info_voucher?: InfoVoucher;
  meeting_point_details?: MeetingPointDetails;
  description?: Description;
  highlights?: Highlights;
  included?: Included;
  non_included?: NonIncluded;
  important_information?: ImportantInformation;
  booking_questions?: BookingQuestion;
  option_translations?: Array<OptionTranslation>;
  asx_service_code_translations?: Array<AsxServiceCodeTranslation>;
};
export type CustomContent = {
  id?: Id;
  code?: Code;
  name?: Name;
  description?: Description;
  automatic_translation?: AutomaticTranslation;
  visualization_order?: VisualizationOrder;
  flow_code?: FlowCode;
  status_code?: StatusCode;
};
export type ExperienceFunctionallInformation = {
  highlights?: FunctionalItem;
  included?: FunctionalItem;
  excluded?: FunctionalItem;
  important_information?: FunctionalItem;
  additional_services?: FunctionalItem;
  categories?: FunctionalItem;
  interests?: FunctionalItem;
  markets?: FunctionalItem;
  additional_cities?: FunctionalItem;
  venues?: FunctionalItem;
  booking_information?: ExperienceBookingInformation;
  booking_questions?: Array<BookingQuestion>;
  location?: ExperienceLocation;
  external_reference_code?: ExternalReferenceCode;
};
export type FunctionalItem = {
  id?: Id;
  codes?: Array<Code>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceBookingInformation = {
  id?: Id;
  information?: BookingInformation;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type BookingInformation = {
  voucher_type?: VoucherType;
  emergency_contact_number?: ContactNumber;
};
export type ContactNumber = { country_calling_code: string; number: string };
export type LocationV3 = {
  latitude?: string;
  longitude?: string;
  altitude?: string;
  address?: string;
  city?: string;
  country?: string;
  country_name?: string;
  city_name?: string;
};
export type Location = {
  option_id?: OptionId;
  latitude?: string;
  longitude?: string;
  altitude?: string;
  name?: string;
  address?: Address;
};
export type ExperienceLocation = {
  id?: Id;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
} & Location;
export type Address = {
  direction?: string;
  city?: string;
  postal_code?: string;
  country?: string;
};
export type BookingQuestion = {
  id?: Id;
  option_id?: OptionId;
  questions?: Array<Question>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type Question = {
  code?: Code;
  is_mandatory?: boolean;
  is_apply_all?: boolean;
  visualization_order?: VisualizationOrder;
};
export type Import = {
  id?: Id;
  status?: ImportStatus;
  originalFileLocation?: string;
  reportFileLocation?: string;
  errorReportFileLocation?: string;
  originalFileUrl?: string;
  reportFileUrl?: string;
  errorReportFileUrl?: string;
  storageType?: StorageType;
  errorMessage?: string;
  endDate?: CreationDate;
  importHeaderMap?: {};
  serverUrl?: string;
  numberProcessed?: number;
  createdDate?: CreationDate;
  updatedDate?: UpdatedDate;
};
export type AsxExperience = {
  code?: string;
  incoming_office?: string;
  default_name?: string;
  reference_code?: string;
};
export type ModalityCodes = {
  code?: string;
  experience_id?: string;
  default_name?: string;
  linked?: boolean;
};
export type LanguageCode = string;
export type StatusCode = "IN_CREATION" | "BEING_CURATED" | "UP_TO_DATE" | "IN_REVIEW" | "SENT_TO_REVIEW" | "COMPLETED";
export type FlowCode = "BASE";
export type DistributionStatus = "NOT_READY" | "READY" | "SENT" | "UNPUBLISHED";
export type GlobalStatus = "NOT_READY" | "PUBLISHED" | "UNPUBLISHED";
export type ReferenceCode = string;
export type ExperienceSource = "SP" | "NOVA" | "SIP" | "ASX" | "NOVANET" | "INTERNAL";
export type SupplierId = string;
export type Id = string;
export type OptionId = string;
export type ExperienceId = string;
export type AsterixId = string;
export type ExternalReferenceCode = string;
export type CoreId = string;
export type User = string;
export type CreationDate = string;
export type UpdatedDate = string;
export type CreatedByUser = string;
export type UpdatedByUser = string;
export type DistributionDate = string;
export type VersionStatus = "ARCHIVED" | "ACTIVE";
export type VersionId = string;
export type VisualizationOrder = number;
export type BatchId = string;
export type ImageStatus = "MEDIA_PENDING" | "MEDIA_OK";
export type FileName = string;
export type PreviewUrl = string;
export type ImageType = "COVER" | "GALLERY";
export type CurationQuality = string;
export type Name = string;
export type Code = string;
export type AutomaticTranslation = boolean;
export type VoucherType = "MOBILE" | "PRINTED";
export type StorageType = "S3" | "LOCAL";
export type ImportStatus = "RUNNING" | "FINISHED" | "ERROR";
export type AsterixServiceCode = string;
export type AsterixModalityCode = string;
export type ExperienceExternalCatalog = {
  id?: string;
  sip_id?: string;
  supplier_id?: SupplierId;
  sip_name?: string;
  linked?: boolean;
  reference_code?: ReferenceCode;
  experience_id?: ExperienceId;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExternalCatalogLinkRequestDto = {
  experience_id: ExperienceId;
  reference_code: string;
  previous_link_id_to_remove?: string;
};
export type TranslationSnapshot = {
  id?: string;
  supplier_id?: SupplierId;
  experience_id?: ExperienceId;
  creation_date?: string;
  user_version?: string;
  modified_by_user?: string;
  version_status?: "ARCHIVED" | "ACTIVE" | "DRAFT";
  language_code?: string;
  flow_code?: string;
  status_code?: string;
  update_date?: string;
};
export type MediaSnapshot = {
  id?: Id;
  experience_id?: ExperienceId;
  supplier_id?: SupplierId;
  version_id?: VersionId;
  version_status?: VersionStatus;
  user_version?: User;
  creation_date?: string;
  media?: ExperienceMedia;
};
