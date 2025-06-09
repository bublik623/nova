<template>
  <div class="Dashboard">
    <ProductsSidebar />
    <div>
      <TabNavigation :tabs="documentTabsStore.tabs" @tab-close="closeTab" />
      <div class="Dashboard__wrapper">
        <div class="grid grid-cols-3 gap-4">
          <div>
            <CreateExperienceButton v-if="!isRawReadonly" />
          </div>
          <div class="Dashboard__search-bar">
            <NovaInputText
              id="dashboard-search-bar"
              left-icon="search"
              :placeholder="$t('dashboard.search.bar.placeholder')"
              :model-value="searchQuery"
              @update:model-value="searchQuery = $event"
            />
          </div>

          <NovaButtonToggle
            v-if="canUserToggleView"
            class="ml-auto"
            data-testid="dashboard-toggle"
            :model-value="contentQuery === DocumentContentType.RAW"
            @update:model-value="handleDashboardToggle"
          >
            <template #firstOption>{{ $t("common.btn.toggle.raw") }}</template>
            <template #secondOption>{{ $t("common.btn.toggle.editorial") }}</template>
          </NovaButtonToggle>
        </div>
        <TableRaw
          v-if="contentQuery === DocumentContentType.RAW"
          class="mt-4"
          :search-text="searchQuery"
          :is-readonly="isRawReadonly"
          :active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          @update:active-sort-key="handleSortUpdate"
        />

        <TableEditorial
          v-else
          class="mt-4"
          :search-text="searchQuery"
          :limit="limitQuery"
          :is-readonly="isEditorialReadonly"
          :active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          @update:active-sort-key="handleSortUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import { queryLimit, defaultLimit, queryContent } from "@/features/experience-dashboard/lib/dashboard.constants";
import { DocumentContentType } from "@/types/DocumentStatuses";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import { SortDirection, SortKey, SortQuery } from "@/types/SortingTypes";
import { hasPermission } from "@/features/roles/lib/has-permission";
import { useDocumentTabs } from "@/stores/document-tabs";
import TableEditorial from "./TableEditorial.vue";
import TableRaw from "./TableRaw.vue";
import TabNavigation from "@/components/Document/TabNavigation/TabNavigation.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaButtonToggle from "@/ui-kit/NovaButtonToggle/NovaButtonToggle.vue";
import CreateExperienceButton from "./CreateExperienceButton.vue";
import { useExperienceDashboardView } from "@/features/experience-dashboard/composables/useExperienceDashboardView";

const { $t } = useNuxtApp();

const route = useRoute();
const router = useRouter();
const documentTabsStore = useDocumentTabs();
const { canUserToggleView, getInitialContentForView } = useExperienceDashboardView();
const contentQuery = useRouteQuery<DocumentContentType>(queryContent, getInitialContentForView);
const searchQuery = useRouteQuery<string>("search", "", { route, router });
const limitQuery = useRouteQuery(queryLimit, defaultLimit, { route, router });
const sortQuery = useRouteQuery<SortQuery>("sortBy", "last_modified-desc", {
  route,
  router,
});

const isRawReadonly = !hasPermission("experience.raw.canWrite");
const isEditorialReadonly = !hasPermission("experience.curation.canWrite");

const activeSortKey = computed(() => sortQuery.value.split("-")[0] as SortKey);
const activeSortDirection = computed(() => sortQuery.value.split("-")[1] as SortDirection);

function handleSortUpdate(sortKey: SortKey) {
  if (sortKey === activeSortKey.value) {
    sortQuery.value = `${sortKey}-${activeSortDirection.value === "asc" ? "desc" : "asc"}`;
  } else {
    sortQuery.value = `${sortKey}-asc`;
  }
}

function handleDashboardToggle() {
  contentQuery.value =
    contentQuery.value === DocumentContentType.RAW ? DocumentContentType.EDITORIAL : DocumentContentType.RAW;
}

async function closeTab(tabToClose: DocumentTab) {
  const nextRoute = documentTabsStore.closeTabAndGetNextRoutePath(tabToClose);

  await router.push(nextRoute);
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.Dashboard {
  background: var(--color-grey-80);
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100%;

  &__wrapper {
    max-width: 95vw;
    padding: rem(23px) rem(12px);
    height: calc(100% - var(--tab-navigation-height));
    display: flex;
    flex-direction: column;
  }

  &__button {
    max-height: 32px;

    &__text {
      @include font-bold(14);
    }
  }

  &__search-bar {
    width: 100%;
    max-width: 400px;
  }
}
</style>
