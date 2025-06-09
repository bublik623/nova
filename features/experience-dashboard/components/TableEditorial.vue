<template>
  <table ref="table" class="Table" aria-label="editorial experiences table" data-testid="table-editorial">
    <thead class="Table__headers">
      <th scope="col" class="fixed-left">&nbsp;</th>
      <th scope="col" class="header__status shadow--left">
        <div class="u-center">{{ $t("dashboard.table.row.header.distribution_status") }}</div>
      </th>

      <th scope="col">
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
        {{ $t("dashboard.table.row.header.translation") }}
      </th>
      <th scope="col">{{ $t("dashboard.table.row.header.city") }}</th>
      <th scope="col"></th>
      <th scope="col" class="fixed-right shadow--right"></th>
    </thead>

    <div v-if="pending" class="Table__overlay"><NovaSpinner /></div>

    <div v-else-if="data?.length === 0" data-testid="table-editorial-no-items-warning" class="Table__overlay">
      <div class="Table__noItemsWarning">
        {{ $t("dashboard.table.no.items.warning") }}
      </div>
    </div>

    <tbody v-else class="Table__body">
      <template v-for="item in data" :key="item.experience_id">
        <tr class="TableItem" data-testid="dashboard-table-item-editorial" @click="handleRowClick(item.experience_id)">
          <td class="cell__hover cell__toggle fixed-left">
            <div class="u-center">
              <button class="TableItem__row-toggle" :aria-checked="expandedRows.has(item.experience_id)">
                <NovaIcon name="chevron-down" :size="9" />
              </button>
            </div>
          </td>
          <td
            class="cell__hover cell__status shadow--left"
            data-testid="cell-status"
            :data-status="item.experience_translation?.distribution_status"
            :data-status-date="item.experience_translation?.distribution_date"
          >
            <div class="status-icon__wrapper">
              <ExperienceStatusIcon
                :status="item.experience_translation?.distribution_status"
                :date="item.experience_translation?.distribution_date"
                :media-status="item.experience_media?.distribution_status"
              ></ExperienceStatusIcon>
            </div>
          </td>
          <td class="TableItem__cell">
            <p class="TableItem__title" @click.stop="handleItemRedirect(item.experience_id, 'en')">
              {{ item.experience_translation?.title }}
            </p>
          </td>
          <td class="TableItem__cell">
            {{ item.reference_code }}
          </td>
          <td class="TableItem__cell">
            {{ formatDate(item.experience_translation?.creation_date) }}
          </td>
          <td class="TableItem__cell">
            {{ formatDate(item.experience_translation?.updated_date) }}
          </td>
          <td class="TableItem__cell">
            <ExperienceStatusBadge
              :flow-code="item.experience_translation?.flow_code"
              :status-code="item.experience_translation?.status_code"
              class="mr-2"
            />
            <ExperienceStatusBadge
              :flow-code="item.experience_media?.flow_code"
              :status-code="item.experience_media?.status_code"
            />
          </td>
          <td class="TableItem__cell">
            <span v-if="item.operational_content?.available" class="text-text-100">
              {{ $t("common.available") }}
            </span>
            <span v-else class="inline-block px-1 py-px text-xs text-white bg-error-110 rounded">
              {{ $t("common.unavailable") }}
            </span>
          </td>

          <td class="TableItem__cell">
            {{ item.translations.length }}
          </td>
          <td class="TableItem__cell">{{ getCityName(item.location?.address.city) }}</td>
          <td class="TableItem__cell"></td>
          <td class="TableItem__cell-reverse fixed-right shadow--right">
            <ExperienceActionDropdown
              v-if="!isReadonly"
              :status="computeExperienceState(item)"
              :curation-status="item.experience_translation?.status_code"
              :media-status="item.experience_media?.status_code"
              @publish="handlePublish(item.experience_id)"
              @unpublish="handleUnpublish(item.experience_id)"
              @edit="handleItemRedirect(item.experience_id, 'en')"
            />
          </td>

          <TableExpandedRow
            :show="expandedRows.has(item.experience_id)"
            :translations="item.translations"
            :scroll-shadow-opacity="scrollShadowOpacity"
            :column-template="TABLE_COLUMN_TEMPLATE"
            :experience-media="item.experience_media"
            :is-readonly
            @click:edit="handleItemRedirect"
          />
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import { debouncedRef, useVModel } from "@vueuse/core";
import { useDetectItemScrollable } from "@/composables/useDetectItemScrollable";
import { useContentQueryApi } from "@/composables/useContentQueryApi";
import { useNotifications } from "@/stores/notifications";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaSpinner from "@/ui-kit/NovaSpinner/NovaSpinner.vue";
import { defaultLimit } from "@/features/experience-dashboard/lib/dashboard.constants";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import ExperienceStatusIcon from "@/features/experience-shared/components/ExperienceStatusIcon.vue";

// Ignoring these imports because they are used in the <style> section via v-bind,
// but SonarQube incorrectly detects them as unused.
// prettier-ignore
// eslint-disable-next-line no-unused-vars
import { firstCellWidth, statusCellWidth,TABLE_COLUMN_TEMPLATE } from "@/features/experience-shared/constants/dashboard-table-constants";
import {
  DistributionContent,
  ExperienceContentV2,
  ExperienceMedia,
  OperationalContent,
  ReferenceCode,
} from "@/types/generated/ContentQueryApiV2";
import { ExperienceLocation } from "@/types/generated/ContentQueryApi";
import { useMasterData } from "@/stores/master-data";
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import ExperienceActionDropdown from "@/features/experience-shared/components/ExperienceActionDropdown.vue";
import { getExperienceState } from "@/features/experience-shared/utils/get-experience-state";
import { useExperienceCuration } from "@/stores/experience-curation";
import { waitForTimeout } from "@/features/core-shared/utils/promise/wait";
import { updateDelayMs } from "@/features/experience-shared/constants/experience-shared-constants";
import TableSortButton from "@/features/core-shared/components/TableSortButton.vue";
import { SortDirection, SortKey } from "@/types/SortingTypes";
import TableExpandedRow from "./TableExpandedRow.vue";

const { getCityByCode } = useMasterData();
const { addNotification } = useNotifications();

export interface Props {
  searchText: string;
  limit?: string;
  activeSortKey?: SortKey;
  activeSortDirection?: SortDirection;
  isReadonly: boolean;
}

const HEADER_KEY_MAP: Partial<Record<SortKey, string>> = {
  title: "experience_content.experience_translation.title",
  id: "id",
  created: "experience_content.experience_translation.creation_date",
  last_modified: "experience_content.experience_translation.updated_date",
  reference_code: "reference_code",
};

interface Events {
  (e: "update:activeSortKey", value: SortKey): void;
}

const props = withDefaults(defineProps<Props>(), {
  limit: defaultLimit,
  activeSortKey: "last_modified",
  activeSortDirection: "desc",
});
const emits = defineEmits<Events>();

const router = useRouter();
const notificationStore = useNotifications();
const { logError } = useLogger();
const { getAllDistributionContents } = useContentQueryApi();
const curationStore = useExperienceCuration();

const getCityName = (code?: string) => {
  try {
    if (code) {
      return getCityByCode(code)?.name;
    }
  } catch (error) {
    console.error(error);
    return "";
  }
};

const table = ref<HTMLTableElement | null>(null);
const { isHorizontallyScrollable } = useDetectItemScrollable(table);
const scrollShadowOpacity = computed(() => (isHorizontallyScrollable.value ? 1 : 0));

function formatDate(date?: string) {
  if (date) {
    return new Intl.DateTimeFormat("en-gb").format(new Date(date));
  } else return "";
}
const activeSortKey = useVModel(props, "activeSortKey", emits);
const searchText = debouncedRef(toRef(props, "searchText"), 500);
const sortDirection = computed(() => (props.activeSortDirection === "asc" ? "+" : "-"));
const sortKey = computed(() => HEADER_KEY_MAP[props.activeSortKey]);

const { data, pending, refresh } = useLazyAsyncData("dashboard-editorial", fetchEditorialItems, {
  watch: [searchText, sortKey, sortDirection],
});

type ExperienceWithTranslations = ExperienceContentV2 & {
  experience_media?: ExperienceMedia;
  location?: ExperienceLocation;
  translations: ExperienceContentV2[];
  reference_code?: ReferenceCode;
  operational_content?: OperationalContent;
};

function createTranslations(experience: DistributionContent): ExperienceWithTranslations {
  const contents = experience.experience_content!;

  const enExperience = contents.find((content) => content.language_code === "en");
  const translations = contents.filter((content) => content.language_code !== "en");

  if (enExperience)
    return {
      ...enExperience,
      ...(experience.experience_media && {
        experience_media: experience.experience_media,
      }),
      translations,
      location: experience.functional_content?.experience_location,
      reference_code: experience.reference_code,
      operational_content: experience.operational_content,
    };
  return {
    experience_id: "",
    supplier_id: "",
    language_code: "en",
    translations: [],
  };
}

async function fetchEditorialItems() {
  try {
    const { data: items } = await getAllDistributionContents({
      limit: props.limit,
      sort: sortDirection.value + sortKey.value,
      search: searchText.value,
    });
    const experiences = items.map((item) => createTranslations(item));
    return experiences;
  } catch (error) {
    logError("load-experiences", error);
    notificationStore.addNotification({
      theme: "error",
      message: "notifications.error.fetching.experiences",
    });
  }
}

const handleItemRedirect = (id: string, lang?: string) => {
  if (lang === "en") {
    router.push(`/experience/${id}/curation/settings`);
  } else if (lang) {
    router.push(`/experience/${id}/translation/${lang}`);
  }
};
const handlePublish = async (id: string) => {
  pending.value = true;
  try {
    await curationStore.publishCurationExperienceFromDashBoard(id, true);
    // todo remove delay OFF-2547
    await waitForTimeout(updateDelayMs);
    await refresh();
    addNotification({
      theme: "success",
      message: "notifications.success.published.experience",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error unpublishing the experience", error);
    addNotification({
      theme: "error",
      message: "notifications.error.saving.document",
    });
  }
};

const handleUnpublish = async (id: string) => {
  pending.value = true;
  try {
    await curationStore.unpublishCurationExperience(id);
    // todo remove delay OFF-2547
    await waitForTimeout(updateDelayMs);
    await refresh();
    addNotification({
      theme: "success",
      message: "notifications.success.unpublished.experience",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error unpublishing the experience", error);
    addNotification({
      theme: "error",
      message: "notifications.error.saving.document",
    });
  }
};

const computeExperienceState = (item: ExperienceWithTranslations) => {
  const experienceStateParams = {
    experienceStatus: item.experience_translation?.distribution_status,
    mediaStatus: item.experience_media?.distribution_status,
    experienceDate: item.experience_translation?.distribution_date,
  };

  return getExperienceState(experienceStateParams);
};

const expandedRows = ref<Set<string>>(new Set());
function handleRowClick(expId: string) {
  if (expandedRows.value.has(expId)) {
    expandedRows.value.delete(expId);
  } else {
    expandedRows.value.add(expId);
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.u-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

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
    grid-template-columns: v-bind(TABLE_COLUMN_TEMPLATE);

    & > th {
      padding: rem(8) rem(12);
      background-color: var(--color-white);
      color: var(--color-primary-100);
      border-bottom: 1px solid var(--color-grey-100);
      cursor: pointer;
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

.cell__hover {
  background-color: var(--color-neutral-10);
}

.TableItem {
  cursor: pointer;
  display: grid;
  grid-template-columns: v-bind(TABLE_COLUMN_TEMPLATE);
  align-items: center;
  border-bottom: 1px solid var(--color-grey-100);

  &__row-toggle {
    cursor: pointer;
    padding: 0;
    border: none;
    border-radius: 2px;
    height: rem(14);
    width: rem(14);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: rem(12);
    background-color: var(--color-primary-10);
    color: var(--color-primary-100);

    &:hover {
      color: var(--color-white);
      background-color: var(--color-primary-50);
    }

    &[aria-checked="true"] {
      background-color: var(--color-primary-100);
      color: var(--color-white);

      & > .svg-icon {
        transform: rotate(180deg);
      }

      &:hover {
        background-color: var(--color-primary-110);
      }
    }
  }

  &__cell,
  &__cell-reverse {
    height: rem(35);
    background-color: var(--color-white);
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  &__cell {
    padding: rem(7) rem(12);
  }

  &__cell-reverse {
    justify-content: flex-end;
    width: 100%;
    height: 100%;
    padding-right: rem(12);
  }

  &:hover {
    .TableItem__cell,
    .cell__hover,
    .TableItem__cell-reverse {
      background-color: var(--color-neutral-10);
    }
  }

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text-100);

    &:hover {
      text-decoration: underline;
    }
  }
}

.header__status {
  position: sticky;
  left: v-bind(firstCellWidth);
  width: v-bind(statusCellWidth);
}

.cell__toggle {
  height: 100%;
  background-color: var(--color-neutral-0);
  padding-left: rem(12);
}

.cell__status {
  background-color: var(--color-neutral-0);
  position: sticky;
  left: v-bind(firstCellWidth) !important;
  justify-self: center;
  width: v-bind(statusCellWidth);
  height: 100%;
}

.status-icon__wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: rem(16);
}

.fixed-left {
  position: sticky;
  left: 0;
}

th.fixed-left,
th.shadow--left {
  z-index: var(--table-headers-z-index);
}

.fixed-right {
  position: sticky;
  right: 0;
}

.shadow--left {
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

.shadow--right {
  &::before {
    opacity: v-bind(scrollShadowOpacity);
    content: "";
    position: absolute;
    height: 100%;
    width: 4px;
    left: 0;
    top: 0;
    background: linear-gradient(90deg, rgb(255 255 255 / 0%) 0%, rgb(0 0 0 / 10%) 100%);
  }
}
</style>
