import { setActivePinia, createPinia, _GettersTree, _ActionsTree } from "pinia";
import { beforeAll, beforeEach, describe, test, expect, vi } from "vitest";
import { useDocumentTabs } from "../document-tabs";

const mockRoute = {
  fullPath: "/experience/test-id-1",
  name: "experience-id-raw",
  params: {
    id: "test-id-1",
  },
};

const mockRouter = {
  push: vi.fn(),
  resolve: () => {
    return { href: "/" };
  },
};

const mockData = [
  {
    documentId: { experienceId: "test-id-1" },
    label: "Test Value 1",
    path: "/experience/test-id-1",
  },
  {
    documentId: { experienceId: "test-id-2" },
    label: "Test Value 2",
    path: "/experience/test-id-2/sub-route",
  },
  {
    documentId: { experienceId: "test-id-3" },
    label: "Test Value 3",
    path: "/experience/test-id-2/sub-route/sub-sub-route",
  },
];

describe("Document tabs Store", () => {
  setActivePinia(createPinia());
  const store = useDocumentTabs();

  vi.stubGlobal("useRouter", () => mockRouter);
  vi.stubGlobal("useRoute", () => mockRoute);

  beforeAll(() => {
    setActivePinia(createPinia());
    store.$reset();
  });

  beforeEach(() => {
    vi.resetAllMocks();

    store.$reset();
    store.$state = {
      tabs: [...mockData],
    };
  });
  describe("getters", () => {
    describe("getByDocumentId", () => {
      test("it returns the tab corresponding to the given documentId when it exists", () => {
        expect(store.getByDocumentId(mockData[0].documentId)).toEqual(mockData[0]);
      });
      test("it returns undefined if not tab exists for the given documentId", () => {
        expect(store.getByDocumentId({ experienceId: "failing-id" })).toBe(undefined);
      });
    });

    describe("isActive", () => {
      test("returns true when the given tab is the active one", () => {
        expect(store.isActive(mockData[0])).toBe(true);
      });
      test("returns false when the given tab is not the active one", () => {
        expect(store.isActive(mockData[1])).toBe(false);
      });
    });
  });

  describe("actions", () => {
    describe("getActiveTab", () => {
      test("it returns the tab whose path is included in the actual route path", () => {
        mockRoute.fullPath = mockData[0].path;
        const activeTab = store.getActiveTab();

        expect(activeTab).toStrictEqual(mockData[0]);
      });
      test("it returns undefined when no tab's path is included in the actual route path", () => {
        mockRoute.fullPath = "/another-page-path";
        const activeTab = store.getActiveTab();

        expect(activeTab).toBeUndefined();
      });
    });

    describe("addOrUpdateTab", () => {
      test("it adds a new tab when no tabs exists for the given documentId", () => {
        store.addOrUpdateTab({ experienceId: "test-id-4" }, "Test Value 4", "/experience/test-id-4");

        expect(store.tabs.length).toBe(4);
        expect(store.tabs[3].label).toBe("Test Value 4");
        expect(store.tabs[3].path).toBe("/experience/test-id-4");
      });
      test("it updates the tab corresponding to the given documentId when it exists", () => {
        store.addOrUpdateTab({ experienceId: "test-id-3" }, "updated label", "/experience/test-id-3-updated");

        expect(store.tabs.length).toBe(3);
        expect(store.tabs[2].documentId).toStrictEqual({ experienceId: "test-id-3" });
        expect(store.tabs[2].label).toBe("updated label");
        expect(store.tabs[2].path).toBe("/experience/test-id-3-updated");
      });
    });

    describe("updateTabPath", () => {
      test("it updates the path of the tab corresponding to the given documentId when it exists", () => {
        store.updateTabPath({ experienceId: "test-id-3" }, "/experience/test-id-3/updated-route");

        expect(store.tabs.length).toBe(3);
        expect(store.tabs[2].documentId).toStrictEqual({ experienceId: "test-id-3" });
        expect(store.tabs[2].path).toBe("/experience/test-id-3/updated-route");
      });
      test("it throws an error if no tab corresponding to the given documentId exists", () => {
        store.$state = {
          tabs: [],
        };

        const willThrow = () => store.updateTabPath({ experienceId: "test-id" }, "/experience/test-id/media");

        expect(willThrow).toThrowError(
          `tab for document ${JSON.stringify({ experienceId: "test-id" })} does not exist`
        );
      });
    });

    describe("closeTabAndGetNextRoutePath", () => {
      describe("when there is an active tab", () => {
        describe("when closing the active tab", () => {
          test("it remove the given tab from the set of existing tabs", () => {
            mockRoute.fullPath = mockData[0].path;
            store.closeTabAndGetNextRoutePath(mockData[0]);

            expect(store.tabs.length).toBe(2);
            expect(store.tabs[0]).toEqual(mockData[1]);
          });
          test("it returns the path of the right sibling of the closed tab, when it exists", () => {
            mockRoute.fullPath = mockData[1].path;
            const result = store.closeTabAndGetNextRoutePath(mockData[1]);

            expect(result).toBe(mockData[2].path);
          });
          test("it returns the path of the left sibling of the closed tab, when no tabs exists to the right of the closed tab", () => {
            mockRoute.fullPath = mockData[2].path;
            const result = store.closeTabAndGetNextRoutePath(mockData[2]);

            expect(result).toBe(mockData[1].path);
          });
          test("it returns the path of the dashboard, when the closed tab is the only existing tab", () => {
            mockRoute.fullPath = mockData[0].path;
            store.$state = { tabs: [mockData[0]] };
            const result = store.closeTabAndGetNextRoutePath(mockData[0]);

            expect(result.href).toBe("/");
          });
        });

        describe("when closing a non active tab", () => {
          test("it remove the given tab from the set of existing tabs", () => {
            store.closeTabAndGetNextRoutePath(mockData[1]);

            expect(store.tabs.length).toBe(2);
            expect(store.tabs[1]).toEqual(mockData[2]);
          });
          test("it returns the path of the active tab", () => {
            const result = store.closeTabAndGetNextRoutePath(mockData[1]);

            expect(result).toBe(mockData[0].path);
          });
        });
      });

      describe("when no tab is active", () => {
        test("it returns the path of the dashboard", () => {
          mockRoute.fullPath = "/another-page-path";
          const result = store.closeTabAndGetNextRoutePath(mockData[0]);

          expect(result.href).toBe("/");
        });
      });
    });

    describe("closeTabByDocumentId", () => {
      describe("when closing the active tab", () => {
        test("it remove the given tab from the set of existing tabs", () => {
          mockRoute.fullPath = mockData[0].path;
          store.closeTabByDocumentId(mockData[0].documentId);

          expect(store.tabs.length).toBe(2);
          expect(store.tabs[0]).toEqual(mockData[1]);
        });
      });

      describe("when closing a non active tab", () => {
        test("it remove the given tab from the set of existing tabs", () => {
          store.closeTabByDocumentId(mockData[1].documentId);

          expect(store.tabs.length).toBe(2);
          expect(store.tabs[1]).toEqual(mockData[2]);
        });
      });
    });
  });
});
