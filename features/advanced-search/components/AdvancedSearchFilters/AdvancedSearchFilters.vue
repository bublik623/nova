<template>
  <div
    class="AdvancedSearchFilters"
    :class="{
      isClosed: close,
      isOpen: !close,
    }"
  >
    <template v-if="close">
      <div class="flex justify-center items-center px-4 py-2">
        <NovaButtonIcon name="sliders" :size="24" theme="dark" @click="toggleClose" />
      </div>

      <!-- empty body for layout -->
      <div class="body" />

      <div class="footer">
        <NovaDivider />
        <div class="flex justify-center items-center p-4">
          <NovaButton
            variant="underlined"
            data-testid="advanced-search-clear-filters"
            :disabled="!canClear"
            @click="emits('on:clearAllFilters')"
          >
            {{ $t("advanced-search.filters.clear-filters") }}
          </NovaButton>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex justify-between items-center px-4 mt-2">
        <h2>{{ $t("advanced-search.filters.title") }}</h2>
        <NovaButtonIcon name="close" :size="16" theme="dark" @click="toggleClose" />
      </div>
      <div class="body px-4">
        <div v-if="mostUsedConfig.length > 0" class="mt-5">
          <h3>{{ $t("advanced-search.filters.most-used") }}</h3>
          <AdvancedSearchFilterSection
            :filters-values="filtersValues"
            :config="mostUsedConfig"
            @on:update-filter="(eventArgs) => emits('on:updateFilter', eventArgs)"
          />
        </div>

        <div v-if="moreFiltersConfig.length > 0" class="mt-5">
          <h3>{{ $t("advanced-search.filters.more-filters") }}</h3>
          <AdvancedSearchFilterSection
            :filters-values="filtersValues"
            :config="moreFiltersConfig"
            @on:update-filter="(eventArgs) => emits('on:updateFilter', eventArgs)"
          />
        </div>
      </div>

      <div>
        <NovaDivider />

        <div class="flex justify-between items-center p-4">
          <NovaButton
            :disabled="!canClear"
            variant="underlined"
            data-testid="advanced-search-clear-filters"
            @click="emits('on:clearAllFilters')"
          >
            {{ $t("advanced-search.filters.clear-filters") }}
          </NovaButton>
          <NovaButton
            :disabled="!canApply"
            data-testid="advanced-search-apply-filters"
            @click="emits('on:applyFilters')"
          >
            {{ $t("advanced-search.filters.apply-filters") }}
          </NovaButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaDivider from "@/ui-kit/NovaDivider/NovaDivider.vue";
import {
  AdvancedFilterDateRangeValue,
  AdvancedFilterMultiselectValue,
  AdvancedFiltersConfig,
  AdvancedFiltersValues,
} from "../../types/filters";
import AdvancedSearchFilterSection from "./AdvancedSearchFilterSection.vue";

interface Props {
  mostUsedConfig: AdvancedFiltersConfig[];
  moreFiltersConfig: AdvancedFiltersConfig[];
  filtersValues: AdvancedFiltersValues;
  canClear: boolean;
  canApply: boolean;
}

type Events = {
  (e: "on:clearAllFilters"): void;
  (e: "on:applyFilters"): void;
  (
    e: "on:updateFilter",
    args: { filterKey: string; value: AdvancedFilterDateRangeValue | AdvancedFilterMultiselectValue }
  ): void;
};

defineProps<Props>();
const emits = defineEmits<Events>();
const close = ref(false);

function toggleClose() {
  close.value = !close.value;
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.AdvancedSearchFilters {
  background-color: white;
  border-radius: var(--border-radius-default);
  position: relative;
  display: flex;
  flex-direction: column;

  &.isClosed {
    width: rem(69px);
  }

  &.isOpen {
    width: rem(340px);
    min-width: rem(340px);
  }
}

.body {
  overflow-y: visible;
  height: 100%;
}
</style>
