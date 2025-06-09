import { computed, ComputedRef } from "vue";
import { fieldValidator } from "@/utils/field-validator";
import { mapSidebarSections } from "@/features/experience-shared/utils/map-sidebar-sections";
import { useExperienceLocationStore } from "@/features/experience-shared/stores/useExperienceLocationStore";
import { useBookingInformationStore } from "@/features/experience-shared/stores/useBookingInformationStore";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { SidebarSections, MappedCategory, SidebarCategoryField } from "@/types/DocumentSidebar";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import {
  CommercialRaw,
  CustomHighlights,
  CustomImportantInformation,
  CustomIncluded,
  CustomNonIncluded,
  CustomTranslations,
  ExperienceTranslation,
} from "@/types/generated/ExperienceRawServiceApi";
import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useExperienceCuration } from "@/stores/experience-curation";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import { useCurationAsterixIntegrationStore } from "@/features/experience-curation/asterix-integration/stores/useCurationAsterixIntegrationStore";
import { useCurationExperienceStore } from "@/features/experience-curation/stores/useCurationExperienceStore";

export type CustomItems = CustomIncluded | CustomNonIncluded | CustomHighlights | CustomImportantInformation;
export function useSidebarCategories() {
  const route = useRoute();
  const id = route.params.id as string;

  const rawStore = useExperienceRaw();
  const rawDocument = computed(() => rawStore.rawContents[id]);
  const curationStore = useExperienceCuration();
  const curationDocument = computed(() => curationStore.curationDocuments[id]);
  const locationStore = useExperienceLocationStore();
  const bookingInfoStore = useBookingInformationStore();
  const refundPoliciesStore = useRefundPoliciesStore();
  const curationExperienceStore = useCurationExperienceStore();
  const asterixIntegrationStore = useCurationAsterixIntegrationStore();
  const baseUrl = `/experience/${id}/curation`;

  const areCommercialFieldsUpdated = (rawField: keyof CommercialRaw, snapshotField: keyof ExperienceTranslation) => {
    return (
      curationStore?.latestEnglishSnapshot?.experience_translation?.[snapshotField] !== undefined &&
      rawDocument.value.data.commercial[rawField] !==
        curationStore?.latestEnglishSnapshot?.experience_translation?.[snapshotField]
    );
  };

  const areCustomFieldsUpdated = (
    rawContentField: keyof CommercialRaw,
    snapshotField: keyof CustomTranslations
  ): boolean => {
    if (curationStore?.latestEnglishSnapshot === undefined) {
      return false;
    }

    const rawItems = (rawDocument.value.data.commercial[rawContentField] || []) as CustomItems[];
    const snapshotItems = (curationStore.latestEnglishSnapshot?.customs?.[snapshotField] || []) as CustomItems[];

    const rawFields = rawItems.map((item) => item.name);
    const snapshotFields = snapshotItems.map((item) => item.name);

    if (rawItems.length !== snapshotFields.length) return true;

    return !rawFields.every((customField: string) => snapshotFields.includes(customField));
  };

  const generateSidebarSection = (
    sectionName: string,
    url: string,
    icon: Icon,
    fields: SidebarCategoryField[],
    noDropdown?: boolean
  ): SidebarSections => {
    return {
      [sectionName]: {
        url: `${baseUrl}/${url}?view=${curationExperienceStore.selectedView}`,
        icon,
        noDropdown,
        fields: fields.map((field) => ({
          ...field,
        })),
      },
    };
  };

  const generateSettingsSection = () =>
    generateSidebarSection("settings", "settings", "settings", [
      {
        id: "title",
        required: curationDocument.value.fields.title.required,
        filled: fieldValidator(curationDocument.value.fields.title),
        hasChange: areCommercialFieldsUpdated("title", "title"),
      },
      {
        id: "supplier_name",
        required: rawDocument.value.fields.supplier_id.required,
        filled: fieldValidator(rawDocument.value.fields.supplier_id),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "external_reference_code",
        required: rawDocument.value.fields.external_reference_code.required,
        filled: fieldValidator(rawDocument.value.fields.external_reference_code),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "seo_title",
        required: curationDocument.value.fields.seo_title.required,
        filled: fieldValidator(curationDocument.value.fields.seo_title),
        hasChange: false,
      },
      {
        id: "categories",
        required: curationDocument.value.fields.categories_interests.required,
        filled: fieldValidator(curationDocument.value.fields.categories_interests),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "promotional_options",
        required: curationDocument.value.fields.promotional_options.required,
        filled: fieldValidator(curationDocument.value.fields.promotional_options),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "product_brand",
        required: curationDocument.value.fields.product_brand.required,
        filled: fieldValidator(curationDocument.value.fields.product_brand),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "own_offer",
        required: curationDocument.value.fields.own_offer.required,
        filled: fieldValidator(curationDocument.value.fields.own_offer),
        hide: curationExperienceStore.isCommercialView,
      },
    ]);

  const generateLocationSection = () =>
    generateSidebarSection("location", "location", "location", [
      {
        id: "location.city",
        required: locationStore.fields.city.required,
        filled: fieldValidator(locationStore.fields.city),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "location.additional-cities",
        required: locationStore.fields.additionalCities?.required,
        filled: fieldValidator(locationStore.fields.additionalCities),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "location.venues",
        required: locationStore.fields.venues?.required,
        filled: fieldValidator(locationStore.fields.venues),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "location.address",
        required: locationStore.fields.address.required,
        filled: fieldValidator(locationStore.fields.address),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "location.meeting-point",
        required: curationDocument.value.fields.meeting_point_details.required,
        filled: fieldValidator(curationDocument.value.fields.meeting_point_details),
        hasChange: areCommercialFieldsUpdated("meeting_point_details", "meeting_point_details"),
      },
    ]);

  const generateContentGenerationSection = () =>
    generateSidebarSection("content_generation", "content-generation", "content-generator", [
      {
        id: "description",
        required: curationDocument.value.fields.description.required,
        filled: fieldValidator(curationDocument.value.fields.description),
        hasChange: areCommercialFieldsUpdated("description", "text1"),
      },
      {
        id: "seo_description",
        required: curationDocument.value.fields.seo_description.required,
        filled: fieldValidator(curationDocument.value.fields.seo_description),
        hasChange: false,
      },
      {
        id: "additional_description",
        required: curationDocument.value.fields.additional_description.required,
        filled: fieldValidator(curationDocument.value.fields.additional_description),
        hasChange: areCommercialFieldsUpdated("additional_description", "text2"),
      },
      {
        id: "features",
        required: curationDocument.value.fields.features.required,
        filled: fieldValidator(curationDocument.value.fields.features),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "highlights",
        required: curationDocument.value.fields.highlights.required,
        filled: fieldValidator(curationDocument.value.fields.highlights),
        hasChange: areCustomFieldsUpdated("custom_highlights", "custom_highlights"),
      },
      {
        id: "included",
        required: curationDocument.value.fields.included.required,
        filled: fieldValidator(curationDocument.value.fields.included),
        hasChange: areCustomFieldsUpdated("custom_included", "custom_included"),
      },
      {
        id: "non_included",
        required: curationDocument.value.fields.non_included.required,
        filled: fieldValidator(curationDocument.value.fields.non_included),
        hasChange: areCustomFieldsUpdated("custom_non_included", "custom_non_included"),
      },
      {
        id: "important_information",
        required: curationDocument.value.fields.important_information.required,
        filled: fieldValidator(curationDocument.value.fields.important_information),
        hasChange: areCustomFieldsUpdated("custom_important_information", "custom_important_information"),
      },
      {
        id: "duration",
        required: curationDocument.value.fields.additional_services.required,
        filled: fieldValidator(curationDocument.value.fields.additional_services),
        hide: curationExperienceStore.isCommercialView,
      },
    ]);

  const generateCustomerInformationSection = () =>
    generateSidebarSection("customer_information", "customer-info", "customer-info", [
      {
        id: "emergency_contact",
        required: bookingInfoStore.bookingInfoFields.emergency_contact.required,
        filled: fieldValidator(bookingInfoStore.bookingInfoFields.emergency_contact),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "voucher_type",
        required: bookingInfoStore.bookingInfoFields.voucher_type.required,
        filled: fieldValidator(bookingInfoStore.bookingInfoFields.voucher_type),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "info_voucher",
        required: curationDocument.value.fields.info_voucher.required,
        filled: fieldValidator(curationDocument.value.fields.info_voucher),
        hasChange: areCommercialFieldsUpdated("info_voucher", "info_voucher"),
      },
    ]);

  const generatePricingAndAvailabilitySection = () =>
    generateSidebarSection("pricing_and_availability", "pricing-and-availability", "ticket", [
      {
        id: "pricing.experience-type",
        required: curationDocument.value.fields.experience_type.required,
        filled: fieldValidator(curationDocument.value.fields.experience_type),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "pricing.currency",
        required: curationDocument.value.fields.currency.required,
        filled: fieldValidator(curationDocument.value.fields.currency),
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "pricing.instant-confirmation",
        required: curationDocument.value.fields.instant_confirmation.required,
        filled: true,
        hide: curationExperienceStore.isCommercialView,
      },
      {
        id: "refund_policies",
        required: refundPoliciesStore.field.required,
        filled: true,
        hide: curationExperienceStore.isCommercialView,
      },
    ]);

  const generateOptionsSection = () =>
    generateSidebarSection(
      "options",
      "options",
      "options",
      [
        {
          id: "options",
          required: rawDocument.value.fields.options?.required,
          filled: fieldValidator(rawDocument.value.fields.options),
        },
      ],
      true
    );

  const generateAgendaSection = () =>
    generateSidebarSection(
      "agenda",
      "agenda",
      "calendar",
      [
        {
          id: "agenda",
          required: false,
          filled: false,
        },
      ],
      true
    );

  const generateAsterixIntegrationSection = () =>
    generateSidebarSection("asterix_integration", "asterix-integration", "asterix-integration", [
      {
        id: "asterix-service-and-modalities-titles",
        required: true,
        filled: asterixIntegrationStore.fieldStatus[0].isValid,
      },
    ]);

  const addAdditionalFields = (sidebar: SidebarSections) => {
    if (!curationDocument.value.fields.instant_confirmation.value) {
      sidebar.pricing_and_availability?.fields.push({
        id: "pricing.confirmation-time",
        required: curationDocument.value.fields.confirmation_time.required,
        filled: fieldValidator(curationDocument.value.fields.confirmation_time),
        hide: curationExperienceStore.isCommercialView,
      });
    }

    if (
      !(
        curationDocument.value.fields.experience_type.value === ExperienceType.NO_CALENDAR_FIXED_END ||
        curationDocument.value.fields.experience_type.value === ExperienceType.NO_CALENDAR_FIXED_VALIDITY
      )
    ) {
      const fields = sidebar.pricing_and_availability?.fields;
      if (fields) {
        fields.splice(fields.length - 1, 0, {
          id: "pricing.cutoff-time",
          required: curationDocument.value.fields.cutoff_time.required,
          filled: fieldValidator(curationDocument.value.fields.cutoff_time),
          hide: curationExperienceStore.isCommercialView,
        });
      }
    } else {
      const fields = sidebar.pricing_and_availability?.fields;
      if (fields) {
        fields.splice(fields.length - 1, 0, {
          id: "pricing.expiration-date",
          required: curationDocument.value.fields.experience_type.required,
          filled: fieldValidator(curationDocument.value.fields.experience_type),
        });
      }
    }

    if (curationDocument.value.fields.product_brand.value === "BRAND_NATIONAL_GEOGRAPHIC") {
      sidebar.settings.fields.splice(5, 0, {
        hide: curationExperienceStore.isCommercialView,
        id: "nat_geo_tour_level.sidebar",
        required: curationDocument.value.fields.nat_geo_tour_levels.required,
        filled: fieldValidator(curationDocument.value.fields.nat_geo_tour_levels),
      });
    }
  };

  const buildAsxSidebarSectionList = () => ({
    ...generateSettingsSection(),
    ...generateLocationSection(),
    ...generateContentGenerationSection(),
    ...generateCustomerInformationSection(),
    ...generateAsterixIntegrationSection(),
  });

  const buildNovaSidebarSectionList = () => ({
    ...generateSettingsSection(),
    ...generateLocationSection(),
    ...generateContentGenerationSection(),
    ...generateCustomerInformationSection(),
    ...generatePricingAndAvailabilitySection(),
    ...generateOptionsSection(),
    ...generateAgendaSection(),
  });

  const buildSipSidebarSectionList = () => ({
    ...generateSettingsSection(),
    ...generateLocationSection(),
    ...generateContentGenerationSection(),
    ...generateCustomerInformationSection(),
  });

  const sidebarCategories: ComputedRef<{ [key: string]: MappedCategory }> = computed(() => {
    const enableDifferentProductTypes = useFeatureFlag("enableDifferentProductTypes");
    const productType = computed(() =>
      enableDifferentProductTypes ? rawDocument.value?.data?.product_type || "NOVA" : "NOVA"
    );

    if (curationDocument.value && rawDocument.value) {
      let sidebar: SidebarSections = {};

      switch (productType.value) {
        case "ASX":
          sidebar = buildAsxSidebarSectionList();
          break;
        case "SIP":
          sidebar = buildSipSidebarSectionList();
          break;
        default:
          sidebar = buildNovaSidebarSectionList();
      }

      addAdditionalFields(sidebar);
      return mapSidebarSections(sidebar);
    } else return {};
  });

  return {
    sidebarCategories,
    areCommercialFieldsUpdated,
    areCustomFieldsUpdated,
  };
}
