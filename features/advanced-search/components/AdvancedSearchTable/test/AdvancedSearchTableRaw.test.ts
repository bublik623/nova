import { config, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import AdvancedSearchTableRaw from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchTableRaw.vue";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import * as detectItemScrollableComposable from "@/composables/useDetectItemScrollable";
import { testId } from "@/utils/test.utils";
const items = [
  {
    content: {
      id: "test-id-1",
      experience_id: "test-exp-1",
      supplier_id: "supplier-1",
      commercial: { title: "test-title-1" },
      creation_date: "2022-01-01",
      updated_date: "2022-02-01",
      status_code: "test",
      functional: {
        location: {
          address: { country: "country 1", city: "123" },
        },
      },
    },
  },
  {
    content: {
      id: "test-id-2",
      experience_id: "test-exp-2",
      supplier_id: "supplier-2",
      commercial: { title: "test-title-2" },
      creation_date: "2022-01-01",
      updated_date: "2022-02-01",
      status_code: "test",
      functional: {
        location: {
          address: { country: "country 2", city: "123" },
        },
      },
    },
  },
];

const supplierList = [
  {
    id: "supplier-1",
    name: "Supplier 1",
  },
  {
    id: "supplier-2",
    name: "Supplier 2",
  },
];

const isExperienceSelectedMock = vi.fn<[string], boolean>();

const props = {
  supplierList,
  items,
  isExperienceSelected: isExperienceSelectedMock,
  areAllSelected: false,
  areSomeSelected: false,
  pending: false,
  activeSortKey: "title",
  activeSortDirection: "asc",
};

const routerMock = {
  push: vi.fn(),
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (s: string) => s,
  $router: routerMock,
};

const masterDataStoreMock = {
  getCityByCode: vi.fn(() => ({ name: "city" })),
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

const thSelectors = {
  th_checkbox: "adv-search-th-checkbox",
  th_title: "adv-search-th-title",
  th_ref_code: "adv-search-th-ref-code",
  th_modified: "adv-search-th-modified",
  th_supplier: "adv-search-th-supplier",
  th_country: "adv-search-th-country",
  th_city: "adv-search-th-city",
  th_created: "adv-search-th-created",
};

const tdSelectors = {
  td_checkbox: "adv-search-td-checkbox",
  td_title: "adv-search-td-title",
  td_ref_code: "adv-search-td-ref-code",
  td_modified: "adv-search-td-modified",
  td_supplier: "adv-search-td-supplier",
  td_country: "adv-search-td-country",
  td_city: "adv-search-td-city",
  td_created: "adv-search-td-created",
};

const selectors = {
  spinner: "nova-spinner",
  noItemsMsg: "adv-search-table-raw-no-items-warning",
  items: "adv-search-table-item",
  itemsLink: "adv-search-td-title-link",
};

describe("AdvancedSearchTableRaw", () => {
  beforeEach(() => {
    vi.spyOn(detectItemScrollableComposable, "useDetectItemScrollable").mockReturnValueOnce({
      isHorizontallyScrollable: ref(true),
      isVerticallyScrollable: ref(true),
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should mount correctly", () => {
    const wrapper = mount(AdvancedSearchTableRaw, { props });

    Object.values(thSelectors).forEach((el) => {
      expect(wrapper.find(testId(el)).exists()).toBeTruthy();
    });

    Object.values(tdSelectors).forEach((el) => {
      expect(wrapper.findAll(testId(el)).length).toBe(2);
    });
    expect(wrapper.find(testId(selectors.spinner)).exists()).toBe(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((wrapper.vm as any).scrollShadowOpacity).toBe(1);
  });

  describe("when the user clicks on the title", () => {
    test("it should navigate to the raw content page", async () => {
      const wrapper = mount(AdvancedSearchTableRaw, { props });

      await wrapper.findAll(testId(selectors.itemsLink))[0].trigger("click");

      expect(routerMock.push).toHaveBeenCalledWith("/experience/test-exp-1/raw/settings");
    });
  });

  describe("when pending is set to true", () => {
    test("it should show a spinner", () => {
      const wrapper = mount(AdvancedSearchTableRaw, { props: { ...props, pending: true } });

      expect(wrapper.find(testId(selectors.spinner)).exists()).toBe(true);
    });
  });

  describe("when there are no items", () => {
    test("it should show a message", () => {
      const wrapper = mount(AdvancedSearchTableRaw, { props: { ...props, pending: false, items: [] } });

      expect(wrapper.find(testId(selectors.noItemsMsg)).exists()).toBe(true);
    });
  });

  describe("when the table is not scrollable", () => {
    test("it should hide the scroll shadow", () => {
      vi.spyOn(detectItemScrollableComposable, "useDetectItemScrollable").mockReturnValueOnce({
        isHorizontallyScrollable: ref(false),
        isVerticallyScrollable: ref(false),
      });

      const wrapper = mount(AdvancedSearchTableRaw, { props });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).scrollShadowOpacity).toBe(0);
    });
  });
});
