<template>
  <table ref="table" class="Table" aria-label="raw experiences table" data-testid="table-raw">
    <thead class="Table__headers">
      <th scope="col" class="fixed-left">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="title"
        />
      </th>
      <th scope="col">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="reference_code"
        />
      </th>
      <th scope="col">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="created"
        />
      </th>

      <th scope="col">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="last_modified"
        />
      </th>
      <th scope="col">
        {{ $t("dashboard.table.row.header.status") }}
      </th>
      <th scope="col">
        {{ $t("dashboard.table.row.header.availability") }}
      </th>
      <th scope="col">
        {{ $t("dashboard.table.row.header.city") }}
      </th>
      <th scope="col"></th>
      <th scope="col" class="fixed-right"></th>
    </thead>

    <div v-if="pending" class="Table__overlay"><NovaSpinner /></div>

    <div v-else-if="data && data.length === 0" data-testid="table-raw-no-items-warning" class="Table__overlay">
      <div class="Table__noItemsWarning">
        {{ $t("dashboard.table.no.items.warning") }}
      </div>
    </div>

    <tbody v-else class="Table__body">
      <template v-for="item in data" :key="item.id">
        <TableRawRow
          :item="item"
          :is-readonly="isReadonly"
          :scroll-shadow-opacity="scrollShadowOpacity"
          @delete-item="
            itemToDeleteExperienceId = $event.experienceId;
            itemToDeleteTitle = $event.title;
            showModal = true;
          "
        />
      </template>
    </tbody>

    <!-- modal for delete an experience -->
    <NovaModalConfirm
      :show-modal="showModal"
      :title="$t('modal.experience.delete.title')"
      :description="
        $t('modal.experience.delete.description', {
          placeholders: { title: itemToDeleteTitle },
        })
      "
      :cta-confirm-text="$t('modal.experience.delete.confirm')"
      :cta-cancel-text="$t('modal.experience.delete.cancel')"
      :confirm-callback="handleDeleteRawContent"
      :cancel-callback="() => (showModal = false)"
    />
  </table>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from "vue";
import { debouncedRef, useVModel } from "@vueuse/core";
import { useDetectItemScrollable } from "@/composables/useDetectItemScrollable";
import { useContentQueryApi } from "@/composables/useContentQueryApi";
import { useNotifications } from "@/stores/notifications";
import { useExperienceRaw } from "@/stores/experience-raw";
import NovaSpinner from "@/ui-kit/NovaSpinner/NovaSpinner.vue";
import NovaModalConfirm from "@/ui-kit/NovaModalConfirm/NovaModalConfirm.vue";
import { defaultLimit } from "@/features/experience-dashboard/lib/dashboard.constants";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useDocumentTabs } from "@/stores/document-tabs";
import { waitForTimeout } from "@/features/core-shared/utils/promise/wait";
import { SortDirection, SortKey } from "@/types/SortingTypes";
import TableSortButton from "@/features/core-shared/components/TableSortButton.vue";
import TableRawRow from "@/features/experience-dashboard/components/TableRawRow.vue";
import { RAW_TABLE_COLUMN_TEMPLATE } from "@/features/experience-dashboard/constants";

export interface Props {
  searchText: string;
  activeSortKey?: SortKey;
  activeSortDirection?: SortDirection;
  isReadonly: boolean;
  limit?: string;
}

interface Events {
  (e: "update:activeSortKey", value: SortKey): void;
}

const HEADER_KEY_MAP: Partial<Record<SortKey, string>> = {
  title: "commercial.title",
  id: "id",
  created: "creation_date",
  last_modified: "updated_date",
  reference_code: "reference_code",
};

const props = withDefaults(defineProps<Props>(), {
  limit: defaultLimit,
  activeSortKey: "last_modified",
  activeSortDirection: "desc",
});

const emits = defineEmits<Events>();

const activeSortKey = useVModel(props, "activeSortKey", emits);

const config = useRuntimeConfig();
const notificationStore = useNotifications();
const { logError } = useLogger();

const { getExperienceRawContent } = useContentQueryApi();
const { deleteRawDocument } = useExperienceRaw();
const tabs = useDocumentTabs();

const table = ref<HTMLTableElement | null>(null);
const { isHorizontallyScrollable } = useDetectItemScrollable(table);
const scrollShadowOpacity = computed(() => (isHorizontallyScrollable.value ? 1 : 0));
const searchText = debouncedRef(toRef(props, "searchText"), 500);
const sortDirection = computed(() => (props.activeSortDirection === "asc" ? "+" : "-"));
const sortKey = computed(() => HEADER_KEY_MAP[props.activeSortKey]);
const { data, pending, refresh } = useLazyAsyncData("dashboard-raw", fetchRawItems, {
  watch: [searchText, sortKey, sortDirection],
});

async function fetchRawItems() {
  try {
    const { data: rawItems } = await getExperienceRawContent({
      sort: sortDirection.value + sortKey.value,
      limit: props.limit,
      search: searchText.value,
    });
    return rawItems;
  } catch (error) {
    logError("load-experiences", error);
    notificationStore.addNotification({
      theme: "error",
      message: "notifications.error.fetching.experiences",
    });
  }
}

const showModal = ref(false);
const itemToDeleteExperienceId = ref("");
const itemToDeleteTitle = ref("");

async function handleDeleteRawContent() {
  tabs.closeTabByDocumentId({ experienceId: itemToDeleteExperienceId.value });
  await deleteRawDocument(itemToDeleteExperienceId.value);

  // Workaround: lag between ERS and CQS
  await waitForTimeout(+config.public.REFRESH_TIMEOUT);
  await refresh();
  showModal.value = false;
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.Table {
  --table-headers-z-index: 2;
  --table-overlay-z-index: 3;

  position: relative;
  border-radius: var(--border-radius-default);
  box-shadow: var(--box-shadow-table);
  background-color: white;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow-x: scroll;
  height: 80vh;

  @include font-semibold(12);

  &__headers {
    position: sticky;
    top: 0;
    z-index: var(--table-headers-z-index);
    display: grid;
    grid-template-columns: v-bind(RAW_TABLE_COLUMN_TEMPLATE);

    & > th {
      padding: rem(8) rem(12);
      background-color: var(--color-white);
      color: var(--color-primary-100);
      border-bottom: 1px solid var(--color-grey-100);
      display: inline-flex;
      align-items: center;
      user-select: none;
    }
  }

  &__overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    z-index: var(--table-overlay-z-index);
  }
}

.fixed-left {
  position: sticky;
  left: 0;

  &::before {
    opacity: v-bind(scrollShadowOpacity);
    content: "";
    position: absolute;
    height: 100%;
    width: 4px;
    right: 0;
    background: linear-gradient(90deg, rgb(0 0 0 / 10%) 0%, rgb(255 255 255 / 0%) 100%);
  }
}

th.fixed-left {
  z-index: var(--table-headers-z-index);
}

.fixed-right {
  position: sticky;
  right: 0;

  &::before {
    opacity: v-bind(scrollShadowOpacity);
    content: "";
    position: absolute;
    height: 100%;
    width: 4px;
    left: 0;
    background: linear-gradient(90deg, rgb(255 255 255 / 0%) 0%, rgb(0 0 0 / 10%) 100%);
  }
}
</style>
