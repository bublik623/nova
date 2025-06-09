import { ref } from "vue";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useRawSettingsStore } from "../useRawSettingsStore";
import { useExperienceRawMutation } from "../../queries/experience-raw-mutation";
import { BRAND_NATIONAL_GEOGRAPHIC, BRAND_TUI_COLLECTION } from "../../constants";
import { mapRawElementToRawSettingsValue, mapRawSettingsValueToRawElement } from "../../lib/map-raw-element";
import { useCurrentRawExperienceQuery } from "@/features/experience-raw/composables/useCurrentRawExperienceQuery";

// Mapping functions
vi.mock("../../lib/map-raw-element", () => ({
  mapRawElementToRawSettingsValue: vi.fn(),
  mapRawSettingsValueToRawElement: vi.fn(),
}));

const mapRawElementToRawSettingsValueMock = mapRawElementToRawSettingsValue as Mock;
const mapRawSettingsValueToRawElementMock = mapRawSettingsValueToRawElement as Mock;

// Additional services utils
vi.mock("@/utils/additional-services-utils", () => ({
  getSelectedAdditionalServices: vi.fn(),
}));
const initialAdditionalService = ["OWN_OFFER_TEST", "BRAND_TEST"];

// Current query
vi.mock("@/features/experience-raw/composables/useCurrentRawExperienceQuery", () => ({
  useCurrentRawExperienceQuery: vi.fn(),
}));

const useCurrentRawExperienceQueryMock = useCurrentRawExperienceQuery as Mock;

useCurrentRawExperienceQueryMock.mockReturnValue({
  data: ref({
    commercial: {
      title: "some_title",
    },
    id: "test-id",
    experience_id: "test-experience-id",
    functional: {
      additional_services: initialAdditionalService,
    },
  }),
});

// Mutation
vi.mock("../../queries/experience-raw-mutation", () => ({
  useExperienceRawMutation: vi.fn(),
}));

const useExperienceRawMutationMock = useExperienceRawMutation as Mock;
const mutateAsyncMock = vi.fn();

useExperienceRawMutationMock.mockReturnValue({
  isPending: ref(false),
  mutateAsync: mutateAsyncMock,
});

describe("useRawSettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("initializes store with default values", () => {
    mapRawElementToRawSettingsValueMock.mockReturnValueOnce({
      title: "some_title",
      prodcut_brand: "BRAND_TEST",
    });

    const store = useRawSettingsStore();

    expect(mapRawElementToRawSettingsValueMock).toHaveBeenCalledWith({
      commercial: {
        title: "some_title",
      },
      experience_id: "test-experience-id",
      functional: {
        additional_services: ["OWN_OFFER_TEST", "BRAND_TEST"],
      },
      id: "test-id",
    });

    expect(store.values).toMatchInlineSnapshot(`
      {
        "prodcut_brand": "BRAND_TEST",
        "title": "some_title",
      }
    `);

    expect(store.requiredFields).toMatchInlineSnapshot(`
      [
        "title",
        "categories_interests",
        "own_offer",
      ]
    `);

    expect(store.fieldStatus).toMatchInlineSnapshot(`
      [
        {
          "isRequired": true,
          "isValid": true,
          "key": "title",
        },
        {
          "isRequired": false,
          "isValid": false,
          "key": "external_reference_code",
        },
        {
          "isRequired": true,
          "isValid": false,
          "key": "categories_interests",
        },
        {
          "isRequired": false,
          "isValid": false,
          "key": "promotional_options",
        },
        {
          "isRequired": false,
          "isValid": false,
          "key": "product_brand",
        },
        {
          "isRequired": true,
          "isValid": false,
          "key": "own_offer",
        },
      ]
    `);
    expect(store.hasChanges).toMatchInlineSnapshot(`false`);
    expect(store.isValid).toMatchInlineSnapshot(`false`);
    expect(store.formErrors).toMatchInlineSnapshot(`
      {
        "categories_interests": [
          "Required",
        ],
        "external_reference_code": [
          "Required",
        ],
        "own_offer": [
          "Required",
        ],
        "product_brand": [
          "Required",
        ],
        "promotional_options": [
          "Required",
        ],
      }
    `);
  });

  it("if the product brand is NATIONAL GEOGRAPHIC, it returns the correct values", () => {
    const store = useRawSettingsStore();
    store.values.product_brand = BRAND_NATIONAL_GEOGRAPHIC;

    expect(store.isNatGeo).toBe(true);
    expect(store.isTuiCollection).toBe(false);
  });

  it("if the product brand is TUI COLLECTION, it returns the correct values", () => {
    const store = useRawSettingsStore();
    store.values.product_brand = BRAND_TUI_COLLECTION;

    expect(store.isTuiCollection).toBe(true);
    expect(store.isNatGeo).toBe(false);
  });

  it("the save function invokes the correct mapping", async () => {
    useCurrentRawExperienceQueryMock.mockReturnValueOnce({
      data: ref({
        commercial: {
          title: "some_title",
        },
        id: "test-id",
        experience_id: "test-experience-id",
        functional: {
          additional_services: initialAdditionalService,
        },
      }),
    });

    const store = useRawSettingsStore();
    store.values.title = "trigger the change detection";

    await store.save();

    expect(mapRawSettingsValueToRawElementMock).toHaveBeenCalledWith(
      {
        title: "trigger the change detection",
      },
      {
        additional_services: initialAdditionalService,
      }
    );
  });

  it("the save function invokes the correct mutations", async () => {
    mapRawSettingsValueToRawElementMock.mockImplementation(() => ({
      commercial: {
        title: "some_new_title",
      },
    }));

    const store = useRawSettingsStore();

    store.values.title = "trigger the change detection, this is ignored";

    await store.save();

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      commercial: {
        title: "some_new_title",
      },
      id: "test-id",
      experience_id: "test-experience-id",
    });
  });

  it("save function does not call mutateAsync if no changes", async () => {
    const store = useRawSettingsStore();

    await store.save();

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("updates an additional service correctly", async () => {
    mapRawSettingsValueToRawElementMock.mockImplementation(() => ({
      functional: {
        additional_services: ["OWN_OFFER_1", "DEFAULT_ADDITIONAL_SERVICE"],
      },
    }));

    const store = useRawSettingsStore();

    // @ts-expect-error ...
    store.updateValues({
      own_offer: "OWN_OFFER_1",
    });

    await store.save();

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      id: "test-id",
      experience_id: "test-experience-id",
      functional: {
        additional_services: ["OWN_OFFER_1", "DEFAULT_ADDITIONAL_SERVICE"],
      },
    });
  });

  it("if there are no updated additional services, it should send the initial services", async () => {
    mapRawSettingsValueToRawElementMock.mockImplementation(() => ({
      functional: {
        additional_services: ["DEFAULT_ADDITIONAL_SERVICE"],
      },
    }));

    const store = useRawSettingsStore();

    store.values.title = "random title to trigger the change detection";

    await store.save();

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      experience_id: "test-experience-id",
      functional: {
        additional_services: ["DEFAULT_ADDITIONAL_SERVICE"],
      },
      id: "test-id",
    });
  });

  it("should be enabled", () => {
    const store = useRawSettingsStore();

    expect(store.enabled).toBe(true);
  });
});
