<script setup lang="ts">
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaSortButton from "@/ui-kit/NovaSortButton/NovaSortButton.vue";
import { Price } from "../types";
import { usePriceTable } from "./usePriceTable";
import PricePaxHeader from "./PricePaxHeader.vue";
import PricePaxRow from "./PricePaxRow.vue";
import InlineSingleSelect from "@/features/opinoia/operational/shared/inline-single-select/InlineSingleSelect.vue";
import InlineMultiSelect from "@/features/opinoia/operational/shared/inline-multi-select/InlineMultiSelect.vue";
import DatePicker from "@/features/opinoia/operational/shared/date-picker/DatePicker.vue";
import { DateRange } from "@/types/DateTypes";
import { getDateRange, formatDateToString } from "@/features/opinoia/shared/utils/date-utils";
import { Option } from "@/types/Option";
import SimpleTable from "@/features/opinoia/operational/shared/simple-table/SimpleTable.vue";
import type { Pax } from "@/types/generated/OfferServiceApi";

type PaxData = {
  code: string;
  description: string;
};

export type PriceTableProps = {
  experienceId: string;
  invalidPricesId: string[];
  optionList: Option[];
  currencyList: Option[];
  languageList: Option[];
  dayList: Option[];
  paxData: PaxData[];
  optionPaxes: Map<string, string[]>; // Map of option ID to array of pax codes
  experiencePaxes: Pax[];
};

const props = withDefaults(defineProps<PriceTableProps>(), {
  optionList: () => [],
  currencyList: () => [],
  languageList: () => [],
  dayList: () => [],
  optionPaxes: () => new Map(),
  experiencePaxes: () => [],
});

const prices = defineModel<Price[]>("prices", { required: true });
const {
  collapsedPaxPrices,
  sortColumn,
  sortDirection,
  sortBy,
  addNewPrice,
  duplicatePrice,
  removePrice,
  toggleCollapsedPaxPrices,
} = usePriceTable(prices);

const optionSortDirection = computed(() => (sortColumn.value === "option" ? sortDirection.value : undefined));

function createPaxPrice(paxCode: string): Price["paxPrices"][number] {
  return {
    paxType: paxCode,
    cost: undefined,
    initialPrice: undefined,
    suggestedPrice: undefined,
  };
}

function handleUpdateDateRange(price: Price, dates: DateRange) {
  if (!dates.from || !dates.to) {
    return;
  }
  price.dateFrom = formatDateToString(dates.from);
  price.dateTo = formatDateToString(dates.to);
}

function getPaxName(paxCode: string) {
  const pax = props.paxData.find((pax) => pax.code === paxCode);
  return pax?.description || paxCode;
}

/**
 * if paxCodes is an empty array, that means user has selected `all` paxes
 * yes its weird but this is how the backend works
 */
const hasSelectedAllPaxes = (paxCodes: string[]) => paxCodes.length === 0;

const hasSelectedSpecificPaxes = (paxCodes: string[]) => paxCodes.length > 0;

function handleOptionChange(price: Price, selectedOptionId: string) {
  const paxCodes = props.optionPaxes.get(selectedOptionId);

  // show all paxes
  if (paxCodes && hasSelectedAllPaxes(paxCodes)) {
    price.paxPrices = props.experiencePaxes.map(({ pax_code }) => createPaxPrice(pax_code));
    return;
  }

  // show specific paxes
  if (paxCodes && hasSelectedSpecificPaxes(paxCodes)) {
    price.paxPrices = paxCodes.map((paxCode) => createPaxPrice(paxCode));
    return;
  }

  // if no paxes are selected, show empty array
  price.paxPrices = [];
}
</script>

<template>
  <div class="flex flex-col price-table-wrapper">
    <SimpleTable data-testid="table-price">
      <thead class="bg-primary-100/5">
        <tr>
          <th data-testid="column-collapse" class="w-14"></th>
          <th data-testid="column-option" class="w-40">
            <div class="flex flex-row justify-between">
              <span>{{ $t("opinoia.price-section.table.column.option.title") }}*</span>
              <NovaSortButton :sorting="optionSortDirection" @click="sortBy('option')" />
            </div>
          </th>
          <th data-testid="column-date-range" class="min-w-48 w-48">
            {{ $t("opinoia.price-section.table.column.dateRange.title") }}*
          </th>
          <th data-testid="column-currency" class="w-40">
            {{ $t("opinoia.price-section.table.column.currency.title") }}*
          </th>
          <th data-testid="column-languages" class="w-40">
            {{ $t("opinoia.price-section.table.column.languages.title") }}*
          </th>
          <th data-testid="column-zones" class="w-40">{{ $t("opinoia.price-section.table.column.zones.title") }}*</th>
          <th data-testid="column-days" class="min-w-40 max-w-64">
            {{ $t("opinoia.price-section.table.column.daysOfWeek.title") }}*
          </th>
          <th scope="col" data-testid="column-actions" class="w-10"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="price in prices" :key="price.id">
          <tr :class="{ error: invalidPricesId.includes(price.id) }" data-testid="row-price" :data-row-id="price.id">
            <td data-testid="cell-collapse">
              <div class="flex justify-center">
                <button
                  class="w-3.5 h-3.5 rounded-sm bg-primary-100 text-white flex items-center justify-center"
                  data-testid="button-collapse"
                  @click="toggleCollapsedPaxPrices(price.id)"
                >
                  <NovaIcon v-if="collapsedPaxPrices.includes(price.id)" name="chevron-down" :size="12" />
                  <NovaIcon v-else name="chevron-up" :size="12" />
                </button>
              </div>
            </td>
            <td data-testid="cell-option">
              <InlineSingleSelect
                v-model:selected-value="price.option_id"
                placement="bottom"
                :options="optionList"
                content-test-id="option-select-content"
                @update:selected-value="(optionId) => handleOptionChange(price, optionId!)"
              />
            </td>
            <td data-testid="cell-date-range">
              <DatePicker
                :selected-dates="getDateRange(price.dateFrom, price.dateTo)"
                @update:selected-dates="(dates) => handleUpdateDateRange(price, dates)"
              />
            </td>
            <td data-testid="cell-currency">
              <InlineSingleSelect
                v-model:selected-value="price.currency"
                content-test-id="currency-select-content"
                placement="bottom"
                :options="currencyList"
              />
            </td>
            <td data-testid="cell-languages">
              <InlineMultiSelect
                v-model:selected-values="price.languages"
                content-test-id="languages-select-content"
                :options="languageList"
              />
            </td>
            <td data-testid="cell-zones"></td>
            <td data-testid="cell-days">
              <InlineMultiSelect
                v-model:selected-values="price.days"
                content-test-id="days-select-content"
                :options="dayList"
              />
            </td>
            <td data-testid="cell-actions">
              <div class="flex">
                <NovaButtonIcon
                  data-testid="button-duplicate"
                  shape="square"
                  theme="dark"
                  :size="16"
                  name="duplicate"
                  @click="duplicatePrice(price)"
                />
                <NovaButtonIcon
                  data-testid="button-delete"
                  shape="square"
                  theme="dark"
                  :size="16"
                  name="trash"
                  @click="removePrice(price)"
                />
              </div>
            </td>
          </tr>

          <template v-if="!collapsedPaxPrices.includes(price.id)">
            <PricePaxHeader :parent-id="price.id" />
            <PricePaxRow v-if="!price.paxPrices?.length" disabled :parent-id="price.id" />
            <PricePaxRow
              v-for="pax in price.paxPrices"
              v-else
              :key="pax.paxType"
              v-model:cost="pax.cost"
              v-model:initial-price="pax.initialPrice"
              v-model:suggested-price="pax.suggestedPrice"
              :parent-id="price.id"
              :pax-label="getPaxName(pax.paxType)"
            />
          </template>
        </template>
      </tbody>
    </SimpleTable>
    <div class="flex flex-row mt-4">
      <NovaButton data-testid="button-new-line" variant="text" theme="primary" size="xs" @click="addNewPrice">
        <NovaIcon name="plus" :size="14" class="mr-2" />
        <span class="text-sm">{{ $t("common.new-line") }}</span>
      </NovaButton>
    </div>
  </div>
</template>
