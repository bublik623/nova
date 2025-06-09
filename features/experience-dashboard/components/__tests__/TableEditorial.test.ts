import { ref } from "vue";
import { vi, describe, test, expect, afterEach, beforeEach } from "vitest";
import { shallowMount, config, mount } from "@vue/test-utils";
import TableEditorial, { Props } from "../TableEditorial.vue";
import * as detectItemScrollableComposable from "@/composables/useDetectItemScrollable";
import { createPinia, setActivePinia } from "pinia";

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
  items: "[data-testid='dashboard-table-item-editorial']",
  expandedRow: "[data-testid='expanded-row']",
  spinner: "[data-testid='nova-spinner']",
  noItemsMsg: "[data-testid='table-editorial-no-items-warning']",
  statusCell: "[data-testid='cell-status']",
  statusCellValueAttributeName: "data-status",
};

const masterDataStoreMock = {
  getCountryByCode: vi.fn(),
  getCityByCode: vi.fn(),
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

const items = [
  {
    experience_id: "test-id-1",
    language_code: "en",
    supplier_id: "supplier",
    reference_code: "EXP0000001",
    location: {
      address: {
        city: "test-city",
      },
    },
    experience_translation: {
      name: "name",
      id: "translation-1",
      title: "test-title-1",
      creation_date: "2022-01-01",
      updated_date: "2022-02-01",
      distribution_status: "READY",
    },
    translations: [
      {
        experience_id: "test-id-1",
        language_code: "it",
        supplier_id: "supplier",
        experience_translation: {
          name: "name",
          id: "translation-1",
          title: "test-title-1",
          creation_date: "2022-01-01",
          updated_date: "2022-02-01",
        },
      },
    ],
  },
  {
    experience_id: "test-id-2",
    reference_code: "EXP0000002",
    language_code: "en",
    location: {
      address: {
        city: "test-city",
      },
    },
    supplier_id: "supplier",
    experience_translation: {
      name: "name",
      id: "translation-2",
      title: "test-title-2",
    },
    translations: [],
  },
  {
    experience_id: "test-id-3",
    language_code: "en",
    supplier_id: "supplier",
    translations: [],
  },
];

const props: Props = {
  searchText: "",
  activeSortKey: "title",
  activeSortDirection: "asc",
  isReadonly: false,
};

const contentQueryApiMock = {
  getAllDistributionContents: vi.fn(() => Promise.resolve({ data: items })),
};

const notificationStoreMock = {
  addNotification: vi.fn(),
};

const routerMock = {
  push: vi.fn(),
};

const refresh = vi.fn();
const useLazyAsyncDataMock = vi.fn(() => ({ data: items, refresh }));

vi.mock("@/composables/useContentQueryApi", () => ({
  useContentQueryApi: () => contentQueryApiMock,
}));
vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));
vi.stubGlobal("useLazyAsyncData", useLazyAsyncDataMock);
vi.stubGlobal("useRouter", () => routerMock);

describe("TableEditorial", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    vi.spyOn(detectItemScrollableComposable, "useDetectItemScrollable").mockReturnValueOnce({
      isHorizontallyScrollable: ref(true),
      isVerticallyScrollable: ref(true),
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("it should render correctly", async () => {
    const wrapper = shallowMount(TableEditorial, { props });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper.vm as any).fetchEditorialItems();

    expect(wrapper.findAll(selectors.items).length).toBe(items.length);
    expect(wrapper.html()).toContain(items[0].reference_code);
    expect(wrapper.html()).toContain(items[0].experience_translation?.title);
    expect(wrapper.html()).toContain(items[1].reference_code);
    expect(wrapper.html()).toContain(items[1].experience_translation?.title);
  });

  test("it should display distrubution status correctly", async () => {
    const wrapper = shallowMount(TableEditorial, { props });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper.vm as any).fetchEditorialItems();

    expect(wrapper.findAll(selectors.statusCell)[0].attributes()[selectors.statusCellValueAttributeName]).toBe("READY");
  });

  describe("while it's loading the items", () => {
    test("it should show a spinner", () => {
      useLazyAsyncDataMock.mockImplementationOnce(() => ({
        data: [],
        pending: true,

        refresh,
      }));

      const wrapper = shallowMount(TableEditorial, { props });

      expect(wrapper.find(selectors.items).exists()).toBe(false);
      expect(
        wrapper
          .findComponent({
            name: "NovaSpinner",
          })
          .exists()
      ).toBe(true);
    });
  });

  describe("when there are no items", () => {
    test("it should show a message", () => {
      useLazyAsyncDataMock.mockImplementationOnce(() => ({
        data: [],

        refresh,
      }));

      const wrapper = shallowMount(TableEditorial, { props });

      expect(wrapper.find(selectors.items).exists()).toBe(false);
      expect(wrapper.find(selectors.noItemsMsg).exists()).toBe(true);
    });

    test("it should not fetch the translations", async () => {
      contentQueryApiMock.getAllDistributionContents.mockImplementationOnce(() =>
        Promise.resolve({
          data: [],
        })
      );

      const wrapper = shallowMount(TableEditorial, { props });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).fetchEditorialItems();

      expect(contentQueryApiMock.getAllDistributionContents).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the user clicks on the edit button", () => {
    test("it should redirect to the curation page", async () => {
      const wrapper = shallowMount(TableEditorial, { props, global: { stubs: { teleport: true } } });

      await wrapper.find(selectors.items).trigger("click");
      const curationRow = wrapper.findComponent({
        name: "ExperienceActionDropdown",
      });

      await curationRow.vm.$emit("edit", "test-id-1");

      expect(routerMock.push).toHaveBeenCalledWith("/experience/test-id-1/curation/settings");
    });
  });

  describe("when the user clicks on the title", () => {
    test("it should redirect to the curation page", async () => {
      const wrapper = shallowMount(TableEditorial, { props });

      const row = wrapper.findAll(selectors.items)[0];
      await row.find(".TableItem__title").trigger("click");

      expect(routerMock.push).toHaveBeenCalledWith("/experience/test-id-1/curation/settings");
    });
  });

  describe("when the user clicks on the translation", () => {
    test("it should redirect to the translation page", async () => {
      const wrapper = shallowMount(TableEditorial, { props, global: { stubs: { teleport: true } } });

      await wrapper.find(selectors.items).trigger("click");
      const translationRow = wrapper.findComponent({
        name: "TableExpandedRow",
      });

      await translationRow.vm.$emit("click:edit", "test-id-1", "it");

      expect(routerMock.push).toHaveBeenCalledWith("/experience/test-id-1/translation/it");
    });
  });

  describe("when there is an error while fetching the items", () => {
    test("it should show a notification", async () => {
      contentQueryApiMock.getAllDistributionContents.mockRejectedValueOnce("");
      const wrapper = shallowMount(TableEditorial, { props });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).fetchEditorialItems();

      expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
        message: "notifications.error.fetching.experiences",
        theme: "error",
      });
    });
  });

  describe("when the table is not scrollable", () => {
    test("it should hide the scroll shadow", () => {
      vi.spyOn(detectItemScrollableComposable, "useDetectItemScrollable").mockReturnValueOnce({
        isHorizontallyScrollable: ref(false),
        isVerticallyScrollable: ref(false),
      });

      const wrapper = shallowMount(TableEditorial, { props });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).scrollShadowOpacity).toBe(0);
    });
  });

  test("if there is an error with the masterdata the dashboard should should not break", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    const error = new Error("test");

    masterDataStoreMock.getCityByCode.mockImplementation(() => {
      throw error;
    });

    const wrapper = shallowMount(TableEditorial, { props });

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);

    expect(wrapper.findAll(selectors.items).length).toBe(items.length);
  });

  describe("when the user clicks on a TableSortButton", () => {
    test("it should emit the update:activeSortKey event", async () => {
      const wrapper = mount(TableEditorial, { props });

      const sortButton = wrapper.findComponent({ name: "TableSortButton" });

      await sortButton.trigger("click");
      expect(wrapper.emitted()["update:activeSortKey"][0]).toEqual(["title"]);
    });
  });

  describe("if is readonly", () => {
    test("it should not show the actions", () => {
      const wrapper = mount(TableEditorial, { props: { ...props, isReadonly: true } });

      expect(wrapper.findComponent({ name: "ExperienceActionDropdown" }).exists()).toBe(false);
    });
  });
});
