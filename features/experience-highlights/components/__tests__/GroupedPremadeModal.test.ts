import { mount, config } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import GroupedPremadeModal from "../GroupedPremadeModal.vue";
import GroupedPremadeModalForm from "../GroupedPremadeModalForm.vue";
import lodash from "lodash";

config.global.mocks = {
  $t: (key: string) => key,
};

config.global.stubs = {
  GroupedPremadeModalForm: true,
};

// cloneDeep does not work in tests???
vi.spyOn(lodash, "cloneDeep").mockImplementation((o) => o);

describe("GroupedPremadeModal", () => {
  const title = "Highlights";
  const options = [
    {
      id: "9a496345-148e-4460-93a4-8f9ac9be79b2",
      code: "SPEEDBOATRIDE",
      hierarchical_group_code: "FEATURE-1",
      name: "Speedboat ride",
      language_code: "en",
    },
    {
      id: "f96c0ffb-bb55-4c62-8edc-50d8a8790757",
      code: "ENTRANCEFEES",
      name: "Entrance fees",
      description: "Description if it needs",
      language_code: "en",
      hierarchical_group_code: "FEATURE-2",
    },
    { id: "6e7148f9-c7e7-4555-8c11-f8240458206e", code: "BOATCRUISE", name: "Boat cruise", language_code: "en" },
    {
      id: "71629133-5b06-45f3-9986-8267e5f110f8",
      code: "SAILBOATCRUISE",
      name: "Sailboat cruise",
      language_code: "en",
      hierarchical_group_code: "FEATURE-3",
    },
  ];
  const modelValue = new Map([
    [
      "9a496345-148e-4460-93a4-8f9ac9be79b2",
      {
        id: "9a496345-148e-4460-93a4-8f9ac9be79b2",
        code: "SPEEDBOATRIDE",
        hierarchical_group_code: "FEATURE-1",
        name: "Speedboat ride",
        language_code: "en",
      },
    ],
    [
      "f96c0ffb-bb55-4c62-8edc-50d8a8790757",
      {
        id: "f96c0ffb-bb55-4c62-8edc-50d8a8790757",
        code: "ENTRANCEFEES",
        name: "Entrance fees",
        description: "Description if it needs",
        language_code: "en",
        hierarchical_group_code: "FEATURE-2",
      },
    ],
  ]);

  test("it renders the groups correctly", async () => {
    // @ts-expect-error ...
    const wrapper = mount(GroupedPremadeModal, {
      props: { options, hierarchicalGroups, modelValue, title },
    });

    await wrapper.find('[data-testid="highlight-manager-premade-list-open-modal"]').trigger("click");

    // # of groups + the UNCATEGORIZED group
    expect(wrapper.findAllComponents(GroupedPremadeModalForm)).toHaveLength(hierarchicalGroups.size + 1);
  });

  test("should filter options based on search query", async () => {
    // @ts-expect-error ...
    const wrapper = mount(GroupedPremadeModal, {
      props: {
        options,
        hierarchicalGroups,
        modelValue,
        title,
      },
    });

    await wrapper.find('[data-testid="highlight-manager-premade-list-open-modal"]').trigger("click");

    const searchInput = wrapper.find("#premade-modal-search-bar");
    await searchInput.setValue(options[0].name);

    const forms = wrapper.findAllComponents(GroupedPremadeModalForm);

    expect(forms.at(0)?.props("filteredOptions")).toStrictEqual([options[0]]);
    expect(forms.at(1)?.props("filteredOptions")).toBeUndefined();
  });

  test('should clear all selected options when "Clear All" button is clicked', async () => {
    // @ts-expect-error ...
    const wrapper = mount(GroupedPremadeModal, {
      props: {
        title,
        options,
        hierarchicalGroups,
        modelValue,
      },
    });

    await wrapper.find('[data-testid="highlight-manager-premade-list-open-modal"]').trigger("click");

    const clearAllButton = wrapper.find('[data-testid="premade-modal-clear-all"]');
    await clearAllButton.trigger("click");

    const forms = wrapper.findAllComponents(GroupedPremadeModalForm);

    expect(forms.at(0)?.props("modelValue")).toStrictEqual(new Map());
    expect(forms.at(1)?.props("modelValue")).toStrictEqual(new Map());
  });

  test('should emit "update:modelValue" event with selected options when "Save" button is clicked', async () => {
    // @ts-expect-error ...
    const wrapper = mount(GroupedPremadeModal, {
      props: {
        options,
        hierarchicalGroups,
        modelValue,
        title,
      },
    });

    await wrapper.find('[data-testid="highlight-manager-premade-list-open-modal"]').trigger("click");

    const saveButton = wrapper.find('[data-testid="premade-modal-save"]');
    await saveButton.trigger("click");

    expect(wrapper.emitted()["update:modelValue"][0]).toEqual([modelValue]);
  });
});

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
