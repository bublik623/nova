"use strict";
export type Error = { code?: string; message?: string };
export type StatusAllowed = Array<StatusId>;
export type TransitionFlow = {
  statuses_backward_allowed?: TransitionsArray;
  statuses_forward_allowed?: TransitionsArray;
};
export type Flow = {
  id: IdReadonly;
  code: Code;
  status_allowed?: StatusAllowed;
  init_status: InitStatus;
  end_status: EndStatus;
  alternative_status?: AlternativeStatus;
};
export type ExperienceMedia = {
  id?: IdReadonly;
  experience_id?: ExperienceId;
  flow_code: FlowCode;
  status_code: StatusCode;
  images_v2?: ImageV2Ids;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type EndStatus = string;
export type AlternativeStatus = string;
export type InitStatus = string;
export type TransitionsArray = Array<StatusId>;
export type TranslationElement = {
  id?: IdReadonly;
  language_code: LanguageCode;
  name?: Name;
  text1?: Description;
  automatic_translation?: AutomaticTranslation;
  to_be_translated?: ToBeTranslated;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type OptionTranslation = {
  id?: IdReadonly;
  experience_id: ExperienceId;
  option_id?: OptionId;
  asx_service_code_translation_id?: AsxServiceCodeTranslationId;
  asx_modality_code?: AsxModalityCode;
  name: string;
  language_code: LanguageCode;
  to_be_translated: ToBeTranslated;
  automatic_translation?: AutomaticTranslation;
  flow_code: FlowCode;
  status_code: StatusCode;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ServiceCodeTranslation = {
  id?: IdReadonly;
  experience_id: ExperienceId;
  language_code: LanguageCode;
  code: string;
  name: string;
  flow_code: FlowCode;
  status_code: StatusCode;
  automatic_translation?: AutomaticTranslation;
  to_be_translated: ToBeTranslated;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceTranslation = TranslationElement & {
  experience_id: ExperienceId;
  title: Title;
  text2?: SecondDescription;
  text3?: ThirdDescription;
  seo_title?: SeoTitle;
  seo_description?: SeoDescription;
  info_voucher?: InfoVoucher;
  meeting_point_details?: MeetingPointDetails;
  flow_code: FlowCode;
  status_code: StatusCode;
  curation_quality?: CurationQuality;
  unpublish_date?: UnpublishDate;
};
export type ImageV2Ids = Array<MediaItemV2>;
export type MediaItem = {
  id?: IdMediaItem;
  visualization_order?: VisualizationOrder;
  is_cover?: IsCover;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type MediaItemV2 = {
  id?: IdMediaItem;
  visualization_order?: VisualizationOrder;
  image_type?: ImageType;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type Copyright = {
  id?: IdReadonly;
  owner: Owner;
  name: Name;
  datetime?: Datetime;
  signature: Signature;
  supplier_id: SupplierId;
};
export type ExperienceCommercialContent = {
  id?: IdReadonly;
  supplier_id?: SupplierId;
  experience_id: ExperienceId;
  experience_translations?: Array<ExperienceTranslationItem>;
  experience_media_id?: ExperienceMediaId;
};
export type ExperienceTranslationItem = { id: Id; language_code: LanguageCode };
export type CustomIncluded = {
  id: string;
  experience_id: ExperienceId;
  code?: string;
  language_code: string;
  name: string;
  description?: string;
  automatic_translation?: AutomaticTranslation;
  to_be_translated?: ToBeTranslated;
  visualization_order?: VisualizationOrder;
  flow_code: FlowCode;
  status_code: StatusCode;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type CustomNonIncluded = {
  id: string;
  experience_id: ExperienceId;
  code?: string;
  language_code: string;
  name: string;
  description?: string;
  automatic_translation?: AutomaticTranslation;
  to_be_translated?: ToBeTranslated;
  visualization_order?: VisualizationOrder;
  flow_code: FlowCode;
  status_code: StatusCode;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type CustomHighlights = {
  id: string;
  experience_id: ExperienceId;
  code?: string;
  language_code: string;
  name: string;
  description?: string;
  automatic_translation?: AutomaticTranslation;
  to_be_translated?: ToBeTranslated;
  visualization_order?: VisualizationOrder;
  flow_code: FlowCode;
  status_code: StatusCode;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ImageV2 = {
  id: IdReadonly;
  file_name: FileName;
  preview_url?: PreviewUrl;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type CustomImportantInformation = {
  id: string;
  experience_id: ExperienceId;
  code?: string;
  language_code: string;
  name: string;
  description?: string;
  automatic_translation?: AutomaticTranslation;
  to_be_translated?: ToBeTranslated;
  visualization_order?: VisualizationOrder;
  flow_code: FlowCode;
  status_code: StatusCode;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type TranslationRequest = { language_list: Array<LanguageTranslation> };
export type LanguageTranslation = {
  language_code: LanguageCodeEs;
  to_be_translated: ToBeTranslated;
  automatic_review: AutomaticReview;
};
export type PreviewUrl = string;
export type FileName = string;
export type VisualizationOrder = number;
export type Width = number;
export type Height = number;
export type Size = "SMALL" | "MEDIUM" | "BIG" | "EXTRA_LARGE" | "LPP" | "DYNAMIC";
export type ContentFile = string;
export type IsCover = boolean;
export type MediaType = string;
export type ImageType = "COVER" | "GALLERY" | "THUMB";
export type Description = string;
export type SecondDescription = string;
export type ThirdDescription = string;
export type SeoTitle = string;
export type SeoDescription = string;
export type InfoVoucher = string;
export type MeetingPointDetails = string;
export type Name = string;
export type Owner = string;
export type Datetime = string;
export type UnpublishDate = string;
export type CreationDate = string;
export type UpdatedDate = string;
export type Signature = boolean;
export type ExperienceId = string;
export type Code = string;
export type OptionId = string;
export type AsxServiceCodeTranslationId = string;
export type AsxModalityCode = string;
export type StatusId = string;
export type StatusCode = "IN_REVIEW" | "TO_BE_EDIT" | "READY";
export type AutomaticTranslation = boolean;
export type ToBeTranslated = boolean;
export type AutomaticReview = boolean;
export type CurationQuality = boolean;
export type Title = string;
export type IdReadonly = string;
export type IdMediaItem = string;
export type FlowId = string;
export type FlowCode = "CURATION" | "MANUAL_TRANSLATION" | "MEDIA" | "AUTOTRANSLATION";
export type LanguageCode = string;
export type LanguageCodeEs = string;
export type Id = string;
export type SupplierId = string;
export type CopyrightId = string;
export type ExperienceMediaId = string;
export type OptionCode = string;
export type OptionDescription = string;
