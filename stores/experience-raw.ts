import { defineStore } from "pinia";
import { useMasterData } from "./master-data";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import {
  BookingInformation,
  Categories,
  CollectionCriteria,
  DistributionContent,
  ExperienceSource,
  Interests,
  RawAsterixAdapterInformation,
  RawElement,
  RawLegacyAdapterInformation,
} from "@/types/generated/ExperienceRawServiceApi";
import { checkFormValidity, getRequiredFields } from "@/utils/form-validator";
import { FormField } from "@/types/Form";
import { MixedHighlightValue } from "@/types/Highlights";
import { mapGenericToManageableHighlight, mixedHighlightListValidator } from "@/utils/mixed-highlights";
import { Experience as OfferExperience, ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { Option } from "@/types/generated/OfferServiceApi";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { INSTANT_DURATION } from "@/constants/date.constants";
import {
  ExperienceFunctionalGroupFields,
  getSelectedAdditionalServices,
  mapCodesToAdditionalServices,
} from "@/utils/additional-services-utils";
import {
  ExperienceLocationData,
  useExperienceLocationStore,
} from "@/features/experience-shared/stores/useExperienceLocationStore";
import {
  ExperienceBookingInformationData,
  useBookingInformationStore,
} from "@/features/experience-shared/stores/useBookingInformationStore";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { mapManageableHighlightsToRawHighlight } from "@/features/experience-raw/lib/map-custom-highlights";
import { mapManageableHighlightToPremadeHighlight } from "@/features/experience-raw/lib/map-premade-highlights";
import { usePickupExperienceApi } from "@/features/experience-calendar/api/usePickupExperienceApi";
import { getChangedValues } from "@/features/experience-shared/utils/get-changed-values";
import { getExperienceRawInitialValues } from "@/features/experience-raw/utils/experience-raw-utils";
import objectAssignDeep from "object-assign-deep";
import { waitForTimeout } from "@/features/core-shared/utils/promise/wait";
import { updateDelayMs } from "@/features/experience-shared/constants/experience-shared-constants";
import { useDistributionAttributes } from "@/features/experience-shared/composables/useDistributionAttributes";
import {
  generateOfferExperiencePayload,
  getOfferExperienceInitialValues,
} from "@/features/experience-calendar/utils/offer-experience-utils";
import { ExperienceCurationDocument } from "./experience-curation";
import { ContactNumber } from "@/types/generated/MetadataExperiencesApi";
import { BRAND_TUI_COLLECTION } from "@/features/experience-raw/constants";
import { getNextRawStatusCode } from "@/features/experience-raw/lib/get-next-raw-status-code";
import { shouldLoadOfferExperience } from "@/utils/should-load-offer-experience";
import { useRawSettingsStore } from "@/features/experience-raw/stores/useRawSettingsStore";

const isSaving = ref(false);

type CategoriesAndInterests = {
  categories: Categories;
  interests: Interests;
};

interface ExperienceRawSettings {
  asterix_id: FormField<string, false>;
  option: FormField<string, false>;
  title: FormField<string, true>;
  categories_interests: FormField<CategoriesAndInterests>;
  supplier_id: FormField<string, true>;
  external_reference_code: FormField<string, false>;
  collection_criteria: {
    exceptional_experiences: FormField<string, false>;
    created_with_care: FormField<string, false>;
    best_value_guaranteed: FormField<string, false>;
  };
}

interface ExperienceRawContentGeneration {
  description: FormField<string, true>;
  additional_description: FormField<string>;
  highlights: FormField<MixedHighlightValue, true>;
  included: FormField<MixedHighlightValue, true>;
  non_included: FormField<MixedHighlightValue>;
  important_information: FormField<MixedHighlightValue>;
  meeting_point_details: FormField<string, false>;
  markets: FormField<string[]>;
}

// these properties are optional because for ASX products we do not manage operational data(offer experience)
interface ExperienceRawPricingAndAvailability {
  experience_type?: FormField<ExperienceType>;
  currency?: FormField<string, true>;
  instant_confirmation?: FormField<boolean, false>;
  confirmation_time?: FormField<string, boolean>;
  cutoff_time?: FormField<string>;
}

// these properties are optional because for ASX products we do not manage operational data(offer experience)
interface ExperienceRawOptions {
  options?: FormField<Option[], false>;
}

interface ExperienceRawCustomerInfo {
  info_voucher: FormField<string>;
  voucher_type: FormField<BookingInformation["voucher_type"] | undefined, boolean>;
  emergency_contact: FormField<ContactNumber, boolean>;
}

interface ExperienceRawLegacyAdapterInformation {
  asterix_service_and_modalities_codes?: FormField<RawLegacyAdapterInformation["asx_codes"], boolean>;
}

export type ExperienceRawForm = ExperienceRawSettings &
  ExperienceRawContentGeneration &
  Partial<ExperienceRawPricingAndAvailability> &
  Partial<ExperienceRawOptions> &
  ExperienceRawCustomerInfo &
  ExperienceFunctionalGroupFields &
  ExperienceRawLegacyAdapterInformation;

export type ExperienceRawData = RawElement & {
  options: Option[];
  offerExperience?: OfferExperience;
} & {
  // supplier_id and product type will be loaded from distribution-content
  supplier_id: string;
  product_type: DistributionContent["experience_source"];
};

export interface ExperienceRawDocument {
  fields: ExperienceRawForm;
  modified: boolean;
  data: ExperienceRawData;
}

export interface ExperienceRawState {
  rawContents: {
    [key: string]: ExperienceRawDocument;
  };
}

function mapFormToExperienceRawService(
  fields: ExperienceRawForm,
  locationFormData: ExperienceLocationData | undefined,
  additionalCitiesData: string[] | undefined,
  venuesData: string[] | undefined,
  bookingInfoFormData: ExperienceBookingInformationData
): Omit<RawElement, "experience_id" | "status_code" | "flow_code"> {
  return {
    functional: {
      asterix_id: fields.asterix_id.value,
      ...(fields.option.value ? { options: [{ code: fields.option.value, description: "" }] } : {}),
      highlights: mapManageableHighlightToPremadeHighlight(fields.highlights.value.premade),
      included: mapManageableHighlightToPremadeHighlight(fields.included.value.premade),
      non_included: mapManageableHighlightToPremadeHighlight(fields.non_included.value.premade),
      important_information: mapManageableHighlightToPremadeHighlight(fields.important_information.value.premade),
      additional_services: mapCodesToAdditionalServices(fields),
      categories: fields.categories_interests.value.categories,
      interests: fields.categories_interests.value.interests,
      external_reference_code: fields.external_reference_code.value,
      markets: fields.markets.value,
      ...(locationFormData ? { location: locationFormData } : {}),
      ...(bookingInfoFormData?.booking_information?.voucher_type
        ? { booking_information: bookingInfoFormData.booking_information }
        : {}),
      ...(additionalCitiesData ? { additional_cities: additionalCitiesData } : {}),
      ...(venuesData ? { venues: venuesData } : {}),
    },
    commercial: {
      title: fields.title.value,
      description: fields.description.value,
      additional_description: fields.additional_description.value,
      info_voucher: fields.info_voucher.value,
      meeting_point_details: fields.meeting_point_details.value,
      custom_highlights: mapManageableHighlightsToRawHighlight(fields.highlights.value.custom),
      custom_included: mapManageableHighlightsToRawHighlight(fields.included.value.custom),
      custom_non_included: mapManageableHighlightsToRawHighlight(fields.non_included.value.custom),
      custom_important_information: mapManageableHighlightsToRawHighlight(fields.important_information.value.custom),
    },
    collection_criteria: getCollectionCriteriaValues(fields.collection_criteria, fields.product_brand.value),
    ...mapLegacyAdapterInformationToPayload(fields),
  };
}

const getCollectionCriteriaValues = (
  collectionCriteria: ExperienceRawSettings["collection_criteria"],
  productBrand: string
): CollectionCriteria => {
  // If the product brand is not "BRAND_TUI_COLLECTION", remove the values
  if (productBrand !== BRAND_TUI_COLLECTION) {
    return {
      exceptional_experiences: "",
      created_with_care: "",
      best_value_guaranteed: "",
    };
  }
  // else return the values from the store
  return {
    exceptional_experiences: collectionCriteria.exceptional_experiences.value,
    created_with_care: collectionCriteria.created_with_care.value,
    best_value_guaranteed: collectionCriteria.best_value_guaranteed.value,
  };
};

function mapFormToOfferService(fields: ExperienceRawForm, data: ExperienceRawData): OfferExperience {
  return {
    type: fields.experience_type!.value,
    currency: fields.currency!.value,
    confirmation_time: fields.confirmation_time!.value,
    cutoff_time: fields.cutoff_time!.value,
    uuid: data.offerExperience!.uuid,
    // if user has not selected a supplier, use the supplier from the data (hardcoded supplier id when we create an experience)
    supplier: fields.supplier_id.value || data.supplier_id,
  };
}

function mapPayloadToSettings(data: ExperienceRawData): ExperienceRawSettings {
  return {
    asterix_id: {
      value: data.functional?.asterix_id ?? "",
      required: false,
      category: "experience_settings",
    },
    option: {
      value: data.functional?.options ? data.functional?.options[0].code : "",
      required: false,
      category: "experience_settings",
    },
    title: {
      value: data.commercial.title,
      required: true,
      category: "experience_settings",
    },
    categories_interests: {
      value: {
        categories: data?.functional?.categories ?? [],
        interests: data?.functional?.interests ?? [],
      },
      required: true,
      category: "experience_settings",
      validator: (val) => val.categories.length > 0 && val.interests.length > 0,
    },
    supplier_id: {
      value: data?.supplier_id || "",
      required: true,
      category: "experience_settings",
    },
    external_reference_code: {
      value: data?.functional?.external_reference_code ?? "",
      required: false,
      category: "experience_settings",
    },
    collection_criteria: {
      exceptional_experiences: {
        value: data?.collection_criteria?.exceptional_experiences ?? "",
        required: false,
        category: "experience_settings",
      },
      created_with_care: {
        value: data.collection_criteria?.created_with_care ?? "",
        required: false,
        category: "experience_settings",
      },
      best_value_guaranteed: {
        value: data?.collection_criteria?.best_value_guaranteed ?? "",
        required: false,
        category: "experience_settings",
      },
    },
  };
}

function mapPayloadToContentGeneration(data: RawElement): ExperienceRawContentGeneration {
  const masterData = useMasterData();
  return {
    description: {
      value: data.commercial.description ?? "",
      required: true,
      category: "experience_info",
    },
    additional_description: {
      value: data.commercial.additional_description ?? "",
      required: false,
      category: "experience_info",
    },
    highlights: {
      value: {
        premade: data.functional?.highlights?.map((code) => masterData.getHighlightByCode("highlights", code)) ?? [],
        custom: mapGenericToManageableHighlight(data.commercial.custom_highlights ?? []),
      },
      required: true,
      category: "experience_info",
      validator: mixedHighlightListValidator,
    },
    included: {
      value: {
        premade: data.functional?.included?.map((code) => masterData.getHighlightByCode("included", code)) ?? [],
        custom: mapGenericToManageableHighlight(data.commercial.custom_included ?? []),
      },
      required: true,
      category: "experience_info",
      validator: mixedHighlightListValidator,
    },
    non_included: {
      value: {
        premade: data.functional?.non_included?.map((code) => masterData.getHighlightByCode("included", code)) ?? [],
        custom: mapGenericToManageableHighlight(data.commercial.custom_non_included ?? []),
      },
      required: false,
      category: "experience_info",
      validator: mixedHighlightListValidator,
    },
    important_information: {
      value: {
        premade:
          data.functional?.important_information?.map((code) =>
            masterData.getHighlightByCode("importantInformation", code)
          ) ?? [],
        custom: mapGenericToManageableHighlight(data.commercial.custom_important_information ?? []),
      },
      required: false,
      category: "experience_info",
      validator: mixedHighlightListValidator,
    },
    meeting_point_details: {
      value: data.commercial.meeting_point_details || "",
      required: false,
      category: "experience_location",
    },
    markets: {
      value: data.functional?.markets ?? [],
      required: false,
      category: "segmentation_details",
    },
  };
}

function mapPayloadToPricingAndAvailability(data: OfferExperience): ExperienceRawPricingAndAvailability {
  return {
    experience_type: {
      value: data.type,
      required: false,
      category: "experience_pricing_and_availability",
    },
    currency: {
      value: data.currency,
      required: true,
      category: "experience_pricing_and_availability",
    },
    instant_confirmation: {
      value: data.confirmation_time === INSTANT_DURATION,
      required: false,
      category: "experience_pricing_and_availability",
    },
    confirmation_time: {
      value: data.confirmation_time,
      required: false,
      category: "experience_pricing_and_availability",
      validator: (val) => val !== INSTANT_DURATION,
    },
    cutoff_time: {
      value: data.cutoff_time,
      required: false,
      category: "experience_pricing_and_availability",
    },
  };
}

function mapPayloadToFunctionalGroup(data: ExperienceRawData): ExperienceFunctionalGroupFields {
  const codes = data.functional?.additional_services ?? [];
  return {
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
      required: data.functional?.additional_services?.includes("BRAND_NATIONAL_GEOGRAPHIC"),
      category: "experience_settings",
    },
    features: {
      value: getSelectedAdditionalServices("FEATURES", codes, true),
      required: false,
      category: "experience_info",
    },
    additional_services: {
      value: getSelectedAdditionalServices("DURATION", codes, true),
      required: true,
      category: "property_and_relevance",
    },
  };
}

function mapPayloadToOptions(data: Option[]): ExperienceRawOptions {
  return {
    options: {
      value: data ?? [],
      required: false,
      category: "experience_info",
    },
  };
}

function mapPayloadToCustomerInfo(data: RawElement): ExperienceRawCustomerInfo {
  const bookingInfo = data.functional?.booking_information;
  const emergencyContact = bookingInfo?.emergency_contact_number;
  const emergencyContactNumber = emergencyContact?.number;
  const emergencyContactCountry = emergencyContact?.country_calling_code;

  return {
    voucher_type: {
      value: bookingInfo?.voucher_type,
      required: true,
      category: "voucher",
    },
    emergency_contact: {
      value:
        emergencyContactCountry && emergencyContactNumber ? emergencyContact : { country_calling_code: "", number: "" },
      required: false,
      category: "voucher",
      validator: (val) => !!val?.country_calling_code && !!val?.number,
    },
    info_voucher: {
      value: data.commercial.info_voucher ?? "",
      required: false,
      category: "voucher",
    },
  };
}

function mapPayloadToLegacyAdapterInformation(
  productType: DistributionContent["experience_source"],
  data: ExperienceRawData
): ExperienceRawLegacyAdapterInformation | {} {
  if (productType !== "ASX") return {};

  return {
    asterix_service_and_modalities_codes: {
      value: data.legacy_adapter_information?.asx_codes ?? [],
      required: true,
      category: "asterix_integration",
      validator: validateAsterixAdapterInformation,
    },
  };
}

export function validateAsterixAdapterInformation(valueList: RawAsterixAdapterInformation[]) {
  return (
    !!valueList &&
    valueList.length > 0 &&
    valueList.every((value) => (value.code?.length ?? 0) > 0 && (value.modality_codes?.length ?? 0) > 0)
  );
}

function mapLegacyAdapterInformationToPayload(formFields: ExperienceRawForm): {
  legacy_adapter_information?: RawLegacyAdapterInformation;
} {
  if (formFields.asterix_service_and_modalities_codes?.value === undefined) {
    return {};
  }

  return {
    legacy_adapter_information: {
      asx_codes: formFields.asterix_service_and_modalities_codes?.value ?? [],
    },
  };
}

export const useExperienceRaw = defineStore("experience-raw", {
  state: (): ExperienceRawState => {
    return {
      rawContents: {},
    };
  },
  getters: {
    isSaving: () => isSaving.value,
    requiredFields:
      (state) =>
      (experienceId: string): Partial<ExperienceRawForm> => {
        const form = state.rawContents[experienceId];

        return getRequiredFields(form.fields);
      },
    submitEnabled:
      (state) =>
      (experienceId: string): boolean => {
        const form = state.rawContents[experienceId];

        return checkFormValidity(form.fields);
      },
  },
  actions: {
    createDocument(id: string, data: ExperienceRawData, productType: ExperienceSource) {
      const fields = {
        ...mapPayloadToSettings(data),
        ...mapPayloadToContentGeneration(data),
        ...(shouldLoadOfferExperience(productType) ? mapPayloadToPricingAndAvailability(data.offerExperience!) : {}),
        ...(shouldLoadOfferExperience(productType) ? mapPayloadToOptions(data.options) : {}),
        ...mapPayloadToFunctionalGroup(data),
        ...mapPayloadToCustomerInfo(data),
        ...mapPayloadToLegacyAdapterInformation(productType, data),
      };

      this.rawContents[id] = {
        modified: false,
        fields,
        data,
      };
    },

    async refetchOptions(id: string) {
      if (this.rawContents[id]?.fields?.experience_type?.value !== this.rawContents[id]?.data?.offerExperience?.type) {
        // we need to refresh the options, because when we change the `experience_type` on pricing and availability page, BE returns options with new status code
        // so we need to get new options to display the correct icon on the left sidebar
        // see `raw.vue` for the source of this refresh
        await refreshNuxtData(`get-raw-document-${id}`);
      }
    },

    async getRawDocument(id: string) {
      const locationStore = useExperienceLocationStore();
      const bookingInfoStore = useBookingInformationStore();
      const refundPoliciesStore = useRefundPoliciesStore();
      const { getExperienceRawV2ByExperienceId } = useExperienceRawApi();
      const { getExperience: getOfferExperience } = useOfferServiceApi();
      const { getExperienceOptions } = useOfferServiceApi();
      const distributionData = useNuxtData(`getDistributionContent-${id}`);
      const supplierId = distributionData.data?.value?.supplier_id;
      const productType: ExperienceSource = distributionData.data?.value?.experience_source ?? "NOVA";

      const [rawExp, offerExp, options] = await Promise.all([
        getExperienceRawV2ByExperienceId(id),
        shouldLoadOfferExperience(productType) ? getOfferExperience(id, supplierId) : null,
        shouldLoadOfferExperience(productType) ? getExperienceOptions(id) : null,
        refundPoliciesStore.loadRefundPolicies(id),
      ]);

      const data = {
        ...rawExp.data,
        offerExperience: offerExp ? offerExp.data : undefined,
        options: options?.data || [],
        supplier_id: supplierId,
        supplier: supplierId,
        product_type: productType,
      };

      this.createDocument(id, data, productType);
      locationStore.initLocationFields(data.functional?.location);
      locationStore.initAdditionalCitiesField(data.functional?.additional_cities ?? []);
      locationStore.initVenuesField(data.functional?.venues ?? []);
      bookingInfoStore.initFields(data.functional?.booking_information);
    },

    async updateRawDocument(id: string, options?: { publish?: boolean }) {
      isSaving.value = true;

      const { publish = false } = options || {};
      const document = this.rawContents[id];

      if (!document) {
        return;
      }

      const { updateExperienceRaw } = useExperienceRawApi();
      try {
        const rawId = document.data.id as string;
        const { saveData: saveDistributionAttributes } = useDistributionAttributes();
        const rawSettingsStore = useRawSettingsStore();

        const rawExperiencePayload = getRawExperiencePayload(id, document, publish);

        await saveDistributionAttributes(id);

        if (rawExperiencePayload) {
          // BUGFIX: We need to sync the additional services from the settings to the raw experience,
          // until all the additional services are managed in the new stores, otherwise they will be lost.
          if (rawExperiencePayload?.functional?.additional_services) {
            const additionalServices = rawExperiencePayload.functional.additional_services;

            const additionalServicesFromSettings: string[] = [
              rawSettingsStore.values.product_brand || [],
              rawSettingsStore.values.own_offer || [],
              rawSettingsStore.values.promotional_options || [],
              rawSettingsStore.values.nat_geo_tour_levels || [],
            ].flatMap((service) => service);

            rawExperiencePayload.functional.additional_services = [
              ...additionalServicesFromSettings,
              ...additionalServices,
            ];
          }
          await updateExperienceRaw(rawId, rawExperiencePayload);
        }

        // todo remove delay OFF-2547
        await waitForTimeout(updateDelayMs);

        // update changed values using objectAssignDeep because with this lib, by default arrays in later objects will overwrite earlier values
        document.data = objectAssignDeep({}, document.data, rawExperiencePayload);
        document.modified = false;
      } finally {
        isSaving.value = false;
      }
    },

    async deleteRawDocument(experienceId: string) {
      const { deleteDistributionContent } = useExperienceRawApi();

      await deleteDistributionContent(experienceId);
    },
    /**
     * this is a temporary solution, this logic will be deleted (hopefully)
     *
     * if the user changes supplier id we need to update pickup for each option
     */
    async updateSupplierIdForPickups(experienceId: string, newSupplierId: string) {
      const offerService = useOfferServiceApi();
      const pickupExperienceApi = usePickupExperienceApi();

      const { data: options } = await offerService.getOptions(experienceId);

      const updatePromises = options.map(async (option) => {
        // Fetch pickup by option ID
        const { data: pickup } = await pickupExperienceApi.getPickupsByOptionId(option.id!);

        // Update pickup's supplier_id
        if (pickup?.id) {
          const { id: _id, ...pickupWithoutId } = pickup;
          await pickupExperienceApi.updatePickup(pickup.id, { ...pickupWithoutId, supplier_id: newSupplierId });
        }
      });

      await Promise.all(updatePromises);
    },

    // temporary
    async saveSupplierId(
      experienceId: string,
      { isSupplierChanged, payload }: { isSupplierChanged: boolean; payload: Partial<OfferExperience> | null }
    ) {
      const experienceRawApi = useExperienceRawApi();
      const offerApi = useOfferServiceApi();

      // skip if its not updated
      if (!payload) {
        return;
      }

      // if supplier changed we need to update distribution-content and pickups
      if (isSupplierChanged && payload.supplier) {
        await experienceRawApi.patchDistributionContent(experienceId, { supplier_id: payload.supplier });
        await this.updateSupplierIdForPickups(experienceId, payload.supplier);
      }

      await offerApi.updateExperience(experienceId, payload);
    },
  },
});

export function getCutoffTime(document: ExperienceRawDocument | ExperienceCurationDocument) {
  // if the experience type is OPEN the cut-off time should always be 0
  if (
    document.fields.experience_type?.value === ExperienceType.NO_CALENDAR_FIXED_END ||
    document.fields.experience_type?.value === ExperienceType.NO_CALENDAR_FIXED_VALIDITY
  ) {
    return INSTANT_DURATION;
  }
  return document.fields.cutoff_time!.value;
}

export function getOfferExperiencePayload(experience: ExperienceRawDocument) {
  return generateOfferExperiencePayload(
    () => getOfferExperienceInitialValues(experience.data.offerExperience),
    () => mapFormToOfferService(experience.fields, experience.data),
    () => getCutoffTime(experience)!,
    experience.fields.instant_confirmation!.value,
    experience.fields.supplier_id.value
  );
}

function getRawExperiencePayload(
  experienceId: string,
  experience: ExperienceRawDocument,
  publish: boolean
): Partial<RawElement> | null {
  const locationStore = useExperienceLocationStore();
  const bookingInfoStore = useBookingInformationStore();

  const initialRawFields = getExperienceRawInitialValues(experience.data);
  const updatedRawFields = mapFormToExperienceRawService(
    experience.fields,
    locationStore.getLocationPayload(),
    locationStore.getAdditionalCitiesPayload(),
    locationStore.getVenuesPayload(),
    bookingInfoStore.getBookingInfoPayload()
  );
  const changedValues = getChangedValues(initialRawFields, updatedRawFields);
  const statusCode = getNextRawStatusCode(experience.data.status_code, publish);
  // if user is trying to publish we force isRawChanged to true
  const isRawChanged = Object.keys(changedValues).length > 0 || publish;

  const rawUpdatePayload: Partial<RawElement> = {
    ...changedValues,
    experience_id: experienceId,
    ...(statusCode && { status_code: statusCode }),
  };
  return isRawChanged ? rawUpdatePayload : null;
}
