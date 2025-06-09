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
      data-testid="adv-search-table-raw-no-items-warning"
      class="AdvancedSearchTable__overlay"
    >
      <div class="Table__noItemsWarning">
        {{ $t("adv-search.table.no.items.warning") }}
      </div>
    </div>
    <tbody v-else>
      <template v-for="{ content, highlight_fields } in items" :key="content.id">
        <div class="TableItem">
          <tr class="TableItem__row" data-testid="adv-search-table-item">
            <td class="fixed-left fixed-left-check" data-testid="adv-search-td-checkbox">
              <NovaCheckbox
                :value="content.experience_id!"
                :disabled="areAllSelected"
                :status="isExperienceSelected(content.experience_id!) ? 'checked' : 'unchecked'"
                @update:status="$emit('on:toggleExperienceSelection', content.experience_id!)"
              />
            </td>
            <td class="fixed-left-title fixed-left shadow--left" data-testid="adv-search-td-title">
              <p
                class="TableItem__title"
                :title="content.commercial?.title"
                data-testid="adv-search-td-title-link"
                @click.stop="$router.push(getTableItemLink(content.experience_id as string))"
              >
                <SearchMatchHighlight :highlight="highlight_fields?.['commercial.title']?.[0]">
                  {{ content.commercial?.title }}
                </SearchMatchHighlight>
              </p>
            </td>
            <td>
              <p :title="content.reference_code" class="TableItem__refCode" data-testid="adv-search-td-ref-code">
                {{ content.reference_code }}
              </p>
            </td>
            <td data-testid="adv-search-td-modified">
              {{ formatDateFromString(content.updated_date) }}
            </td>
            <td>
              <p
                :title="getSupplierName(content.supplier_id ?? '')"
                class="TableItem__supplier"
                data-testid="adv-search-td-supplier"
              >
                {{ getSupplierName(content.supplier_id ?? "") }}
              </p>
            </td>
            <td>
              <p
                :title="getCityName(content.functional?.location?.address.city)"
                class="TableItem__city"
                data-testid="adv-search-td-city"
              >
                {{ getCityName(content.functional?.location?.address.city) }}
              </p>
            </td>
            <td :title="content.functional?.location?.address.country" data-testid="adv-search-td-country">
              <p class="TableItem__country">
                {{ content.functional?.location?.address.country }}
              </p>
            </td>
            <td data-testid="adv-search-td-created">
              {{ formatDateFromString(content.creation_date) }}
            </td>
          </tr>
          <AdvancedSearchMatches
            :matches="highlight_fields || {}"
            :fields-to-skip="FIELDS_TO_SKIP_RAW"
            :string-to-remove="STRING_TO_REMOVE"
            :padding-left="checkboxCellWidth"
            grid-template-columns="375px 1fr"
            :scroll-shadow-opacity="scrollShadowOpacity"
          />
        </div>
      </template>
    </tbody>
    <div class="AdvancedSearchTable__pagination">
      <slot name="pagination" />
    </div>
  </table>
</template>

<script setup lang="ts">
import { RAW_TABLE_COLUMN_TEMPLATE, checkboxCellWidth } from "@/features/advanced-search/constants/table-constants";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaSpinner from "@/ui-kit/NovaSpinner/NovaSpinner.vue";
import { useMasterData } from "@/stores/master-data";
import { Supplier } from "@/types/generated/ContractMasterDataApi";
import { useDetectItemScrollable } from "@/composables/useDetectItemScrollable";
import { formatDateFromString } from "@/utils/date-utils";
import SearchMatchHighlight from "@/features/advanced-search/components/SearchMatchHighlight/SearchMatchHighlight.vue";
import { TypedRawSearchHit } from "@/features/advanced-search/types/seach-hit-overrides";
import AdvancedSearchMatches from "@/features/advanced-search/components/AdvancedSearchMatches/AdvancedSearchMatches.vue";
import { FIELDS_TO_SKIP_RAW, STRING_TO_REMOVE } from "@/features/advanced-search/constants/search-match-constants";
import { useVModel } from "@vueuse/core";
import TableSortButton from "@/features/core-shared/components/TableSortButton.vue";
import { SortDirection, SortKey } from "@/types/SortingTypes";

const { getCityByCode } = useMasterData();

interface Props {
  supplierList: Supplier[];
  items: TypedRawSearchHit[];
  isExperienceSelected: (experienceId: string) => boolean;
  areAllSelected: boolean;
  areSomeSelected: boolean;
  pending: boolean;
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

const getSupplierName = (id: string) => {
  return props.supplierList?.find((el) => el.id === id)?.name;
};

function getTableItemLink(id: string) {
  return `/experience/${id}/raw/settings`;
}
</script>

<style scoped lang="scss">
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
    border-bottom: 1px solid var(--color-grey-100);
    grid-template-columns: v-bind(RAW_TABLE_COLUMN_TEMPLATE);

    & > th {
      padding: rem(8) rem(8);
      color: var(--color-primary-100);
      display: inline-flex;
      align-items: center;
    }
  }

  &__overlay {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
  }

  &__pagination {
    position: sticky;
    bottom: 0;
  }
}

.TableItem {
  border-bottom: 1px solid var(--color-grey-100);

  &__row {
    display: grid;
    grid-template-columns: v-bind(RAW_TABLE_COLUMN_TEMPLATE);
    @include font-regular(14);

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
    max-width: 240px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__supplier {
    max-width: 120px;
  }

  &__refCode {
    max-width: 300px;
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

  &-title {
    left: v-bind(checkboxCellWidth);
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
