import { VueWrapper, config, shallowMount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import RawSettingsForm, { RawSettingsMasterdata } from "../RawSettingsForm.vue";
import { testId } from "@/utils/test.utils";
import * as isDisabledDuringCurationObject from "@/features/experience-raw/utils/experience-raw-utils";
import { RawExperienceValue } from "../../types/experience";

config.global.mocks = {
  $t: (s: string) => s,
};

config.global.renderStubDefaultSlot = true;

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

const isDisabledDuringCurationSpy = vi.spyOn(isDisabledDuringCurationObject, "isDisabledDuringCuration");

const selectors = {
  title: testId("raw-settings-title"),
  supplierName: testId("raw-settings-supplier-name"),
  externalReferenceCode: testId("raw-settings-external-reference-code"),
  categoriesInterests: testId("raw-settings-categories-interests"),
  promotionalOptions: testId("raw-settings-promotional-options"),
  productBrand: testId("raw-settings-product-brand"),
  natGeoTourLevels: testId("raw-settings-nat-geo-tour-levels"),
  ownOffer: testId("raw-settings-own-offer"),
};

function getStubbedComponents(wrapper: VueWrapper) {
  const stubbedComponents = {
    title: wrapper.find(selectors.title).getComponent("nova-input-text-stub"),
    supplierName: wrapper.find(selectors.supplierName).getComponent("field-supplier-card-stub"),
    externalReferenceCode: wrapper.find(selectors.externalReferenceCode).getComponent("nova-input-text-stub"),
    categoriesInterests: wrapper.find(selectors.categoriesInterests).getComponent("experience-category-stub"),
    promotionalOptions: wrapper.find(selectors.promotionalOptions).getComponent("nova-input-radio-group-stub"),
    productBrand: wrapper.find(selectors.productBrand).getComponent("product-brand-field-stub"),
    natGeoTourLevels: wrapper.find(selectors.natGeoTourLevels).getComponent("nova-input-radio-group-stub"),
    ownOffer: wrapper.find(selectors.ownOffer).getComponent("nova-input-radio-group-stub"),
  };

  return stubbedComponents;
}

describe("RawSettingsForm", () => {
  test("it renders the correct initial values", () => {
    const initialValues = getModelValue();

    const wrapper = shallowMount(RawSettingsForm, {
      props: {
        masterdata: getMasterdata(),
        requiredFields: [],
        modelValue: initialValues,
        options: {
          isReadonly: false,
          showNatGeo: true,
          productType: "NOVA",
          statusCode: "UP_TO_DATE",
        },
      },
    });

    const { title } = getStubbedComponents(wrapper);

    expect(isDisabledDuringCurationSpy).toHaveBeenCalledWith("title", "UP_TO_DATE");

    expect(title.attributes()).toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-title",
        "data-v-8979331a": "",
        "disabled": "false",
        "error": "",
        "id": "title",
        "isinvalid": "false",
        "modelvalue": "test",
        "placeholder": "experience.title.input.placeholder",
        "readonlyplaceholder": "common.no-content",
        "showmetrics": "false",
      }
    `);

    expect(wrapper.find(selectors.supplierName).getComponent("field-supplier-card-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-supplier-name",
        "data-v-8979331a": "",
        "disabled": "false",
        "inputid": "supplier-name",
        "modelvalue": "082d65c7-3d18-484b-9dc5-6e33ef73be49",
        "readonly": "",
      }
    `);

    expect(wrapper.find(selectors.externalReferenceCode).getComponent("nova-input-text-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-external-reference-code",
        "data-v-8979331a": "",
        "disabled": "false",
        "id": "external_reference_code",
        "isinvalid": "false",
        "modelvalue": "sadas",
        "placeholder": "experience.external_reference_code.input.placeholder",
        "readonlyplaceholder": "common.no-content",
        "showmetrics": "false",
      }
    `);

    expect(wrapper.find(selectors.categoriesInterests).getComponent("experience-category-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "categories": "[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]",
        "data-testid": "raw-settings-categories-interests",
        "data-v-8979331a": "",
        "disabled": "false",
        "interests": "[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]",
        "selectedcategory": "BOAT_TRIPS",
        "selectedinterests": "GOLF",
      }
    `);

    expect(wrapper.find(selectors.promotionalOptions).getComponent("nova-input-radio-group-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-promotional-options",
        "data-v-8979331a": "",
        "disabled": "false",
        "layout": "vertical",
        "modelvalue": "PROMOTIONAL_SPECIAL",
        "name": "promotional_options.options",
        "options": "[object Object],[object Object],[object Object]",
        "readonlyplaceholder": "common.no-content",
      }
    `);

    expect(wrapper.find(selectors.productBrand).getComponent("product-brand-field-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "bestvalueguaranteed": "",
        "createdwithcare": "",
        "data-testid": "raw-settings-product-brand",
        "data-v-8979331a": "",
        "exceptionalexperiences": "",
        "isreadonly": "false",
        "options": "[object Object],[object Object],[object Object]",
        "placeholder": "common.no-content",
        "productbrand": "BRAND_NATIONAL_GEOGRAPHIC",
      }
    `);

    expect(wrapper.find(selectors.natGeoTourLevels).getComponent("nova-input-radio-group-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-nat-geo-tour-levels",
        "data-v-8979331a": "",
        "disabled": "false",
        "layout": "vertical",
        "modelvalue": "NAT_GEO_TOUR_LEVEL_PREMIUM",
        "name": "nat_geo_tour_level.options",
        "options": "[object Object],[object Object],[object Object]",
        "readonlyplaceholder": "common.no-content",
      }
    `);

    expect(wrapper.find(selectors.ownOffer).getComponent("nova-input-radio-group-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-own-offer",
        "data-v-8979331a": "",
        "disabled": "false",
        "layout": "vertical",
        "modelvalue": "OWN_OFFER_3P_DESIGNED_OPERATED",
        "name": "own_offer.options",
        "options": "[object Object],[object Object],[object Object],[object Object]",
        "readonlyplaceholder": "common.no-content",
      }
    `);
  });

  test("it renders the readonly form correctly", () => {
    const initialValues = getModelValue();

    const wrapper = shallowMount(RawSettingsForm, {
      props: {
        masterdata: getMasterdata(),
        requiredFields: [],
        modelValue: initialValues,
        options: {
          isReadonly: true,
          showNatGeo: true,
          productType: "NOVA",
          statusCode: "UP_TO_DATE",
        },
      },
    });

    const { title } = getStubbedComponents(wrapper);

    expect(title.attributes()).toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-title",
        "data-v-8979331a": "",
        "disabled": "true",
        "error": "",
        "id": "title",
        "isinvalid": "false",
        "modelvalue": "test",
        "placeholder": "experience.title.input.placeholder",
        "readonly": "",
        "readonlyplaceholder": "common.no-content",
        "showmetrics": "false",
      }
    `);

    expect(isDisabledDuringCurationSpy).toHaveBeenCalledWith("title", "UP_TO_DATE");

    expect(wrapper.find(selectors.supplierName).getComponent("field-supplier-card-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-supplier-name",
        "data-v-8979331a": "",
        "disabled": "false",
        "inputid": "supplier-name",
        "modelvalue": "082d65c7-3d18-484b-9dc5-6e33ef73be49",
        "readonly": "",
      }
    `);

    expect(wrapper.find(selectors.externalReferenceCode).getComponent("nova-input-text-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-external-reference-code",
        "data-v-8979331a": "",
        "disabled": "false",
        "id": "external_reference_code",
        "isinvalid": "false",
        "modelvalue": "sadas",
        "placeholder": "experience.external_reference_code.input.placeholder",
        "readonly": "",
        "readonlyplaceholder": "common.no-content",
        "showmetrics": "false",
      }
    `);

    expect(wrapper.find(selectors.categoriesInterests).getComponent("experience-category-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "categories": "[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]",
        "data-testid": "raw-settings-categories-interests",
        "data-v-8979331a": "",
        "disabled": "false",
        "interests": "[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]",
        "readonly": "",
        "selectedcategory": "BOAT_TRIPS",
        "selectedinterests": "GOLF",
      }
    `);

    expect(wrapper.find(selectors.promotionalOptions).getComponent("nova-input-radio-group-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-promotional-options",
        "data-v-8979331a": "",
        "disabled": "false",
        "layout": "vertical",
        "modelvalue": "PROMOTIONAL_SPECIAL",
        "name": "promotional_options.options",
        "options": "[object Object],[object Object],[object Object]",
        "readonly": "",
        "readonlyplaceholder": "common.no-content",
      }
    `);

    expect(wrapper.find(selectors.productBrand).getComponent("product-brand-field-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "bestvalueguaranteed": "",
        "createdwithcare": "",
        "data-testid": "raw-settings-product-brand",
        "data-v-8979331a": "",
        "exceptionalexperiences": "",
        "isreadonly": "true",
        "options": "[object Object],[object Object],[object Object]",
        "placeholder": "common.no-content",
        "productbrand": "BRAND_NATIONAL_GEOGRAPHIC",
      }
    `);

    expect(wrapper.find(selectors.natGeoTourLevels).getComponent("nova-input-radio-group-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-nat-geo-tour-levels",
        "data-v-8979331a": "",
        "disabled": "false",
        "layout": "vertical",
        "modelvalue": "NAT_GEO_TOUR_LEVEL_PREMIUM",
        "name": "nat_geo_tour_level.options",
        "options": "[object Object],[object Object],[object Object]",
        "readonly": "",
        "readonlyplaceholder": "common.no-content",
      }
    `);

    expect(wrapper.find(selectors.ownOffer).getComponent("nova-input-radio-group-stub").attributes())
      .toMatchInlineSnapshot(`
      {
        "data-testid": "raw-settings-own-offer",
        "data-v-8979331a": "",
        "disabled": "false",
        "layout": "vertical",
        "modelvalue": "OWN_OFFER_3P_DESIGNED_OPERATED",
        "name": "own_offer.options",
        "options": "[object Object],[object Object],[object Object],[object Object]",
        "readonly": "",
        "readonlyplaceholder": "common.no-content",
      }
    `);
  });

  test('The supplier field is NOT readonly if the status is NOT "IN_CREATION"', () => {
    const initialValues = getModelValue();

    const wrapper = shallowMount(RawSettingsForm, {
      props: {
        masterdata: getMasterdata(),
        requiredFields: [],
        modelValue: initialValues,
        options: {
          isReadonly: false,
          showNatGeo: true,
          productType: "NOVA",
          statusCode: "IN_CREATION",
        },
      },
    });

    expect(wrapper.find(selectors.supplierName).getComponent("field-supplier-card-stub").attributes("readonly")).toBe(
      undefined
    );
  });

  test('The supplier field is readonly if the status is "IN_CREATION"', () => {
    const initialValues = getModelValue();

    const wrapper = shallowMount(RawSettingsForm, {
      props: {
        masterdata: getMasterdata(),
        requiredFields: [],
        modelValue: initialValues,
        options: {
          isReadonly: false,
          showNatGeo: true,
          productType: "NOVA",
          statusCode: "UP_TO_DATE",
        },
      },
    });

    expect(wrapper.find(selectors.supplierName).getComponent("field-supplier-card-stub").attributes("readonly")).toBe(
      ""
    );
  });

  test("The brand should be updated correctly", async () => {
    const initialValues = getModelValue();

    const wrapper = shallowMount(RawSettingsForm, {
      props: {
        masterdata: getMasterdata(),
        requiredFields: [],
        modelValue: initialValues,
        options: {
          isReadonly: false,
          showNatGeo: true,
          productType: "NOVA",
          statusCode: "UP_TO_DATE",
        },
      },
    });

    const { productBrand } = getStubbedComponents(wrapper);

    // @ts-expect-error ...
    productBrand.vm.$emit("update:productBrand", "BRAND_NONE");

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toMatchInlineSnapshot(`
      [
        [
          {
            "categories_interests": {
              "categories": [
                "BOAT_TRIPS",
              ],
              "interests": [
                "GOLF",
              ],
            },
            "collection_criteria": {
              "best_value_guaranteed": "",
              "created_with_care": "",
              "exceptional_experiences": "",
            },
            "external_reference_code": "sadas",
            "nat_geo_tour_levels": "",
            "own_offer": "OWN_OFFER_3P_DESIGNED_OPERATED",
            "product_brand": "BRAND_NONE",
            "promotional_options": "PROMOTIONAL_SPECIAL",
            "supplier_id": "082d65c7-3d18-484b-9dc5-6e33ef73be49",
            "title": "test",
          },
        ],
      ]
    `);
  });

  test("The collection criteria should be updated correctly", async () => {
    const initialValues = getModelValue();

    const wrapper = shallowMount(RawSettingsForm, {
      props: {
        masterdata: getMasterdata(),
        requiredFields: [],
        modelValue: initialValues,
        options: {
          isReadonly: false,
          showNatGeo: true,
          productType: "NOVA",
          statusCode: "UP_TO_DATE",
        },
      },
    });

    const { productBrand } = getStubbedComponents(wrapper);

    // @ts-expect-error ...
    productBrand.vm.$emit("update:bestValueGuaranteed", "test 1");
    // @ts-expect-error ...
    productBrand.vm.$emit("update:createdWithCare", "test 2");
    // @ts-expect-error ...
    productBrand.vm.$emit("update:exceptionalExperiences", "test 3");

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toMatchInlineSnapshot(`
      [
        [
          {
            "categories_interests": {
              "categories": [
                "BOAT_TRIPS",
              ],
              "interests": [
                "GOLF",
              ],
            },
            "collection_criteria": {
              "best_value_guaranteed": "test 1",
              "created_with_care": "test 2",
              "exceptional_experiences": "test 3",
            },
            "external_reference_code": "sadas",
            "nat_geo_tour_levels": "NAT_GEO_TOUR_LEVEL_PREMIUM",
            "own_offer": "OWN_OFFER_3P_DESIGNED_OPERATED",
            "product_brand": "BRAND_NATIONAL_GEOGRAPHIC",
            "promotional_options": "PROMOTIONAL_SPECIAL",
            "supplier_id": "082d65c7-3d18-484b-9dc5-6e33ef73be49",
            "title": "test",
          },
        ],
      ]
    `);
  });
});

function getModelValue(): RawExperienceValue {
  return {
    title: "test",
    own_offer: "OWN_OFFER_3P_DESIGNED_OPERATED",
    product_brand: "BRAND_NATIONAL_GEOGRAPHIC",
    nat_geo_tour_levels: "NAT_GEO_TOUR_LEVEL_PREMIUM",
    supplier_id: "082d65c7-3d18-484b-9dc5-6e33ef73be49",
    promotional_options: "PROMOTIONAL_SPECIAL",
    external_reference_code: "sadas",
    categories_interests: { categories: ["BOAT_TRIPS"], interests: ["GOLF"] },
    collection_criteria: { best_value_guaranteed: "", created_with_care: "", exceptional_experiences: "" },
  };
}

function getMasterdata(): RawSettingsMasterdata {
  return {
    productBrandOptions: [
      {
        code: "BRAND_NATIONAL_GEOGRAPHIC",
        name: "National Geographic Day Tours",
      },
      {
        code: "BRAND_NONE",
        name: "None",
      },
      {
        code: "BRAND_TUI_COLLECTION",
        name: "TUI Collection",
      },
    ],
    natGeoOptions: [
      {
        code: "NAT_GEO_TOUR_LEVEL_PREMIUM",
        name: "Premium level",
      },
      {
        code: "NAT_GEO_TOUR_LEVEL_MID",
        name: "Mid level",
      },
      {
        code: "NAT_GEO_TOUR_LEVEL_ENTRY",
        name: "Entry level",
      },
    ],
    experienceCategories: [
      { id: "cb63a17b-4dcf-480a-ad21-1408c38661af", code: "BOAT_TRIPS", name: "Boat Trips", language_code: "en" },
      {
        id: "322338ba-67c6-4541-8748-f5e539812cbc",
        code: "OVERNIGHT TRIPS",
        name: "Overnight Trips",
        language_code: "en",
      },
      {
        id: "d5c8e46b-ba08-4979-858a-8a84649c8287",
        code: "SIGHTSEEING_PASSES",
        name: "Sightseeing Passes",
        language_code: "en",
      },
      {
        id: "51ebb918-6aa7-4e67-98fe-44dedc3092f1",
        code: "HOP_ON_HOP_OFF",
        name: "Hop-on Hop-off",
        language_code: "en",
      },
      {
        id: "e7c2c095-c1b8-4966-a464-bbed2ebb3faa",
        code: "OUTDOOR ACTIVITIES",
        name: "Outdoor Activities",
        language_code: "en",
      },
      {
        id: "758b3989-efa0-449b-89d0-1c205aca39ed",
        code: "ATTRACTION_WALKING_TOURS",
        name: "Attraction & Walking Tours",
        language_code: "en",
      },
      { id: "3ada480d-3b53-48ba-984b-6961d34b7b31", code: "PRIVATE_TOURS", name: "Private tours", language_code: "en" },
      { id: "7988febe-8108-4c86-a669-7a38927984d4", code: "DAY_TRIPS", name: "Day Trips", language_code: "en" },
      {
        id: "6dcd3a42-93ff-42a7-aa2d-7edb04e6517b",
        code: "TICKETS_AND_EVENTS",
        name: "Tickets & Events",
        language_code: "en",
      },
      {
        id: "ccfc82b3-19df-4efa-a16d-458ed05f3a3d",
        code: "SHOREX",
        name: "Shorex",
        language_code: "en",
        core_code: "209",
      },
      {
        id: "a57a3548-8871-4bcd-b73a-09630e9cc215",
        code: "SERVICES_AND_EXTRAS",
        name: "Services & Extras",
        language_code: "en",
      },
      { id: "12325765-4597-4237-9985-e3f0023b217b", code: "THEME_PARKS", name: "Theme Parks", language_code: "en" },
      {
        id: "b54d4193-256d-4472-9418-c6c935433063",
        code: "CLASSE_WORKSHOPS",
        name: "Classes & Workshops",
        language_code: "en",
      },
    ],
    experienceInterests: [
      {
        id: "4700f60e-b6da-47cc-8689-5648e6624519",
        code: "BIKES_AND_SCOOTERS",
        name: "Bikes & Scooters",
        language_code: "en",
        core_code: "new-segway-tours",
        olp_code: "PCSG_02_07",
      },
      {
        id: "607ca1d6-d2a2-4a1b-ab4f-37cdf5ec881e",
        code: "FOOD_AND_DRINK",
        name: "Food & Drink / Gastronomy & Wine",
        language_code: "en",
        core_code: "new-food-drink",
        olp_code: "PCSG_01_05",
      },
      {
        id: "0c102cda-9a10-4e10-9390-5637b389dd3a",
        code: "HIKING_AND_TREKKING",
        name: "Hiking & Trekking",
        language_code: "en",
        core_code: "new-hiking-bike-tours",
        olp_code: "PCSU_02_03_05",
      },
      {
        id: "1951e3cd-1a4d-47a1-ba52-5b5daa141b12",
        code: "MUSEUMS_AND_ART_GALLERIES",
        name: "Museums & Art Galleries",
        language_code: "en",
        core_code: "new-museums-art-galleries",
        olp_code: "PCSG_07_02",
      },
      {
        id: "a3f8ee09-8d9e-4408-80e5-63781a69efeb",
        code: "NIGHTLIFE",
        name: "Nightlife",
        language_code: "en",
        core_code: "new-nightlife",
        olp_code: "PCSG_01_06",
      },
      {
        id: "449e2371-96e9-49f2-a0cc-97efe9f79116",
        code: "CONSERVATION",
        name: "Conservation",
        language_code: "en",
        core_code: "new-travel-for-a-cause",
        olp_code: "PCSG_07_01",
      },
      {
        id: "f1f1343f-d95b-4f92-91a0-d8d0e9e2f231",
        code: "HOT_AIRS",
        name: "Hot Air Balloons",
        language_code: "en",
        core_code: "new-hot-air-balloon",
        olp_code: "PCSU_02_05_02",
      },
      {
        id: "7e624b70-4b82-4f3f-a4c1-19eb69446f86",
        code: "AIR_ACTIVITIES",
        name: "Air Activities",
        language_code: "en",
        core_code: "new-air-activities",
        olp_code: "PCSG_02_05",
      },
      {
        id: "9b567bfa-84dd-41e4-aa89-f41f0450b2c3",
        code: "HISTORY_AND_HERITAGE",
        name: "History & Heritage",
        language_code: "en",
        core_code: "new-cultural-historic",
        olp_code: "PCSU_01_02_01",
      },
      {
        id: "ada50ce9-b505-4253-9fef-a5b1f99dc0c7",
        code: "MUST_SEES",
        name: "Must-sees",
        language_code: "en",
        core_code: "new-must-sees",
        olp_code: "PCSU_01_02_04",
      },
      {
        id: "57d536f9-4d3f-48c8-8031-10ea6e1cd2a2",
        code: "THEATER_SHOWS_PERFORMANCES",
        name: "Theater, Shows & Performances",
        language_code: "en",
        core_code: "new-theater-shows",
        olp_code: "PCSG_03_04",
      },
      {
        id: "e55c53e6-ca2e-4406-b507-298c602cf3ce",
        code: "WELLNESS_AND_SPA",
        name: "Wellness & Spa",
        language_code: "en",
        core_code: "new-wellness-fitness-spa",
        olp_code: "PCSU_02_01_02",
      },
      {
        id: "e7df6408-861d-47ed-97fb-2e8343d5e3b7",
        code: "WALKING_TOUR",
        name: "Walking Tour",
        language_code: "en",
        core_code: "new-walking-tours",
        olp_code: "PCSG_02_06",
      },
      {
        id: "e7df6408-861d-47ed-97fb-2e8343d5e3b9",
        code: "GOLF",
        name: "Golf",
        language_code: "en",
        core_code: "new-golf",
        olp_code: "PCSU_02_03_05",
      },
      {
        id: "e7df6408-861d-47ed-97fb-2e8343d5e3c6",
        code: "THEME_PARKS",
        name: "Theme Parks",
        language_code: "en",
        core_code: "new-theme-parks",
        olp_code: "PCSG_01_07",
      },
      {
        id: "a750369f-4321-495f-88e7-f88dfc2b1993",
        code: "FESTIVAL_AND_CONCERTS",
        name: "Festival & Concerts",
        language_code: "en",
        core_code: "new-festival-concerts",
        olp_code: "PCSG_03_03",
      },
      {
        id: "dabc267d-6b3b-46e7-ab42-e16e52082a32",
        code: "LOCAL_IMMERSION",
        name: "Local Immersion",
        language_code: "en",
        core_code: "new-sightseeing-traditions",
        olp_code: "PCSG_07_03",
      },
      {
        id: "fd3ec287-9f01-46b5-961a-120327963158",
        code: "SEASONAL",
        name: "Seasonal",
        language_code: "en",
        core_code: "new-second-level-seasonal-events",
        olp_code: "PCSG_03_08",
      },
      {
        id: "c54a4b3f-1094-435e-8a89-5c27f2ed2db6",
        code: "MARKETS_AND_SHOPPING",
        name: "Markets & Shopping",
        language_code: "en",
        core_code: "new-markets-crafts",
        olp_code: "PCSU_02_04_01",
      },
      {
        id: "1c8dbd65-dcf0-4d54-a168-f89dd6ba8fc4",
        code: "WATER_ACTIVITIES",
        name: "Water Activities",
        language_code: "en",
        core_code: "new-boats",
        olp_code: "PCSG_02_02",
      },
      {
        id: "e8663b6f-3008-4f8a-92c6-eef7a96208b6",
        code: "ZOOS_AND_ACQUARIUM",
        name: "Zoos & Aquariums",
        language_code: "en",
        core_code: "new-zoos-aquarium",
        olp_code: "PCSG_03_10",
      },
      {
        id: "537f527e-0643-4a81-9d53-2682743293a8",
        code: "HELICOPTERS",
        name: "Helicopter rides",
        language_code: "en",
        core_code: "new-helicopter-ride",
        olp_code: "PCSU_02_05_02",
      },
      {
        id: "d58c28d4-c9a5-4689-81c7-9b27f816cb7c",
        code: "ACTIVE_AND_ADVENTURE",
        name: "Active & Adventure",
        language_code: "en",
        core_code: "new-great-outdoors",
        olp_code: "PCSG_02_06",
      },
      {
        id: "1abdadc3-5495-42aa-a30f-df00177ca133",
        code: "NATURE_AND_WILDLIFE",
        name: "Nature & Wildlife",
        language_code: "en",
        core_code: "new-nature",
        olp_code: "PCSU_02_03_01",
      },
      {
        id: "d64542f5-ea9f-4d58-9d5c-3e4a9810d4fa",
        code: "OFF_ROAD",
        name: "Off-road",
        language_code: "en",
        core_code: "new-off-road",
        olp_code: "PCSU_02_03_02",
      },
      {
        id: "8fe6ed74-b258-4fe4-9bf0-9e18017be27b",
        code: "SPORTS",
        name: "Sports",
        language_code: "en",
        core_code: "new-sports",
        olp_code: "PCSG_03_07",
      },
      {
        id: "b7972ff9-fdaa-40b9-85be-e55509eb1b7b",
        code: "WATER_PARKS",
        name: "Water Parks",
        language_code: "en",
        core_code: "new-water-parks",
        olp_code: "PCSG_03_02",
      },
    ],
    isSupplierLoading: false,
    supplierList: [
      {
        id: "082d65c7-3d18-484b-9dc5-6e33ef73be49",
        source: "BP",
        name: "Museo Nazionale della Scienza e della Tecnologia",
        email: "must@musement.com",
      },
      {
        id: "6b035bb6-0e0b-4827-a65f-2e11a0ba3c31",
        source: "BP",
        name: "Opera della Primarziale Pisana",
        email: "opapisa@musement.com",
      },
      {
        id: "90f6d745-925d-4e03-b27c-d20643286ee7",
        source: "BP",
        name: "Key Tours S.A",
        email: "finance@keytours.gr",
        commission: 20,
      },
      {
        id: "3dc42020-d1d4-4073-9e95-fc707bdfab5a",
        source: "BP",
        name: "Somewhere sas",
        email: "booking@somewhere.it",
        commission: 15,
      },
      {
        id: "c2b1e5d0-04f2-46f1-b74b-4f9a5c75d7f9",
        source: "NOVA",
        name: "Test",
        email: "test@domain.com",
        commission: 0,
      },
    ],
    promotionalOptions: [
      {
        code: "PROMOTIONAL_SPECIAL",
        name: "Special offer/promo",
      },
      {
        code: "PROMOTIONAL_SELL_OUT",
        name: "Likely to sell out",
      },
      {
        code: "PROMOTIONAL_NONE",
        name: "None",
      },
    ],
    ownOfferOptions: [
      {
        code: "OWN_OFFER_3P_DESIGNED_OPERATED",
        name: "3P Designed & 3P Operated",
      },
      {
        code: "OWN_OFFER_TUI_DESIGNED_OPERATED",
        name: "TUI Designed & TUI Operated",
      },
      {
        code: "OWN_OFFER_PARTNER_DESIGNED_TUI_OPERATED",
        name: "Partner Designed, TUI Operated",
      },
      {
        code: "OWN_OFFER_TUI_DESIGNED_3P_OPERATED",
        name: "TUI Designed & 3P Operated",
      },
    ],
  };
}
