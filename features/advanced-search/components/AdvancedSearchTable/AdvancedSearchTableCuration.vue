<template>
  <table ref="table" class="AdvancedSearchTable" aria-label="table">
    <thead class="AdvancedSearchTable__headers">
      <th scope="col" class="fixed-left-check fixed-left" data-testid="adv-search-th-checkbox">
        <NovaCheckbox
          :status="mainSelectionStatus"
          value="adv-search-update-all"
          @update:status="$emit('on:toggleAllSelection')"
        />
      </th>
      <th scope="col" class="fixed-left-langs fixed-left" data-testid="adv-search-th-langs">
        <NovaButton class="AdvancedSearchTable__button" variant="action" size="xxs" @click="toggleMultipleOpen">
          <NovaIcon name="languages" />
          <NovaIcon name="chevron-down" :size="10" :class="openedItems.size > 0 ? 'rotate180x' : ''" />
        </NovaButton>
      </th>
      <th scope="col" class="fixed-left-title fixed-left shadow--left" data-testid="adv-search-th-title">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="title"
        />
      </th>
      <th scope="col" data-testid="adv-search-th-ref-code">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="reference_code"
        />
      </th>
      <th scope="col" data-testid="adv-search-th-status">
        {{ $t("adv-search.table.header.status") }}
      </th>
      <th scope="col" data-testid="adv-search-th-modified">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="last_modified"
        />
      </th>
      <th scope="col" data-testid="adv-search-th-supplier">
        {{ $t("adv-search.table.header.supplier") }}
      </th>
      <th scope="col" data-testid="adv-search-th-city">
        {{ $t("adv-search.table.header.city") }}
      </th>
      <th scope="col" data-testid="adv-search-th-country">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="country"
        />
      </th>
      <th scope="col" data-testid="adv-search-th-published">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="published"
        />
      </th>
      <th scope="col" data-testid="adv-search-th-created">
        <TableSortButton
          v-model:active-sort-key="activeSortKey"
          :active-sort-direction="activeSortDirection"
          own-sort-key="created"
        />
      </th>
    </thead>

    <div v-if="pending" class="AdvancedSearchTable__overlay"><NovaSpinner /></div>
    <div
      v-else-if="items.length === 0"
      data-testid="adv-search-table-curation-no-items-warning"
      class="AdvancedSearchTable__overlay"
    >
      <div class="Table__noItemsWarning">
        {{ $t("adv-search.table.no.items.warning") }}
      </div>
    </div>
    <tbody v-else>
      <template v-for="item in mappedItems" :key="item">
        <div class="TableItem">
          <tr class="TableItem__row" data-testid="adv-search-table-item">
            <td class="fixed-left fixed-left-check" data-testid="adv-search-td-checkbox">
              <NovaCheckbox
                :value="item.id!"
                :disabled="areAllSelected"
                :status="isExperienceSelected(item.id!) ? 'checked' : 'unchecked'"
                @update:status="$emit('on:toggleExperienceSelection', item.id!)"
              />
            </td>
            <td class="fixed-left fixed-left-langs" data-testid="adv-search-td-langs">
              <NovaButton variant="action" size="xxs" :disabled="!item.hasTranslations" @click="toggleOpen(item.id)">
                <NovaIcon name="languages" />
                <NovaIcon
                  name="chevron-down"
                  :class="isOpen(item.id) && item.hasTranslations ? 'rotate180x' : ''"
                  :size="10"
                />
              </NovaButton>
            </td>
            <td
              class="fixed-left-title fixed-left shadow--left"
              data-testid="adv-search-td-title"
              @click="$router.push(`/experience/${item.enTranslation?.experience_id}/curation/settings`)"
            >
              <p
                class="TableItem__title"
                :title="item.enTranslation?.experience_translation?.title"
                data-testid="adv-search-td-title-link"
                @click="$router.push(`/experience/${item.enTranslation?.experience_id}/curation/settings`)"
              >
                <SearchMatchHighlight
                  :highlight="
                    item?.enTranslation.highlight_fields?.['experience_content.experience_translation.title']?.[0]
                  "
                >
                  {{ item.enTranslation?.experience_translation?.title }}
                </SearchMatchHighlight>
              </p>
            </td>
            <td :title="item.reference_code" class="TableItem__refCode" data-testid="adv-search-td-ref-code">
              {{ item.reference_code }}
            </td>
            <td data-testid="adv-search-td-status">
              <ExperienceStatusIcon
                :status="item.enTranslation?.experience_translation?.distribution_status"
                :date="item.enTranslation?.experience_translation?.distribution_date"
                :media-status="item.experience_media?.distribution_status"
              ></ExperienceStatusIcon>
            </td>
            <td data-testid="adv-search-td-modified">
              {{ formatDateFromString(item.enTranslation?.experience_translation?.updated_date) }}
            </td>
            <td>
              <p class="TableItem__supplier" data-testid="adv-search-td-supplier">
                {{ getSupplierName(item.supplier_id || "") }}
              </p>
            </td>
            <td data-testid="adv-search-td-city">
              <p
                class="TableItem__city"
                :title="getCityName(item.functional_content?.experience_location?.address.city)"
              >
                {{ getCityName(item.functional_content?.experience_location?.address.city) }}
              </p>
            </td>
            <td data-testid="adv-search-td-country">
              <p class="TableItem__country" :title="item.functional_content?.experience_location?.address.country">
                {{ item.functional_content?.experience_location?.address.country }}
              </p>
            </td>
            <td data-testid="adv-search-td-published">
              {{ formatDateFromString(item.experience_media?.distribution_date) }}
            </td>
            <td data-testid="adv-search-td-created">
              {{ formatDateFromString(item?.enTranslation?.experience_translation?.creation_date) }}
            </td>
          </tr>
          <div>
            <AdvancedSearchMatches
              :grid-template-columns="`${REFCODE_POSITION_LEFT} 1fr`"
              :matches="item.enTranslation.highlight_fields || {}"
              :fields-to-skip="FIELDS_TO_SKIP_EDITORIAL"
              :string-to-remove="STRING_TO_REMOVE"
              :padding-left="TITLE_POSITION_LEFT"
              :scroll-shadow-opacity="scrollShadowOpacity"
              :show-vertical-line="isOpen(item.id) && item.hasTranslations"
            />
          </div>
          <template v-if="isOpen(item.id)">
            <template v-for="(translation, idx) in item.translations" :key="idx">
              <AdvancedSearchTranslationRow
                :translation="translation"
                :is-last-item="isLastTranslation(idx, item.translations)"
                :experience-media="item.experience_media!"
                :scroll-shadow-opacity="scrollShadowOpacity"
                :highlight-fields="translation.highlight_fields"
              />
              <div>
                <AdvancedSearchMatches
                  :matches="translation.highlight_fields || {}"
                  :fields-to-skip="FIELDS_TO_SKIP_EDITORIAL"
                  :string-to-remove="STRING_TO_REMOVE"
                  :padding-left="TITLE_POSITION_LEFT"
                  :grid-template-columns="`${REFCODE_POSITION_LEFT} 1fr`"
                  :scroll-shadow-opacity="scrollShadowOpacity"
                  :show-vertical-line="!isLastTranslation(idx, item.translations)"
                />
              </div>
            </template>
          </template>
        </div>
      </template>
    </tbody>
    <div class="AdvancedSearchTable__pagination">
      <slot name="pagination" />
    </div>
  </table>
</template>

<script setup lang="ts">
import ExperienceStatusIcon from "@/features/experience-shared/components/ExperienceStatusIcon.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaSpinner from "@/ui-kit/NovaSpinner/NovaSpinner.vue";
import { useMasterData } from "@/stores/master-data";
import { Supplier } from "@/types/generated/ContractMasterDataApi";
import AdvancedSearchTranslationRow from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchTranslationRow.vue";
import { useBulkSelection } from "@/features/core-shared/composables/useBulkSelection";
import { formatDateFromString } from "@/utils/date-utils";
import { useDetectItemScrollable } from "@/composables/useDetectItemScrollable";
import SearchMatchHighlight from "@/features/advanced-search/components/SearchMatchHighlight/SearchMatchHighlight.vue";

import {
  CURATION_TABLE_COLUMN_TEMPLATE,
  checkboxCellWidth,
  openLangCellWidth,
  titleCellWidth,
} from "@/features/advanced-search/constants/table-constants";
import { TypedDistributionContentSearchHit } from "../../types/seach-hit-overrides";
import AdvancedSearchMatches from "../AdvancedSearchMatches/AdvancedSearchMatches.vue";
import { STRING_TO_REMOVE, FIELDS_TO_SKIP_EDITORIAL } from "../../constants/search-match-constants";
import { ExperienceContentV2 } from "@/types/generated/ContentQueryApiV2";
import { useVModel } from "@vueuse/core";
import TableSortButton from "@/features/core-shared/components/TableSortButton.vue";
import { SortDirection, SortKey } from "@/types/SortingTypes";

export interface Props {
  items: TypedDistributionContentSearchHit[];
  supplierList: Supplier[];
  isExperienceSelected: (experienceId: string) => boolean;
  areAllSelected: boolean;
  areSomeSelected: boolean;
  pending: boolean;
  visibleLanguages: string[] | undefined;
  activeSortKey: SortKey;
  activeSortDirection: SortDirection;
}

interface Events {
  (e: "on:toggleExperienceSelection", experienceId: string): void;
  (e: "on:toggleAllSelection"): void;
  (e: "update:activeSortKey", value: SortKey): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const activeSortKey = useVModel(props, "activeSortKey", emits);

const { getCityByCode } = useMasterData();

const getCityName = (code?: string) => {
  try {
    if (code) {
      return getCityByCode(code)?.name;
    }
  } catch (error) {
    console.error(error);
  }
  return "";
};

const getSupplierName = (id: string) => {
  return props.supplierList?.find((el) => el.id === id)?.name;
};

const table = ref<HTMLTableElement | null>(null);
const { isHorizontallyScrollable } = useDetectItemScrollable(table);
const scrollShadowOpacity = computed(() => (isHorizontallyScrollable.value ? 1 : 0));

const mainSelectionStatus = computed(() => {
  if (props.areAllSelected) {
    return "checked";
  } else if (props.areSomeSelected) {
    return "indeterminate";
  } else {
    return "unchecked";
  }
});

const isLastTranslation = (currentTranslationIdx: number, translations: ExperienceContentV2[] | undefined) => {
  if (!translations) {
    return;
  }

  return currentTranslationIdx === translations.length - 1;
};

const mappedItems = computed(() => {
  const visibleLanguages = props.visibleLanguages;
  const allLanguagesVisible = !visibleLanguages || !visibleLanguages.length;

  return props.items.map(({ content, highlight_fields }) => {
    const enMatches = highlight_fields?.["en"];

    const enTranslation = {
      ...content.experience_content?.find((i) => i.language_code === "en"),
      highlight_fields: enMatches,
    };

    const visibleTranslations = content.experience_content
      ?.filter(
        (translation) =>
          translation.language_code !== "en" &&
          (allLanguagesVisible || visibleLanguages.includes(translation.language_code))
      )
      .map((translation) => {
        const matches = highlight_fields?.[translation.language_code];
        return { ...translation, highlight_fields: matches };
      });

    const hasVisibleTranslations = (visibleTranslations ?? []).length > 0;
    const hasMatchesInTranslation = visibleTranslations?.some((translation) => translation.highlight_fields);
    return {
      ...content,
      enTranslation,
      translations: visibleTranslations,
      hasTranslations: hasVisibleTranslations,
      hasMatchesInTranslation,
    };
  });
});

const experienceIds = computed(() => props.items.map((el) => el.content.id));

const {
  isSelected: isOpen,
  toggleSelection: toggleOpen,
  toggleMultipleSelection: toggleMultipleOpen,
  selectedItems: openedItems,
  clearSelection: closeAllTheExperiences,
} = useBulkSelection(experienceIds);

// opening the translations if there is a match or any visible language have been given
watch(
  () => ({ items: mappedItems.value, visibleLanguages: props.visibleLanguages }),
  ({ items, visibleLanguages }) => {
    const anyVisibleLanguage = visibleLanguages?.length;
    closeAllTheExperiences();
    items?.forEach((experience) => {
      const id = experience.enTranslation.experience_id;
      if (experience.hasMatchesInTranslation || anyVisibleLanguage) {
        toggleOpen(id);
      }
    });
  }
);

const TITLE_POSITION_LEFT = parseInt(checkboxCellWidth) + parseInt(openLangCellWidth) + "px";
const REFCODE_POSITION_LEFT = parseInt(TITLE_POSITION_LEFT) + parseInt(titleCellWidth) + "px";
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.AdvancedSearchTable {
  --table-headers-z-index: 2;

  box-shadow: var(--box-shadow-table);
  background-color: var(--color-white);
  border-radius: var(--border-radius-default);
  display: grid;
  grid-template-rows: auto 1fr;
  position: relative;
  overflow: scroll;
  height: 100%;

  @include font-semibold(14);

  &__headers {
    position: sticky;
    top: 0;
    background-color: var(--color-white);
    z-index: var(--table-headers-z-index);
    display: grid;
    grid-template-columns: v-bind(CURATION_TABLE_COLUMN_TEMPLATE);
    border-bottom: 1px solid var(--color-grey-100);

    & > th {
      padding: rem(5) rem(8);
      color: var(--color-primary-100);
      display: inline-flex;
      align-items: center;
      user-select: none;
    }
  }

  &__overlay {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    z-index: 1;
  }

  &__pagination {
    position: sticky;
    bottom: 0;
    z-index: var(--table-headers-z-index);
  }
}

.TableItem {
  border-bottom: 1px solid var(--color-grey-100);

  &__row {
    display: grid;
    grid-template-columns: v-bind(CURATION_TABLE_COLUMN_TEMPLATE);

    @include font-regular(14);

    &:last-of-type {
      border-bottom: none;
    }

    & > td {
      display: flex;
      align-items: center;
      padding: rem(5) rem(8);
      height: rem(40);
    }
  }

  &__title,
  &__city,
  &__country,
  &__supplier,
  &__refCode {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-decoration: none;
  }

  &__title {
    max-width: v-bind(titleCellWidth);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__supplier {
    max-width: 140px;
  }

  &__refCode {
    max-width: 300px;
  }

  &__no-translation {
    height: rem(35);
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid var(--color-grey-100);
    position: sticky;
    left: 0;
  }
}

:deep(.Button.AdvancedSearchTable__openBtn) {
  color: var(--color-primary-100);
}

.rotate180x {
  transform: rotateX(180deg);
}

.fixed-left {
  position: sticky;
  background-color: var(--color-white);

  &-check {
    left: 0;
  }

  &-langs {
    left: v-bind(checkboxCellWidth);
  }

  &-title {
    left: v-bind(TITLE_POSITION_LEFT);
  }

  &-ref-code {
    left: v-bind(REFCODE_POSITION_LEFT);
  }
}

th.fixed-left {
  z-index: var(--table-headers-z-index);
}

.fixed-right {
  position: sticky;
  background-color: var(--color-white);
  right: 0;
}

.shadow--left {
  &::before {
    transition: opacity 0.2s ease-in-out;
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
    transition: opacity 0.2s ease-in-out;
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
