import { ref } from "vue";
import { vi, describe, test, expect, afterEach, beforeEach } from "vitest";
import { mount, config } from "@vue/test-utils";
import TableRaw, { Props } from "../TableRaw.vue";
import * as detectItemScrollableComposable from "@/composables/useDetectItemScrollable";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

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

config.global.stubs = {
  DocumentStatusLabel: {
    template: "<span></span>",
  },
};

const masterDataStoreMock = {
  getCountryByCode: vi.fn(),
  getCityByCode: vi.fn(),
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

const selectors = {
  items: "[data-testid='dashboard-table-item-raw']",
  buttonEdit: "[data-testid='table-action-edit-raw']",
  buttonDelete: "[data-testid='table-action-delete-raw']",
  spinner: "[data-testid='nova-spinner']",
  noItemsMsg: "[data-testid='table-raw-no-items-warning']",
  confirmationModal: "[data-testid='modal']",
};

const rawExperiences = [
  {
    id: "test-id-1",
    reference_code: "EXP0000001",
    experience_id: "test-exp-1",
    experience_source: "NOVA",
    commercial: { title: "test-title-1" },
    creation_date: "2022-01-01",
    updated_date: "2022-02-01",
    status_code: "test",
    functional: {
      location: {
        address: {
          city: "test-city",
        },
      },
    },
  },
  {
    id: "test-id-2",
    reference_code: "EXP0000002",
    experience_id: "test-exp-2",
    experience_source: "NOVA",
    commercial: { title: "test-title-2" },
    creation_date: "2022-01-01",
    updated_date: "2022-02-01",
    status_code: "test",
    functional: {
      location: {
        address: {
          city: "test-city",
        },
      },
    },
  },
];

const contentQueryApiMock = {
  getExperienceRawContent: vi.fn(() => Promise.resolve({ data: rawExperiences })),
};

const notificationStoreMock = {
  addNotification: vi.fn(),
};
const experienceRawStoreMock = {
  deleteRawDocument: vi.fn(),
};

const refresh = vi.fn();
const useLazyAsyncDataMock = vi.fn(() => ({ data: rawExperiences, refresh }));

vi.mock("@/composables/useContentQueryApi", () => ({
  useContentQueryApi: () => contentQueryApiMock,
}));
vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));
vi.mock("@/stores/experience-raw", () => ({
  useExperienceRaw: () => experienceRawStoreMock,
}));
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);
vi.stubGlobal("useLazyAsyncData", useLazyAsyncDataMock);

const documentTabStoreMock = {
  closeTabByDocumentId: vi.fn(),
};

vi.mock("@/stores/document-tabs", () => ({
  useDocumentTabs: () => documentTabStoreMock,
}));

const props: Props = {
  searchText: "",
  activeSortKey: "title",
  activeSortDirection: "asc",
  isReadonly: false,
};

describe("TableRaw", () => {
  beforeEach(() => {
    vi.spyOn(detectItemScrollableComposable, "useDetectItemScrollable").mockReturnValueOnce({
      isHorizontallyScrollable: ref(true),
      isVerticallyScrollable: ref(true),
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should render correctly", () => {
    const wrapper = mount(TableRaw, { props });

    expect(wrapper.findAll(selectors.items).length).toBe(rawExperiences.length);
    expect(wrapper.html()).toContain(rawExperiences[0].reference_code);
    expect(wrapper.html()).toContain(rawExperiences[0].commercial.title);
    expect(wrapper.html()).toContain(rawExperiences[1].reference_code);
    expect(wrapper.html()).toContain(rawExperiences[1].commercial.title);
  });

  describe("visibility of NovaButton based on experience status", () => {
    test.each([
      { status_code: "SENT_TO_REVIEW", expected: false },
      { status_code: "IN_CREATION", expected: true },
    ])("NovaButton visibility toggles with different experience statuses", async ({ status_code, expected }) => {
      rawExperiences[0].status_code = status_code;
      rawExperiences[1].status_code = status_code;

      const wrapper = mount(TableRaw, { props });

      const buttonDelete = wrapper.find(selectors.buttonDelete);
      expect(buttonDelete.isVisible()).toBe(expected);
    });
  });

  describe("when loading is set to true", () => {
    test("it should show a spinner", () => {
      useLazyAsyncDataMock.mockImplementationOnce(() => ({
        data: [],
        pending: true,
        refresh,
      }));

      const wrapper = mount(TableRaw, { props });

      expect(wrapper.find(selectors.items).exists()).toBe(false);
      expect(wrapper.find(selectors.spinner).exists()).toBe(true);
    });
  });

  describe("when there are no items", () => {
    test("it should show a message", () => {
      useLazyAsyncDataMock.mockImplementationOnce(() => ({
        data: [],
        refresh,
      }));

      const wrapper = mount(TableRaw, {
        props,
      });

      expect(wrapper.find(selectors.items).exists()).toBe(false);
      expect(wrapper.find(selectors.noItemsMsg).exists()).toBe(true);
    });
  });

  describe("when the user clicks on the edit button", () => {
    test("it should redirect to the raw content page", async () => {
      const wrapper = mount(TableRaw, { props });

      await wrapper.find(selectors.buttonEdit).trigger("click");

      expect(routerMock.push).toHaveBeenCalledWith({
        name: "experience-id-raw-settings",
        params: {
          id: "test-exp-1",
          section: undefined,
        },
      });
    });
  });

  describe("when the user clicks on the title", () => {
    test("it should redirect to the raw content page", async () => {
      const wrapper = mount(TableRaw, { props });

      const row = wrapper.findAll(selectors.items)[0];
      await row.find(".TableItem__title").trigger("click");

      expect(routerMock.push).toHaveBeenCalledWith({
        name: "experience-id-raw-settings",
        params: {
          id: "test-exp-1",
          section: undefined,
        },
      });
    });
  });

  describe("when the user clicks on the delete button", () => {
    test("it should open the confirmation modal", async () => {
      const wrapper = mount(TableRaw, { props });

      await wrapper.find(selectors.buttonDelete).trigger("click");

      expect(wrapper.find(selectors.confirmationModal).exists()).toBeTruthy();
    });

    describe("when the user confirm the choice", () => {
      test("it should delete the experience", async () => {
        const wrapper = mount(TableRaw, { props });

        await wrapper.find(selectors.buttonDelete).trigger("click");

        const modal = wrapper.find(selectors.confirmationModal);
        const confirmBtn = modal.find("[data-testid='modal-save-btn']");
        vi.useFakeTimers();
        await confirmBtn.trigger("click");

        expect(experienceRawStoreMock.deleteRawDocument).toHaveBeenCalled();
        expect(documentTabStoreMock.closeTabByDocumentId).toHaveBeenCalledWith({ experienceId: "test-exp-1" });

        vi.runAllTimers();
        expect(refresh).toHaveBeenCalled();
        vi.useRealTimers();
      });
    });
  });

  describe("when there is an error while fetching the items", () => {
    test("it should show a notification", async () => {
      contentQueryApiMock.getExperienceRawContent.mockRejectedValueOnce("");

      const wrapper = mount(TableRaw, { props });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).fetchRawItems();

      expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
        message: "notifications.error.fetching.experiences",
        theme: "error",
      });
    });
  });

  test("if there is an error with the masterdata the dashboard should should not break", async () => {
    masterDataStoreMock.getCityByCode.mockRejectedValueOnce("error");

    const wrapper = mount(TableRaw, { props });

    expect(wrapper.findAll(selectors.items).length).toBe(rawExperiences.length);
  });

  describe("when the user clicks on a TableSortButton", () => {
    test("it should emit the update:activeSortKey event", async () => {
      const wrapper = mount(TableRaw, { props });

      const sortButton = wrapper.findComponent({ name: "TableSortButton" });

      await sortButton.trigger("click");
      expect(wrapper.emitted()["update:activeSortKey"][0]).toEqual(["title"]);
    });
  });

  describe("if is readonly", () => {
    test("it should not show the actions", () => {
      const wrapper = mount(TableRaw, { props: { ...props, isReadonly: true } });

      expect(wrapper.find(selectors.buttonEdit).exists()).toBe(false);
      expect(wrapper.find(selectors.buttonDelete).exists()).toBe(false);
    });
  });
});
