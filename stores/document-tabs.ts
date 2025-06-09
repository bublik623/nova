import { defineStore } from "pinia";
import { isEqual } from "lodash";
import { getDashboardUrl } from "@/features/experience-dashboard/lib/get-dashboard-url";

export type documentId = { experienceId: string } | { experienceId: string; revisionId: string };

export interface DocumentTab {
  documentId: documentId;
  label: string;
  path: string;
}

export interface DocumentTabState {
  tabs: DocumentTab[];
}

export const useDocumentTabs = defineStore("document-tabs", {
  state: (): DocumentTabState => ({
    tabs: [],
  }),
  getters: {
    getByDocumentId: (state) => (documentId: documentId) => {
      return state.tabs.find((tab) => isEqual(tab.documentId, documentId));
    },
    isActive: () => (tab: DocumentTab) => {
      const route = useRoute();

      return route.fullPath.includes(tab.path);
    },
  },
  actions: {
    getActiveTab() {
      return this.tabs.find(this.isActive);
    },
    addOrUpdateTab(documentId: documentId, label: string, path: string) {
      let tab: DocumentTab | undefined;
      const tabIndex = this.tabs.findIndex((tab) => isEqual(tab.documentId, documentId));
      if (tabIndex > -1) {
        const oldTab = this.tabs[tabIndex];
        tab = {
          ...oldTab,
          label,
          path,
        };
        this.tabs[tabIndex] = tab;
      } else {
        this.tabs.push({ documentId, label, path });
      }
    },
    updateTabPath(documentId: documentId, path: string) {
      const tabIndex = this.tabs.findIndex((tab) => isEqual(tab.documentId, documentId));
      if (tabIndex === -1) {
        throw new Error(`tab for document ${JSON.stringify(documentId)} does not exist`);
      }

      const tab = this.tabs[tabIndex];
      this.tabs[tabIndex] = {
        ...tab,
        path,
      };
    },
    closeTabAndGetNextRoutePath(tabToClose: DocumentTab) {
      let nextActiveTab = null;
      const closingActiveTab = this.isActive(tabToClose);

      if (closingActiveTab) {
        const currentIndex = this.tabs.indexOf(tabToClose);

        // when the user wants to close the current tab
        // if it has any siblings on the right, navigate to the first one
        // if not, navigate to the first sibling on the left.
        const rightSibling = this.tabs[currentIndex + 1];
        const leftSibling = this.tabs[currentIndex - 1];
        nextActiveTab = rightSibling || leftSibling;
      } else {
        nextActiveTab = this.tabs.find(this.isActive);
      }

      // remove the tab from the set of existing tabs
      this.tabs = this.tabs.filter((tab) => !isEqual(tab, tabToClose));

      return nextActiveTab?.path ?? getDashboardUrl();
    },

    closeTabByDocumentId(documentId: documentId) {
      const tab = this.tabs.find((tab) => isEqual(tab.documentId, documentId));

      if (!tab) {
        return;
      }

      this.closeTabAndGetNextRoutePath(tab);
    },
  },
});
