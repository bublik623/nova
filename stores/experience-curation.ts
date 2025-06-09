import { defineStore } from "pinia";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { useContentCommandApi } from "@/composables/useContentCommandApi";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { useMetadataExperienceApi } from "@/composables/useMetadataExperienceApi";
import { ExperienceTranslation } from "@/types/generated/ContentCommandApi";
import { useMasterData } from "@/stores/master-data";
import {
  ExperienceHighlights,
  ExperienceImportantInformation,
  ExperienceIncluded,
  ExperienceNonIncluded,
  ExperienceAdditionalService,
  ExperienceCategories,
  ExperienceInterests,
  ExperienceMarkets,
} from "@/types/generated/MetadataExperiencesApi";
import { ExperienceFlowCode } from "@/types/DocumentStatuses";
import { getRequiredFields, checkFormValidity } from "@/utils/form-validator";
import { FormField } from "@/types/Form";
import { HighlightsKey, MixedHighlightValue } from "@/types/Highlights";
import { mapGenericToManageableHighlight, mixedHighlightListValidator } from "@/utils/mixed-highlights";
import {
  ExperienceFunctionalGroupFields,
  getSelectedAdditionalServices,
  mapCodesToAdditionalServices,
} from "@/utils/additional-services-utils";
import { Experience as OfferExperience, ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { INSTANT_DURATION } from "@/constants/date.constants";
import {
  commitCustomHighlights,
  CustomHighlightOptions,
} from "@/features/experience-highlights/lib/commit-custom-highlights";
import { getAllCustomHighlights } from "@/features/experience-highlights/lib/get-all-custom-highlights";
import { mapManageableHighlightToPremadeHighlight } from "@/features/experience-raw/lib/map-premade-highlights";
import {
  RawSnapshot,
  CustomHighlights,
  Snapshot,
  ExperienceSource,
  DistributionContent,
} from "@/types/generated/ExperienceRawServiceApi";
import { premadeApiKeys } from "@/features/experience-highlights/lib/get-all-premade-highlights";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { StatusCode } from "@/types/generated/ContentQueryApiV2";
import { waitForTimeout } from "@/features/core-shared/utils/promise/wait";
import { updateDelayMs } from "@/features/experience-shared/constants/experience-shared-constants";
import {
  generateOfferExperiencePayload,
  getOfferExperienceInitialValues,
} from "@/features/experience-calendar/utils/offer-experience-utils";
import { getCutoffTime, useExperienceRaw } from "./experience-raw";
import { useExperienceLocationStore } from "@/features/experience-shared/stores/useExperienceLocationStore";
import { useBookingInformationStore } from "@/features/experience-shared/stores/useBookingInformationStore";
import { shouldLoadOfferExperience } from "@/utils/should-load-offer-experience";

type MetadataRelationKey = HighlightsKey | "additional_services" | "categories" | "interests" | "markets";

type CategoriesAndInterests = {
  categories: ExperienceCategories["categories"];
  interests: ExperienceInterests["interests"];
};

export type ExperienceCurationForm = {
  title: FormField<string, true>;
  seo_title: FormField<string, true>;
  categories_interests: FormField<CategoriesAndInterests, false>;
  description: FormField<string, true>;
  seo_description: FormField<string, true>;
  additional_description: FormField<string, true>;
  highlights: FormField<MixedHighlightValue, true>;
  included: FormField<MixedHighlightValue, true>;
  non_included: FormField<MixedHighlightValue>;
  important_information: FormField<MixedHighlightValue>;
  info_voucher: FormField<string>;
  experience_type: FormField<ExperienceType | undefined>;
  currency: FormField<string | undefined, true>;
  instant_confirmation: FormField<boolean, false>;
  confirmation_time: FormField<string | undefined, boolean>;
  cutoff_time: FormField<string | undefined>;
  meeting_point_details: FormField<string, false>;
  markets: FormField<string[]>;
} & ExperienceFunctionalGroupFields;

export type NovaExperienceCurationDocumentData = ExperienceTranslation & OfferExperience & { supplier_id?: string };
export type AsterixExperienceCurationDocumentData = ExperienceTranslation & { supplier_id?: string };
export type ExperienceCurationDocumentData = NovaExperienceCurationDocumentData | AsterixExperienceCurationDocumentData;

export interface ExperienceCurationDocument {
  productType: ExperienceSource;
  relations: {
    translation: string;
    highlights?: string;
    included?: string;
    non_included?: string;
    important_information?: string;
    additional_services?: string;
    categories?: string;
    interests?: string;
    markets?: string;
    offerExperience?: string;
  };
  fields: ExperienceCurationForm;
  modified: boolean;
  data: ExperienceCurationDocumentData;
}

export interface ExperienceCurationState {
  isSaving: boolean;
  curationDocuments: {
    [id: string]: ExperienceCurationDocument;
  };
  rawSnapshot: RawSnapshot;
  diff: {
    highlights?: MixedHighlightValue;
    included?: MixedHighlightValue;
    non_included?: MixedHighlightValue;
    important_information?: MixedHighlightValue;
  };
  snapshot: Snapshot;
  secondLastSnapshot: Snapshot;
}

const isSendingToTranslation = ref(false);

function withDefaultValue<T>(data: T | undefined, def: T) {
  return data ?? def;
}

export const mapPayloadToForm = ({
  translations,
  highlightsData,
  includedData,
  nonIncludedData,
  importantInfoData,
  additionalServicesData,
  categoriesData,
  interestsData,
  marketsData,
  offerData,
}: {
  translations: ExperienceTranslation;
  highlightsData?: MixedHighlightValue;
  includedData?: MixedHighlightValue;
  nonIncludedData?: MixedHighlightValue;
  importantInfoData?: MixedHighlightValue;
  additionalServicesData?: ExperienceAdditionalService;
  categoriesData?: ExperienceCategories;
  interestsData?: ExperienceInterests;
  marketsData?: ExperienceMarkets;
  offerData?: OfferExperience;
}): ExperienceCurationForm => {
  const codes = additionalServicesData?.additional_services ?? [];
  return {
    title: {
      value: translations.title,
      required: true,
      category: "experience_settings",
    },
    seo_title: {
      value: withDefaultValue(translations.seo_title, ""),
      required: true,
      category: "experience_settings",
    },
    categories_interests: {
      value: {
        categories: withDefaultValue(categoriesData?.categories, []),
        interests: withDefaultValue(interestsData?.interests, []),
      },
      category: "experience_settings",
    },
    description: {
      value: withDefaultValue(translations.text1, ""),
      required: true,
      category: "experience_info",
    },
    seo_description: {
      value: withDefaultValue(translations.seo_description, ""),
      required: true,
      category: "experience_info",
    },
    additional_description: {
      value: withDefaultValue(translations.text2, ""),
      category: "experience_info",
    },
    info_voucher: {
      value: withDefaultValue(translations.info_voucher, ""),
      required: false,
      category: "voucher",
    },
    highlights: {
      value: {
        custom: withDefaultValue(highlightsData?.custom, []),
        premade: withDefaultValue(highlightsData?.premade, []),
      },
      required: true,
      category: "experience_info",
      validator: mixedHighlightListValidator,
    },
    included: {
      value: {
        custom: withDefaultValue(includedData?.custom, []),
        premade: withDefaultValue(includedData?.premade, []),
      },
      required: true,
      category: "experience_info",
      validator: mixedHighlightListValidator,
    },
    non_included: {
      value: {
        custom: withDefaultValue(nonIncludedData?.custom, []),
        premade: withDefaultValue(nonIncludedData?.premade, []),
      },
      required: false,
      category: "experience_info",
      validator: mixedHighlightListValidator,
    },
    important_information: {
      value: {
        custom: withDefaultValue(importantInfoData?.custom, []),
        premade: withDefaultValue(importantInfoData?.premade, []),
      },
      required: false,
      category: "experience_info",
      validator: mixedHighlightListValidator,
    },
    additional_services: {
      value: getSelectedAdditionalServices("DURATION", codes, true),
      required: true,
      category: "property_and_relevance",
    },
    product_brand: {
      value: getSelectedAdditionalServices("PRODUCT_BRAND", codes, false),
      required: false,
      category: "experience_settings",
    },
    own_offer: {
      value: getSelectedAdditionalServices("OWN_OFFER", codes, false),
      required: true,
      category: "experience_settings",
    },
    promotional_options: {
      value: getSelectedAdditionalServices("PROMOTIONAL_OPTIONS", codes, false),
      required: false,
      category: "experience_settings",
    },
    nat_geo_tour_levels: {
      value: getSelectedAdditionalServices("NAT_GEO_TOUR_LEVELS", codes, false),
      required: codes.includes("BRAND_NATIONAL_GEOGRAPHIC"),
      category: "experience_settings",
    },
    features: {
      value: getSelectedAdditionalServices("FEATURES", codes, true),
      required: false,
      category: "experience_info",
    },
    experience_type: {
      value: offerData?.type,
      required: false,
      category: "experience_pricing_and_availability",
    },
    currency: {
      value: offerData?.currency,
      required: true,
      category: "experience_pricing_and_availability",
    },
    instant_confirmation: {
      value: offerData?.confirmation_time === INSTANT_DURATION,
      required: false,
      category: "experience_pricing_and_availability",
    },
    confirmation_time: {
      value: offerData?.confirmation_time,
      required: false,
      category: "experience_pricing_and_availability",
      validator: (val) => val !== INSTANT_DURATION,
    },
    cutoff_time: {
      value: offerData?.cutoff_time,
      required: false,
      category: "experience_pricing_and_availability",
    },
    meeting_point_details: {
      value: withDefaultValue(translations.meeting_point_details, ""),
      required: false,
      category: "experience_location",
    },
    markets: {
      value: marketsData?.markets ?? [],
      required: false,
      category: "segmentation_details",
    },
  };
};

const mapFormToPayload = (id: string, fields: ExperienceCurationForm) => {
  return {
    experience_id: id,
    title: fields.title.value,
    info_voucher: fields.info_voucher.value,
    language_code: "en",
    seo_title: fields.seo_title.value,
    seo_description: fields.seo_description.value,
    text1: fields.description.value,
    text2: fields.additional_description.value,
    meeting_point_details: fields.meeting_point_details.value,

    // curation_quality should be removed when is possible
    curation_quality: false,
  };
};
function mapFormToOfferService(
  fields: ExperienceCurationForm,
  data: NovaExperienceCurationDocumentData,
  supplierId?: string
): OfferExperience {
  return {
    type: fields.experience_type.value!,
    currency: fields.currency.value!,
    confirmation_time: fields.confirmation_time.value!,
    cutoff_time: fields.cutoff_time.value!,
    uuid: data.uuid,
    supplier: (supplierId || data.supplier_id)!,
  };
}
function mapToNovaExperienceData(
  translationsData: ExperienceTranslation[],
  offerExperienceData: OfferExperience,
  supplierId: string
): NovaExperienceCurationDocumentData {
  return { ...translationsData[0], ...offerExperienceData, supplier: supplierId, supplier_id: supplierId };
}

function mapToAsterixExperienceData(
  translationsData: ExperienceTranslation[],
  supplierId: string
): AsterixExperienceCurationDocumentData {
  return { ...translationsData[0], supplier_id: supplierId };
}
export const useExperienceCuration = defineStore("experience-curation", {
  state: (): ExperienceCurationState => ({
    isSaving: false,
    curationDocuments: {},
    rawSnapshot: {},
    diff: {},
    snapshot: {},
    secondLastSnapshot: {},
  }),
  getters: {
    requiredFields:
      (state) =>
      (experienceId: string): Partial<ExperienceCurationForm> => {
        const form = state.curationDocuments[experienceId];

        return getRequiredFields(form.fields);
      },
    submitEnabled:
      (state) =>
      (experienceId: string): boolean => {
        const form = state.curationDocuments[experienceId];

        return checkFormValidity(form.fields);
      },
    isSendingToTranslation: () => isSendingToTranslation.value,
    hasDiff: (state) => state.rawSnapshot?.raw?.status_code === "UP_TO_DATE",
    hasTranslationDiff: (state) => !!state.snapshot?.id,
    latestEnglishSnapshot: (state) =>
      state.snapshot?.experience_commercial_information?.translations?.find(
        (translation) => translation.language_code === "en"
      ),
    secondLastEnglishSnapshot: (state) =>
      state.secondLastSnapshot?.experience_commercial_information?.translations?.find(
        (translation) => translation.language_code === "en"
      ),
  },
  actions: {
    mapDataToHighlights(
      highlightType: HighlightsKey,
      premadeData: string[] = [],
      customsData: CustomHighlights[] = []
    ): MixedHighlightValue {
      const masterData = useMasterData();
      const mappingKey = premadeApiKeys[highlightType].store;
      return {
        premade: premadeData?.map((code: string) => masterData.getHighlightByCode(mappingKey, code)),
        custom: mapGenericToManageableHighlight(customsData),
      };
    },
    async getCurationDocument(experienceId: string) {
      const bookingInfoStore = useBookingInformationStore();
      const locationStore = useExperienceLocationStore();
      const { getTranslations } = useContentCommandApi();
      const { get: getMetadata } = useMetadataExperienceApi();
      const { getExperience: getOfferExperience } = useOfferServiceApi();
      const { getMostRecentRawSnapshot, getLastTwoSnapshots } = useExperienceRawApi();
      const distributionData = useNuxtData<DistributionContent>(`getDistributionContent-${experienceId}`);
      const supplierId = distributionData.data?.value?.supplier_id!;
      const productType = distributionData.data?.value?.experience_source ?? "NOVA";

      const params = {
        filters: emit(builder.eq("experience_id", experienceId)),
      };

      // At the moment the only way to fetch a translation iS
      // to query the api for the experience id and the language code,
      // which will return an array of one item.
      const translations = getTranslations<ExperienceTranslation[]>("experience-translations", {
        params: { ...params, language_code: "en" },
      });

      const highlights = getMetadata<ExperienceHighlights[]>("experience-highlights", {
        params: { ...params, fields: "highlights" },
      });

      const included = getMetadata<ExperienceIncluded[]>("experience-included", {
        params: { ...params, fields: "included" },
      });

      const nonIncluded = getMetadata<ExperienceNonIncluded[]>("experience-non-included", {
        params: { ...params, fields: "non_included" },
      });

      const importantInfo = getMetadata<ExperienceImportantInformation[]>("experience-important-information", {
        params: { ...params, fields: "important_information" },
      });

      const additionalServices = getMetadata<ExperienceAdditionalService[]>("experience-additional-services", {
        params: { ...params, fields: "additional_services" },
      });

      const categories = getMetadata<ExperienceCategories[]>("experience-categories", {
        params: { ...params, fields: "categories" },
      });

      const interests = getMetadata<ExperienceInterests[]>("experience-interests", {
        params: { ...params, fields: "interests" },
      });

      const markets = getMetadata<ExperienceMarkets[]>("experience-markets", {
        params: { ...params, fields: "markets" },
      });
      const offerExperience = shouldLoadOfferExperience(productType)
        ? getOfferExperience(experienceId)
        : { data: undefined };
      const rawSnapshot = getMostRecentRawSnapshot(experienceId);
      const lastTwoSnapshots = getLastTwoSnapshots(experienceId);

      await Promise.all([
        translations,
        highlights,
        included,
        nonIncluded,
        importantInfo,
        additionalServices,
        categories,
        interests,
        markets,
        getAllCustomHighlights("en", experienceId),
        offerExperience,
        rawSnapshot,
        lastTwoSnapshots,
      ]).then(
        ([
          { data: translationsData },
          { data: premadeHighlightsData },
          { data: premadeIncludedData },
          { data: premadeNonIncludedData },
          { data: premadeImportantInfoData },
          { data: additionalServicesData },
          { data: categoriesData },
          { data: interestsData },
          { data: marketsData },
          allCustomHighlights,
          { data: offerExperienceData },
          { data: rawSnapshotData },
          { data: lastTwoSnapshotsData },
        ]) => {
          this.rawSnapshot = rawSnapshotData;
          this.snapshot = lastTwoSnapshotsData[0];
          this.secondLastSnapshot = lastTwoSnapshotsData[1];

          this.curationDocuments[experienceId] = {
            productType: productType,
            relations: {
              translation: translationsData[0].id as string,
              highlights: premadeHighlightsData[0]?.id,
              included: premadeIncludedData[0]?.id,
              non_included: premadeNonIncludedData[0]?.id,
              important_information: premadeImportantInfoData[0]?.id,
              additional_services: additionalServicesData[0]?.id,
              categories: categoriesData[0]?.id,
              interests: interestsData[0]?.id,
              markets: marketsData[0]?.id,
              offerExperience: offerExperienceData?.uuid,
            },
            modified: false,
            fields: mapPayloadToForm({
              translations: translationsData[0],
              highlightsData: this.mapDataToHighlights(
                "highlights",
                premadeHighlightsData[0]?.highlights,
                allCustomHighlights?.custom_highlights
              ),
              includedData: this.mapDataToHighlights(
                "included",
                premadeIncludedData[0]?.included,
                allCustomHighlights?.custom_included
              ),
              nonIncludedData: this.mapDataToHighlights(
                "non_included",
                premadeNonIncludedData[0]?.non_included,
                allCustomHighlights?.custom_non_included
              ),
              importantInfoData: this.mapDataToHighlights(
                "important_information",
                premadeImportantInfoData[0]?.important_information,
                allCustomHighlights?.custom_important_information
              ),
              additionalServicesData: additionalServicesData[0],
              categoriesData: categoriesData[0],
              interestsData: interestsData[0],
              marketsData: marketsData[0],
              offerData: offerExperienceData,
            }),
            data: shouldLoadOfferExperience(productType)
              ? mapToNovaExperienceData(translationsData, offerExperienceData!, supplierId)
              : mapToAsterixExperienceData(translationsData, supplierId),
          };
          this.diff = {
            highlights: this.mapDataToHighlights(
              "highlights",
              this.rawSnapshot?.raw?.functional?.highlights,
              this.rawSnapshot?.raw?.commercial?.custom_highlights
            ),
            important_information: this.mapDataToHighlights(
              "important_information",
              this.rawSnapshot?.raw?.functional?.important_information,
              this.rawSnapshot?.raw?.commercial?.custom_important_information
            ),
            included: this.mapDataToHighlights(
              "included",
              this.rawSnapshot?.raw?.functional?.included,
              this.rawSnapshot?.raw?.commercial?.custom_included
            ),
            non_included: this.mapDataToHighlights(
              "non_included",
              this.rawSnapshot?.raw?.functional?.non_included,
              this.rawSnapshot?.raw?.commercial?.custom_non_included
            ),
          };
        }
      );

      const promises = [locationStore.loadLocation(experienceId), bookingInfoStore.loadBookingInfo(experienceId)];
      promises.push(locationStore.loadAdditionalCities(experienceId));

      promises.push(locationStore.loadVenues(experienceId));
      await Promise.all(promises);
    },

    async updateCurationDocument(experienceId: string, publish = false) {
      const document = this.curationDocuments[experienceId];
      const { putTranslation } = useContentCommandApi();

      const statusCode: StatusCode = "IN_REVIEW";
      const flowCode: ExperienceFlowCode = "CURATION";

      const translations = putTranslation(`experience-translations/${document.relations.translation}`, {
        ...mapFormToPayload(experienceId, document.fields),
        status_code: statusCode,
        flow_code: flowCode,
      });

      const highlights = updateMetadataExperience(
        document.relations,
        `experience-highlights`,
        {
          experience_id: experienceId,
          highlights: mapManageableHighlightToPremadeHighlight(document.fields.highlights.value.premade),
        },
        "highlights",
        document.relations.highlights
      );

      const included = updateMetadataExperience(
        document.relations,
        `experience-included`,
        {
          experience_id: experienceId,
          included: mapManageableHighlightToPremadeHighlight(document.fields.included.value.premade),
        },
        "included",
        document.relations.included
      );

      const nonIncluded = updateMetadataExperience(
        document.relations,
        `experience-non-included`,
        {
          experience_id: experienceId,
          non_included: mapManageableHighlightToPremadeHighlight(document.fields.non_included.value.premade),
        },
        "non_included",
        document.relations.non_included
      );

      const importantInfo = updateMetadataExperience(
        document.relations,
        `experience-important-information`,
        {
          experience_id: experienceId,
          important_information: mapManageableHighlightToPremadeHighlight(
            document.fields.important_information.value.premade
          ),
        },
        "important_information",
        document.relations.important_information
      );

      const additionalServices = updateMetadataExperience(
        document.relations,
        `experience-additional-services`,
        {
          experience_id: experienceId,
          additional_services: mapCodesToAdditionalServices(document.fields),
        },
        "additional_services",
        document.relations.additional_services
      );

      const categories = updateMetadataExperience(
        document.relations,
        `experience-categories`,
        {
          experience_id: experienceId,
          categories: document.fields.categories_interests.value.categories,
        },
        "categories",
        document.relations.categories
      );

      const interests = updateMetadataExperience(
        document.relations,
        `experience-interests`,
        {
          experience_id: experienceId,
          interests: document.fields.categories_interests.value.interests,
        },
        "interests",
        document.relations.interests
      );

      const markets = updateMetadataExperience(
        document.relations,
        `experience-markets`,
        {
          experience_id: experienceId,
          markets: document.fields.markets.value,
        },
        "markets",
        document.relations.markets
      );

      const customHighlightOptions: CustomHighlightOptions = {
        curationFlowCode: flowCode,
        toBeEditedStatusCode: statusCode,
      };

      await Promise.all([
        translations,
        highlights,
        included,
        nonIncluded,
        importantInfo,
        additionalServices,
        categories,
        interests,
        markets,
        commitCustomHighlights(
          experienceId,
          "highlights",
          document.fields.highlights.value.custom,
          customHighlightOptions
        ),
        commitCustomHighlights(experienceId, "included", document.fields.included.value.custom, customHighlightOptions),
        commitCustomHighlights(
          experienceId,
          "non_included",
          document.fields.non_included.value.custom,
          customHighlightOptions
        ),
        commitCustomHighlights(
          experienceId,
          "important_information",
          document.fields.important_information.value.custom,
          customHighlightOptions
        ),
      ]);
      await refreshAllCustomHighlights(this.curationDocuments[experienceId], experienceId);
      if (!publish) {
        // todo remove delay OFF-2547
        await waitForTimeout(updateDelayMs);

        await refreshNuxtData(`getDistributionContent-${experienceId}`);
        // workaround - used to show the correct status but is not synched with the document
        this.curationDocuments[experienceId].modified = false;

        this.curationDocuments[experienceId].data.status_code = statusCode;
      }
      this.isSaving = false;
    },

    async publishCurationExperience(experienceId: string, force = false) {
      const { publishTranslation } = useContentCommandApi();
      await publishTranslation(experienceId, "en", force);

      // todo remove delay OFF-2547
      await waitForTimeout(updateDelayMs);
      await refreshNuxtData(`getDistributionContent-${experienceId}`);

      this.curationDocuments[experienceId].data.status_code = "READY";
    },

    async publishCurationExperienceFromDashBoard(experienceId: string, force: boolean) {
      const { publishTranslation } = useContentCommandApi();
      await publishTranslation(experienceId, "en", force);

      // todo remove delay OFF-2547
      await waitForTimeout(updateDelayMs);
      await refreshNuxtData(`getDistributionContent-${experienceId}`);
    },

    async unpublishCurationExperience(experienceId: string) {
      const { unpublishExperience } = useContentCommandApi();
      await unpublishExperience(experienceId, "en");

      // todo remove delay OFF-2547
      await waitForTimeout(updateDelayMs);
      await refreshNuxtData(`getDistributionContent-${experienceId}`);
    },
  },
});

export function getOfferExperiencePayloadCuration(experience: ExperienceCurationDocument) {
  if (!shouldLoadOfferExperience(experience.productType)) {
    throw new Error("this experience does not support nova offer data");
  }

  const rawStore = useExperienceRaw();
  const rawExperience = rawStore.rawContents[experience.data.experience_id];

  return generateOfferExperiencePayload(
    () => getOfferExperienceInitialValues(experience.data as NovaExperienceCurationDocumentData),
    (supplierIdOverride) =>
      mapFormToOfferService(
        experience.fields,
        experience.data as NovaExperienceCurationDocumentData,
        supplierIdOverride
      ),
    () => getCutoffTime(experience)!,
    experience.fields.instant_confirmation.value,
    rawExperience.fields.supplier_id.value
  );
}

interface Payload {
  experience_id: string;
  [key: string]: string | string[];
}

async function updateMetadataExperience(
  relations: ExperienceCurationDocument["relations"],
  endpoint: string,
  payload: Payload,
  relationKey: MetadataRelationKey,
  id?: string
) {
  const { put, post, del } = useMetadataExperienceApi();
  const payloadExist = !!payload[relationKey][0];

  if (payloadExist && id) {
    await put(`${endpoint}/${id}`, { ...payload, language_code: "en" });
  } else if (payloadExist && !id) {
    const res = await post(endpoint, { ...payload, language_code: "en" });

    // getting the new relation id and assign it to the document
    const { location } = res.headers;

    if (location == null) {
      throw new Error(`No location was provided when creating resource. Relation: ${relationKey}, ID: ${id} `);
    }

    relations[relationKey] = location.split("/")[2];
  } else if (!payloadExist && id) {
    await del(`${endpoint}/${id}`);
    relations[relationKey] = undefined;
  }
}
async function refreshAllCustomHighlights(document: ExperienceCurationDocument, experienceId: string) {
  const keys: HighlightsKey[] = ["highlights", "important_information", "included", "non_included"];
  const { custom_highlights, custom_important_information, custom_included, custom_non_included } =
    await getAllCustomHighlights("en", experienceId);
  const remap = {
    highlights: custom_highlights,
    important_information: custom_important_information,
    included: custom_included,
    non_included: custom_non_included,
  };

  keys.forEach((key) => {
    const items = mapGenericToManageableHighlight(remap[key]);

    const field = document.fields[key] as FormField<MixedHighlightValue>;

    // we need to first clear and then populate the array twice
    // because if we reassign the array, we lose reactivity...
    field.value.custom.splice(0, field.value.custom.length);

    items.forEach((item) => field.value.custom.push(item));
  });
}
