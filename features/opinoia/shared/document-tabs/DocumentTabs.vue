<script setup lang="ts">
import TabNavigation from "@/components/Document/TabNavigation/TabNavigation.vue";
import { useRouter } from "vue-router";
import { useDocumentTabs } from "@/stores/document-tabs";

const router = useRouter();

const documentTabsStore = useDocumentTabs();
async function closeTab(tabToClose: DocumentTab) {
  const nextRoute = documentTabsStore.closeTabAndGetNextRoutePath(tabToClose);

  await router.push(nextRoute);
}
</script>

<template>
  <TabNavigation
    data-testid="document-tab-navigation"
    :tabs="documentTabsStore.tabs"
    :active-tab="documentTabsStore.getActiveTab()"
    @tab-close="closeTab"
  />
</template>
