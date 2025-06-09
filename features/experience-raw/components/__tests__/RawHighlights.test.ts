import { config, mount } from "@vue/test-utils";
import { test, expect, describe, vi } from "vitest";
import RawHighlights, { Props } from "../RawHighlights.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const selectors = {
  title: ".PremadeHighlightsTitle",
  editablePremade: '[data-testid="raw-highlights-editable-premade-list"]',
  emptyPremade: '[data-testid="raw-highlights-empty-premade-list"]',
  editableCustom: '[data-testid="raw-highlights-editable-custom-list"]',
  emptyCustom: '[data-testid="raw-highlights-empty-custom-list"]',
  modalButton: '[data-testid="raw-highlights-premade-modal"]',
};

describe("RawHighlights", () => {
  test("it renders correctly", () => {
    const wrapper = mount(RawHighlights, { props: getProps() });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.editablePremade).isVisible()).toBe(true);
    expect(wrapper.find(selectors.editableCustom).isVisible()).toBe(true);
    expect(wrapper.find(selectors.modalButton).isVisible()).toBe(true);
  });

  test("if no premades are passed, it renders correctly", () => {
    const props = getProps();

    props.modelValue.premade = [];
    props.readonly = true;
    const wrapper = mount(RawHighlights, { props });

    expect(wrapper.find(selectors.emptyPremade).isVisible()).toBe(true);
  });

  test("if no customs are passed, it renders correctly", () => {
    const props = getProps();

    props.modelValue.custom = [];
    props.readonly = true;
    const wrapper = mount(RawHighlights, { props });

    expect(wrapper.find(selectors.emptyCustom).isVisible()).toBe(true);
  });
});

function getProps(): Props {
  return {
    options: {
      title: "My title!",
      placeholder: "My placeholder",
    },
    modelValue: {
      custom: [
        {
          name: "Speedboat ride",
          action: "NOOP",
          id: "9a496345-148e-4460-93a4-8f9ac9be79b2",
          visualization_order: 0,
          language_code: "en",
        },
        {
          name: "Sunset cruise",
          action: "NOOP",
          id: "f0f7a379-ecd5-4032-854a-21d12cd6dc63",
          visualization_order: 1,
          language_code: "en",
        },
        {
          id: "3fd33674-884e-4fad-ba2d-e0ec3547eecf",
          name: "River Cruise",
          action: "NOOP",
          visualization_order: 2,
          language_code: "en",
        },
      ],
      premade: [
        {
          name: "Speedboat ride",
          action: "NOOP",
          id: "9a496345-148e-4460-93a4-8f9ac9be79b2",
          visualization_order: 0,
          language_code: "en",
        },
        {
          name: "Sunset cruise",
          action: "NOOP",
          id: "f0f7a379-ecd5-4032-854a-21d12cd6dc63",
          visualization_order: 1,
          language_code: "en",
        },
        {
          id: "3fd33674-884e-4fad-ba2d-e0ec3547eecf",
          name: "River Cruise",
          action: "NOOP",
          visualization_order: 2,
          language_code: "en",
        },
      ],
    },
    masterdataOptions: [
      {
        id: "af81a245-cb0f-4088-b46c-8625f5bafcf0",
        code: "BOATCRUISE",
        name: "Boat cruise",
        language_code: "en",
        visualization_order: 0,
      },
      {
        id: "5fc5da58-61ba-4388-af55-129057970256",
        code: "SAILBOATCRUISE",
        name: "Sailboat cruise",
        language_code: "en",
        visualization_order: 1,
      },
      {
        id: "9a496345-148e-4460-93a4-8f9ac9be79b2",
        code: "SPEEDBOATRIDE",
        name: "Speedboat ride",
        language_code: "en",
        visualization_order: 2,
      },
      {
        id: "f0f7a379-ecd5-4032-854a-21d12cd6dc63",
        code: "SUNSETCRUISE",
        name: "Sunset cruise",
        language_code: "en",
        visualization_order: 3,
      },
      {
        id: "3fd33674-884e-4fad-ba2d-e0ec3547eecf",
        code: "RIVERCRUISE",
        name: "River Cruise",
        language_code: "en",
        visualization_order: 4,
      },
      {
        id: "ee3303fc-c1db-4482-bd36-16125e93cec1",
        code: "ALLMEALS",
        name: "All meals",
        language_code: "en",
        visualization_order: 5,
      },
      {
        id: "a1fd288b-ece8-405f-acf2-63e76a465fed",
        code: "DRINKS",
        name: "Drinks",
        language_code: "en",
        visualization_order: 6,
      },
      {
        id: "a161a213-4b7e-4248-8b58-95b4d421bb1d",
        code: "TRANSPORT",
        name: "Transport",
        language_code: "en",
        visualization_order: 7,
      },
      {
        id: "bfc8527b-2fc9-4717-8301-4f5c0a634c35",
        code: "BOATTRANSFER",
        name: "Boat transfer",
        language_code: "en",
        visualization_order: 8,
      },
    ],
    hierarchicalGroups: new Map(),
  };
}

const hierarchicalGroups = new Map([
  ["FEATURE-1", { name: "Feature-1" }],
  ["FEATURE-2", { name: "Feature-2" }],
  ["FEATURE-3", { name: "Feature-3" }],
]);
const masterDataStoreMock = {
  hierarchicalGroups,
};
vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));
