import { vi, describe, test, expect, afterEach } from "vitest";
import { config, shallowMount } from "@vue/test-utils";
import TableExpandedRow, { Props } from "../TableExpandedRow.vue";
import { DocumentFlow } from "@/types/DocumentStatuses";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (s: string) => s,
};

config.global.stubs = {
  DocumentStatusLabel: {
    template: "<span></span>",
  },
};

const selectors = {
  translations: "[data-testid='expanded-row-item']",
  button: "[data-testid='table-action-edit-translation']",
  noItemsMsg: "[data-testid='expanded-row-no-items']",
  statusCell: "[data-testid='cell-status']",
  statusCellValueAttributeName: "data-status",
};

const props: Props = {
  show: true,
  isReadonly: false,
  translations: [
    {
      experience_id: "test-id-1",
      language_code: "en",
      supplier_id: "supplier",
      experience_translation: {
        name: "name",
        id: "translation-1",
        title: "test-title-1",
        creation_date: "2022-01-01",
        updated_date: "2022-02-01",
        distribution_status: "READY",
        flow_code: DocumentFlow.CURATION,
        status_code: "IN_REVIEW",
      },
    },
    {
      experience_id: "test-id-2",
      language_code: "es",
      supplier_id: "supplier",
      experience_translation: {
        name: "name",
        id: "translation-2",
        title: "test-title-2",
        creation_date: "2022-01-01",
        updated_date: "2022-02-01",
        distribution_status: "READY",
        flow_code: DocumentFlow.CURATION,
        status_code: "IN_REVIEW",
      },
    },
  ],
  columnTemplate: "315px 265px 100px 130px 350px 1fr 80px",
};

describe("TableExpandedRow", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("it should render correctly", () => {
    const wrapper = shallowMount(TableExpandedRow, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.html()).toContain(props.translations[0].language_code);
    expect(wrapper.html()).toContain(props.translations[1].language_code);
    expect(wrapper.findAll(selectors.translations).length).toBe(props.translations.length);
  });

  test("it should display distrubution status correctly", async () => {
    const wrapper = shallowMount(TableExpandedRow, { props });

    expect(wrapper.findAll(selectors.statusCell)[0].attributes()[selectors.statusCellValueAttributeName]).toBe("READY");
  });

  describe("when there are no translations", () => {
    test("it should show a message", () => {
      const wrapper = shallowMount(TableExpandedRow, {
        props: { ...props, translations: [] },
      });

      expect(wrapper.find(selectors.translations).exists()).toBe(false);
      expect(wrapper.find(selectors.noItemsMsg).exists()).toBe(true);
    });
  });

  describe("it should render correctly", () => {
    test("it display the dropdown", async () => {
      const wrapper = shallowMount(TableExpandedRow, { props, global: { stubs: { teleport: true } } });
      const dropdown = wrapper.findComponent({ name: "ExperienceActionDropdown" });

      expect(dropdown).toBeTruthy();
    });
  });

  describe("if is readonly", () => {
    test("it should not show the actions", () => {
      const wrapper = shallowMount(TableExpandedRow, { props: { ...props, isReadonly: true } });

      expect(wrapper.findComponent({ name: "ExperienceActionDropdown" }).exists()).toBe(false);
    });
  });
});
