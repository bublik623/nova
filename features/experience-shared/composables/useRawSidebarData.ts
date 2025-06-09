import { MappedCategory, SidebarCategoryField, SidebarSections } from "@/types/DocumentSidebar";
import { useBookingInformationStore } from "@/features/experience-shared/stores/useBookingInformationStore";
import { useExperienceLocationStore } from "@/features/experience-shared/stores/useExperienceLocationStore";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";

import { createField, mapSidebarSections } from "../utils/map-sidebar-sections";
import { ExperienceRawForm, useExperienceRaw } from "@/stores/experience-raw";
import type { LocationFields } from "@/features/experience-shared/stores/useExperienceLocationStore";
import type { BookingInformationFields } from "@/features/experience-shared/stores/useBookingInformationStore";
import type { RefundPolicyField } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { useFeatureFlag } from "./useFeatureFlag";
import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";
import { useRawSettingsStore } from "@/features/experience-raw/stores/useRawSettingsStore";
import { useDistributionContentStore } from "../stores/useDistributionContentStore";
import { FieldStatus } from "./useStoreFields";
import {
  ApiConnectionFields,
  useRawApiConnectionStore,
} from "@/features/experience-raw/stores/useRawApiConnectionStore";
import { usePaxesStore, type PaxesFields } from "@/features/experience-raw/stores/usePaxesStore";

export const useRawSidebarData = (id: string) => {
  const { rawContents } = useExperienceRaw();
  const locationStore = useExperienceLocationStore();
  const bookingInfoStore = useBookingInformationStore();
  const refundPoliciesStore = useRefundPoliciesStore();
  const apiConnectionStore = useRawApiConnectionStore();
  const paxesStore = usePaxesStore();
  const enableDifferentProductTypes = useFeatureFlag("enableDifferentProductTypes");

  const rawDocument = computed(() => rawContents[id]);
  const baseUrl = `/experience/${id}/raw`;
  const productType = computed(() =>
    enableDifferentProductTypes ? rawDocument.value?.data?.product_type || "NOVA" : "NOVA"
  );

  const sidebarCategories: ComputedRef<{ [key: string]: MappedCategory }> = computed(() => {
    if (!rawDocument.value) {
      return {};
    }
    const sidebarSections: SidebarSections = createSidebarSections(
      baseUrl,
      rawDocument.value.fields,
      locationStore.fields,
      bookingInfoStore.bookingInfoFields,
      refundPoliciesStore.field,
      apiConnectionStore.fields,
      paxesStore.fields,
      productType.value
    );

    return mapSidebarSections(sidebarSections);
  });

  return sidebarCategories;
};

const createSidebarSections = (
  baseUrl: string,

  rawDocumentFields: ExperienceRawForm,
  locationStoreFields: LocationFields,
  bookingInfoStoreFields: BookingInformationFields,
  refundPoliciesStoreField: RefundPolicyField,
  apiConnectionFields: ApiConnectionFields,
  paxesStoreFields: PaxesFields,
  productType: DistributionContent["experience_source"]
): SidebarSections => {
  const isNoCalendar =
    rawDocumentFields.experience_type?.value === ExperienceType.NO_CALENDAR_FIXED_END ||
    rawDocumentFields.experience_type?.value === ExperienceType.NO_CALENDAR_FIXED_VALIDITY;
  const hideOperationalSections = productType !== "NOVA";

  const rawSettingsStore = useRawSettingsStore();
  const distributionContentStore = useDistributionContentStore();

  const [titleField, ...rawSettingFields] = rawSettingsStore.fieldStatus.map(storeFieldToSidebarField);

  const supplierIdField = storeFieldToSidebarField(distributionContentStore.getFieldStatus("supplier_id"));
  const settingsFields = [titleField, supplierIdField, ...rawSettingFields];

  return {
    settings: {
      url: `${baseUrl}/settings`,
      icon: "settings",
      fields: settingsFields,
    },
    location: {
      url: `${baseUrl}/location`,
      icon: "location",
      fields: [
        createField("location.city", locationStoreFields.city),
        createField("location.additional-cities", locationStoreFields.additionalCities),
        createField("location.venues", locationStoreFields.venues),
        createField("location.address", locationStoreFields.address),
        createField("location.meeting-point", rawDocumentFields.meeting_point_details),
      ],
    },
    content_generation: {
      url: `${baseUrl}/content-generation`,
      icon: "content-generator",
      fields: [
        createField("description", rawDocumentFields.description),
        createField("additional_description", rawDocumentFields.additional_description),
        createField("features", rawDocumentFields.features),
        createField("highlights", rawDocumentFields.highlights),
        createField("included", rawDocumentFields.included),
        createField("non_included", rawDocumentFields.non_included),
        createField("important_information", rawDocumentFields.important_information),
        createField("duration", rawDocumentFields.additional_services),
      ],
    },
    customer_information: {
      url: `${baseUrl}/customer-info`,
      icon: "customer-info",
      fields: [
        createField("emergency_contact", bookingInfoStoreFields.emergency_contact),
        createField("voucher_type", bookingInfoStoreFields.voucher_type),
        createField("info_voucher", rawDocumentFields.info_voucher),
      ],
    },
    pricing_and_availability: {
      url: `${baseUrl}/pricing-and-availability`,
      icon: "ticket",
      hide: hideOperationalSections,
      fields: [
        createField("pricing.experience-type", rawDocumentFields.experience_type),
        createField("pricing.expiration-date", rawDocumentFields.experience_type, { hide: !isNoCalendar }),
        createField("pricing.currency", rawDocumentFields.currency),
        createField("pricing.instant-confirmation", rawDocumentFields.instant_confirmation, { filled: true }),
        // TODO: remove the `hide` and `required` once the feature flag is removed
        createField("pax_types", paxesStoreFields.paxes, {
          hide: !useFeatureFlag("pax_enabled"),
          required: useFeatureFlag("pax_enabled"), // override the default required value from the store
        }),
        createField("pricing.confirmation-time", rawDocumentFields.confirmation_time, {
          hide: rawDocumentFields.instant_confirmation?.value,
        }),
        createField("pricing.cutoff-time", rawDocumentFields.cutoff_time, { hide: isNoCalendar }),
        createField("refund_policies", refundPoliciesStoreField, { filled: true }),
      ],
    },
    options: {
      url: `${baseUrl}/options`,
      icon: "options",
      disabledBy: ["pricing_and_availability"],
      noDropdown: true,
      hide: hideOperationalSections,
      fields: [
        createField("options", rawDocumentFields.options, {
          filled: rawDocumentFields.options?.value.some((o) => o.status === "PUBLISHED"),
        }),
      ],
    },
    agenda: {
      url: `${baseUrl}/agenda`,
      icon: "calendar",
      disabledBy: ["options"],
      noDropdown: true,
      hide: hideOperationalSections,
      fields: [createField("agenda", { required: false, value: false }, { filled: false })],
    },
    asterix_integration: {
      url: `${baseUrl}/asterix-integration`,
      icon: "asterix-integration",
      hide: productType !== "ASX",
      fields: [
        createField("asterix-service-and-modalities-codes", rawDocumentFields.asterix_service_and_modalities_codes),
      ],
    },
    api_connection: {
      url: `${baseUrl}/api-connection`,
      icon: "api-connection",
      hide: productType !== "SIP",
      fields: [createField("raw-event-selection-form", apiConnectionFields.event)],
    },
  };
};

function storeFieldToSidebarField(field?: FieldStatus): SidebarCategoryField {
  if (!field) {
    throw new Error("Field is required");
  }

  return {
    id: field.key,
    required: field.isRequired,
    filled: field.isValid,
  };
}
