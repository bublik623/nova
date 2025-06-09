import { describe, test, vi, expect, it, beforeEach } from "vitest";
import { useSidebarCategories } from "@/features/experience-shared/composables/useSidebarCategoriesCuration";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { useCurationExperienceStore } from "@/features/experience-curation/stores/useCurationExperienceStore";

vi.stubGlobal("useRoute", () => mockRoute);
vi.mock("@vueuse/router", () => ({
  useRouteQuery: () => ({ value: "all" }),
}));
vi.mock("@/features/experience-curation/stores/useCurationExperienceStore");

const useRawApiConnectionStoreMock = {
  fields: {
    event: {
      value: undefined,
      required: true,
      category: "api_connection",
    },
  },
};

vi.mock("@/features/experience-raw/stores/useRawApiConnectionStore", () => ({
  useRawApiConnectionStore: () => useRawApiConnectionStoreMock,
}));

const useCurationExperienceStoreMock = vi
  .mocked(useCurationExperienceStore)
  // @ts-expect-error ...
  .mockReturnValue({ isCommercialView: false });

const rawStoreMock = {
  rawContents: {
    "test-id-1": {
      data: {
        product_type: "NOVA",
        commercial: {
          title: "Title",
          additional_description: "Additional Description",
          custom_highlights: [{ name: "Highlight 1" }],
          custom_included: [{ name: "Included 1" }],
          custom_non_included: [{ name: "Non Included 1" }],
          custom_important_information: [{ name: "Important Information 1" }],
        },
      },
      fields: {
        supplier_id: { required: true },
        external_reference_code: { required: false },
        options: { required: false },
        text2: "Test change update",
        meeting_point_details: "update",
      },
    },
  },
};

vi.mock("@/stores/experience-raw", () => ({
  useExperienceRaw: () => rawStoreMock,
}));

const curationAsterixIntegrationStoreMock = reactive({
  fieldStatus: [{ isValid: true }],
});

vi.mock("@/features/experience-curation/asterix-integration/stores/useCurationAsterixIntegrationStore", () => ({
  useCurationAsterixIntegrationStore: () => curationAsterixIntegrationStoreMock,
}));

vi.mock("@/stores/experience-curation", () => ({
  useExperienceCuration: () => ({
    curationDocuments: {
      "test-id-1": {
        fields: {
          title: { required: true },
          seo_title: { required: true },
          categories_interests: { required: false },
          promotional_options: { required: false },
          product_brand: { required: false, value: "BRAND_NATIONAL_GEOGRAPHIC" },
          own_offer: { required: true },
          meeting_point_details: { required: false },
          description: { required: true },
          seo_description: { required: true },
          additional_description: { required: false },
          features: { required: false },
          highlights: { required: true },
          included: { required: true },
          non_included: { required: false },
          important_information: { required: false },
          additional_services: { required: true },
          info_voucher: { required: false },
          experience_type: { required: false, value: ExperienceType.NO_CALENDAR_FIXED_END },
          currency: { required: true },
          instant_confirmation: { value: true, required: false },
          confirmation_time: { required: false },
          cutoff_time: { required: false },
          nat_geo_tour_levels: { required: false },
        },
      },
    },
    latestEnglishSnapshot: {
      experience_translation: {
        title: "Updated Title",
        text2: "Updated Additional Description",
        info_voucher: "Updated Info Voucher",
        meeting_point_details: undefined,
      },
      customs: {
        custom_highlights: [{ name: "Updated Highlight 1" }],
        custom_included: [{ name: "Updated Included 1" }],
        custom_non_included: [{ name: "Updated Non Included 1" }],
        custom_important_information: [{ name: "Updated Important Information 1" }],
      },
    },
  }),
}));
vi.mock("@/features/experience-shared/stores/useExperienceLocationStore", () => ({
  useExperienceLocationStore: () => ({
    fields: {
      city: { required: true },
      address: { required: true },
      additionalCities: { required: false },
    },
  }),
}));
vi.mock("@/features/experience-shared/stores/useBookingInformationStore", () => ({
  useBookingInformationStore: () => ({
    bookingInfoFields: {
      emergency_contact: { required: true },
      voucher_type: { required: true },
    },
  }),
}));
vi.mock("@/features/experience-shared/stores/useRefundPoliciesStore", () => ({
  useRefundPoliciesStore: () => ({
    field: { required: true },
  }),
}));

export const mockRoute = {
  fullPath: "/experience/test-id-1",
  name: "experience-id-curation",
  params: {
    id: "test-id-1",
  },
};

describe("useSidebarCategoriesCuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("should generate sidebar sections correctly for a NOVA experience when curationDocument and rawDocument are defined", () => {
    const { sidebarCategories } = useSidebarCategories();

    const sections = Object.keys(sidebarCategories.value);
    expect(sections.length).toBe(7);
    expect(sections).toContain("settings");
    expect(sections).toContain("location");
    expect(sections).toContain("content_generation");
    expect(sections).toContain("customer_information");
    expect(sections).toContain("pricing_and_availability");
    expect(sections).toContain("options");
    expect(sections).toContain("agenda");
  });

  test("should detect updated in commercial fields", () => {
    const { sidebarCategories } = useSidebarCategories();
    const settingsFields = sidebarCategories.value.settings.fields;
    const titleField = settingsFields.find((field) => field.id === "title");
    expect(titleField?.hasChange).toBe(true);

    const additionalDescriptionField = sidebarCategories.value.content_generation.fields.find(
      (field) => field.id === "additional_description"
    );
    expect(additionalDescriptionField?.hasChange).toBe(true);
  });

  test("should detect updated in custom fields", () => {
    const { sidebarCategories } = useSidebarCategories();
    const highlightsField = sidebarCategories.value.content_generation.fields.find(
      (field) => field.id === "highlights"
    );
    expect(highlightsField?.hasChange).toBe(true);

    const includedField = sidebarCategories.value.content_generation.fields.find((field) => field.id === "included");
    expect(includedField?.hasChange).toBe(true);

    const nonIncludedField = sidebarCategories.value.content_generation.fields.find(
      (field) => field.id === "non_included"
    );
    expect(nonIncludedField?.hasChange).toBe(true);

    const importantInformationField = sidebarCategories.value.content_generation.fields.find(
      (field) => field.id === "important_information"
    );
    expect(importantInformationField?.hasChange).toBe(true);
  });

  test("should handle experience type NO_CALENDAR_FIXED_END", () => {
    const { sidebarCategories } = useSidebarCategories();
    const pricingFields = sidebarCategories.value.pricing_and_availability.fields;
    const expirationDateField = pricingFields.some((field) => field.id === "pricing.expiration-date");
    expect(expirationDateField).toBe(true);
  });

  test("should add nat_geo_tour_level field for BRAND_NATIONAL_GEOGRAPHIC", () => {
    const { sidebarCategories } = useSidebarCategories();
    const settingsFields = sidebarCategories.value.settings.fields;
    const natGeoTourLevelField = settingsFields.some((field) => field.id === "nat_geo_tour_level.sidebar");
    expect(natGeoTourLevelField).toBe(true);
  });

  test("should return false if the snapshot are undefined", () => {
    const { areCommercialFieldsUpdated } = useSidebarCategories();
    expect(areCommercialFieldsUpdated("meeting_point_details", "meeting_point_details")).toBe(false);
  });

  it("should show the correct categories if the experience source is NOVA", () => {
    const { sidebarCategories } = useSidebarCategories();
    expect(Object.keys(sidebarCategories.value)).toEqual([
      "settings",
      "location",
      "content_generation",
      "customer_information",
      "pricing_and_availability",
      "options",
      "agenda",
    ]);
  });

  it("should show the correct categories if the experience source is ASX", () => {
    rawStoreMock.rawContents["test-id-1"].data.product_type = "ASX";
    const { sidebarCategories } = useSidebarCategories();
    expect(Object.keys(sidebarCategories.value)).toEqual([
      "settings",
      "location",
      "content_generation",
      "customer_information",
      "asterix_integration",
    ]);
  });

  it("should show the correct categories if the experience source is SIP", () => {
    rawStoreMock.rawContents["test-id-1"].data.product_type = "SIP";
    const { sidebarCategories } = useSidebarCategories();
    expect(Object.keys(sidebarCategories.value)).toEqual([
      "settings",
      "location",
      "content_generation",
      "customer_information",
    ]);
  });

  it("should show the the categories for a nova exp as fallback", () => {
    rawStoreMock.rawContents["test-id-1"].data.product_type = "UNKNOWN";
    const { sidebarCategories } = useSidebarCategories();
    expect(Object.keys(sidebarCategories.value)).toEqual([
      "settings",
      "location",
      "content_generation",
      "customer_information",
      "pricing_and_availability",
      "options",
      "agenda",
    ]);
  });

  it('should return the correct sidebar when the viewType is "all"', () => {
    rawStoreMock.rawContents["test-id-1"].data.product_type = "NOVA";

    const { sidebarCategories } = useSidebarCategories();

    expect(sidebarCategories.value).toMatchInlineSnapshot(`
      {
        "agenda": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": false,
          "fields": [
            {
              "filled": false,
              "id": "agenda",
              "required": false,
            },
          ],
          "icon": "calendar",
          "id": "agenda",
          "required": false,
          "url": "/experience/test-id-1/curation/agenda?view=undefined",
        },
        "content_generation": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": false,
              "hasChange": false,
              "id": "description",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": false,
              "id": "seo_description",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "additional_description",
              "required": false,
            },
            {
              "filled": false,
              "hide": false,
              "id": "features",
              "required": false,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "highlights",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "included",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "non_included",
              "required": false,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "important_information",
              "required": false,
            },
            {
              "filled": false,
              "hide": false,
              "id": "duration",
              "required": true,
            },
          ],
          "icon": "content-generator",
          "id": "content_generation",
          "required": true,
          "url": "/experience/test-id-1/curation/content-generation?view=undefined",
        },
        "customer_information": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": false,
              "hide": false,
              "id": "emergency_contact",
              "required": true,
            },
            {
              "filled": false,
              "hide": false,
              "id": "voucher_type",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "info_voucher",
              "required": false,
            },
          ],
          "icon": "customer-info",
          "id": "customer_information",
          "required": true,
          "url": "/experience/test-id-1/curation/customer-info?view=undefined",
        },
        "location": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": false,
              "hide": false,
              "id": "location.city",
              "required": true,
            },
            {
              "filled": false,
              "hide": false,
              "id": "location.additional-cities",
              "required": false,
            },
            {
              "filled": false,
              "hide": false,
              "id": "location.venues",
              "required": undefined,
            },
            {
              "filled": false,
              "hide": false,
              "id": "location.address",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": false,
              "id": "location.meeting-point",
              "required": false,
            },
          ],
          "icon": "location",
          "id": "location",
          "required": true,
          "url": "/experience/test-id-1/curation/location?view=undefined",
        },
        "options": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": false,
          "fields": [
            {
              "filled": false,
              "id": "options",
              "required": false,
            },
          ],
          "icon": "options",
          "id": "options",
          "required": false,
          "url": "/experience/test-id-1/curation/options?view=undefined",
        },
        "pricing_and_availability": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": true,
              "hide": false,
              "id": "pricing.experience-type",
              "required": false,
            },
            {
              "filled": false,
              "hide": false,
              "id": "pricing.currency",
              "required": true,
            },
            {
              "filled": true,
              "hide": false,
              "id": "pricing.instant-confirmation",
              "required": false,
            },
            {
              "filled": true,
              "id": "pricing.expiration-date",
              "required": false,
            },
            {
              "filled": true,
              "hide": false,
              "id": "refund_policies",
              "required": true,
            },
          ],
          "icon": "ticket",
          "id": "pricing_and_availability",
          "required": true,
          "url": "/experience/test-id-1/curation/pricing-and-availability?view=undefined",
        },
        "settings": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": false,
              "hasChange": true,
              "id": "title",
              "required": true,
            },
            {
              "filled": false,
              "hide": false,
              "id": "supplier_name",
              "required": true,
            },
            {
              "filled": false,
              "hide": false,
              "id": "external_reference_code",
              "required": false,
            },
            {
              "filled": false,
              "hasChange": false,
              "id": "seo_title",
              "required": true,
            },
            {
              "filled": false,
              "hide": false,
              "id": "categories",
              "required": false,
            },
            {
              "filled": false,
              "hide": false,
              "id": "nat_geo_tour_level.sidebar",
              "required": false,
            },
            {
              "filled": false,
              "hide": false,
              "id": "promotional_options",
              "required": false,
            },
            {
              "filled": true,
              "hide": false,
              "id": "product_brand",
              "required": false,
            },
            {
              "filled": false,
              "hide": false,
              "id": "own_offer",
              "required": true,
            },
          ],
          "icon": "settings",
          "id": "settings",
          "required": true,
          "url": "/experience/test-id-1/curation/settings?view=undefined",
        },
      }
    `);
  });

  it('should return the correct sidebar when the viewType is "commercial"', () => {
    rawStoreMock.rawContents["test-id-1"].data.product_type = "NOVA";

    useCurationExperienceStoreMock.mockReturnValueOnce({
      isCommercialView: true,
    });

    const { sidebarCategories } = useSidebarCategories();

    expect(sidebarCategories.value).toMatchInlineSnapshot(`
      {
        "agenda": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": false,
          "fields": [
            {
              "filled": false,
              "id": "agenda",
              "required": false,
            },
          ],
          "icon": "calendar",
          "id": "agenda",
          "required": false,
          "url": "/experience/test-id-1/curation/agenda?view=undefined",
        },
        "content_generation": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": false,
              "hasChange": false,
              "id": "description",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": false,
              "id": "seo_description",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "additional_description",
              "required": false,
            },
            {
              "filled": false,
              "hide": true,
              "id": "features",
              "required": false,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "highlights",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "included",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "non_included",
              "required": false,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "important_information",
              "required": false,
            },
            {
              "filled": false,
              "hide": true,
              "id": "duration",
              "required": true,
            },
          ],
          "icon": "content-generator",
          "id": "content_generation",
          "required": true,
          "url": "/experience/test-id-1/curation/content-generation?view=undefined",
        },
        "customer_information": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": false,
              "hide": true,
              "id": "emergency_contact",
              "required": true,
            },
            {
              "filled": false,
              "hide": true,
              "id": "voucher_type",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": true,
              "id": "info_voucher",
              "required": false,
            },
          ],
          "icon": "customer-info",
          "id": "customer_information",
          "required": true,
          "url": "/experience/test-id-1/curation/customer-info?view=undefined",
        },
        "location": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": false,
              "hide": true,
              "id": "location.city",
              "required": true,
            },
            {
              "filled": false,
              "hide": true,
              "id": "location.additional-cities",
              "required": false,
            },
            {
              "filled": false,
              "hide": true,
              "id": "location.venues",
              "required": undefined,
            },
            {
              "filled": false,
              "hide": true,
              "id": "location.address",
              "required": true,
            },
            {
              "filled": false,
              "hasChange": false,
              "id": "location.meeting-point",
              "required": false,
            },
          ],
          "icon": "location",
          "id": "location",
          "required": true,
          "url": "/experience/test-id-1/curation/location?view=undefined",
        },
        "options": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": false,
          "fields": [
            {
              "filled": false,
              "id": "options",
              "required": false,
            },
          ],
          "icon": "options",
          "id": "options",
          "required": false,
          "url": "/experience/test-id-1/curation/options?view=undefined",
        },
        "pricing_and_availability": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": true,
              "hide": true,
              "id": "pricing.experience-type",
              "required": false,
            },
            {
              "filled": false,
              "hide": true,
              "id": "pricing.currency",
              "required": true,
            },
            {
              "filled": true,
              "hide": true,
              "id": "pricing.instant-confirmation",
              "required": false,
            },
            {
              "filled": true,
              "id": "pricing.expiration-date",
              "required": false,
            },
            {
              "filled": true,
              "hide": true,
              "id": "refund_policies",
              "required": true,
            },
          ],
          "icon": "ticket",
          "id": "pricing_and_availability",
          "required": true,
          "url": "/experience/test-id-1/curation/pricing-and-availability?view=undefined",
        },
        "settings": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": false,
              "hasChange": true,
              "id": "title",
              "required": true,
            },
            {
              "filled": false,
              "hide": true,
              "id": "supplier_name",
              "required": true,
            },
            {
              "filled": false,
              "hide": true,
              "id": "external_reference_code",
              "required": false,
            },
            {
              "filled": false,
              "hasChange": false,
              "id": "seo_title",
              "required": true,
            },
            {
              "filled": false,
              "hide": true,
              "id": "categories",
              "required": false,
            },
            {
              "filled": false,
              "hide": true,
              "id": "nat_geo_tour_level.sidebar",
              "required": false,
            },
            {
              "filled": false,
              "hide": true,
              "id": "promotional_options",
              "required": false,
            },
            {
              "filled": true,
              "hide": true,
              "id": "product_brand",
              "required": false,
            },
            {
              "filled": false,
              "hide": true,
              "id": "own_offer",
              "required": true,
            },
          ],
          "icon": "settings",
          "id": "settings",
          "required": true,
          "url": "/experience/test-id-1/curation/settings?view=undefined",
        },
      }
    `);
  });
});
