<template>
  <div class="AdvancedSearchQuery p-4">
    <div class="AdvancedSearchQuery__first-row">
      <NovaButtonToggle
        v-if="canUserToggleView"
        class="mr-4 toggle"
        :model-value="isSelected"
        data-testid="editorial-raw-toggle"
        @update:model-value="emits('navigate:toggle')"
      >
        <template #firstOption>{{ $t("common.btn.toggle.editorial") }}</template>
        <template #secondOption>{{ $t("common.btn.toggle.raw") }}</template>
      </NovaButtonToggle>
      <NovaInputText
        id="advanced-search-query-input"
        :model-value="props.query"
        type="text"
        placeholder="Enter your search query"
        @update:model-value="(updatedQuery) => emits('on:updateQuery', updatedQuery)"
        @clear="emits('clearQuery')"
        @keyup.enter="canSearch && emits('search')"
      />
      <div class="ml-2">
        <NovaButton
          :disabled="!canSearch"
          data-testid="advanced-search-query-button"
          :loading="isSearching"
          @click="emits('search')"
        >
          {{ $t("common.search") }}
        </NovaButton>
      </div>
      <div class="ml-2">
        <NovaButton
          v-if="showExportButton"
          :disabled="!canExport"
          data-testid="advanced-search-export-button"
          :loading="isExporting"
          @click="emits('export')"
        >
          <NovaIcon class="mr-2" name="download" />
          {{ $t("common.export") }}
        </NovaButton>
      </div>
    </div>
    <hr class="AdvancedSearchQuery__divider mt-4" />
    <div class="AdvancedSearchQuery__second-row mt-5">
      <div class="experiences-count">
        <p>
          {{ experiencesCountText }}
        </p>
      </div>
      <div class="AdvancedSearchQuery__chips"><slot name="chips" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from "#app";
import NovaButtonToggle from "@/ui-kit/NovaButtonToggle/NovaButtonToggle.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

interface Props {
  query: string;
  canSearch: boolean;
  canExport: boolean;
  isSearching: boolean;
  isExporting: boolean;
  isSelected: boolean;
  experiencesCount: number | undefined;
  showExportButton: boolean;
  canUserToggleView: boolean;
}

interface Events {
  (e: "on:updateQuery", updatedQuery: string): void;
  (e: "search"): void;
  (e: "clearQuery"): void;
  (e: "export"): void;
  (e: "navigate:toggle"): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();
const { $t } = useNuxtApp();

const experiencesCountText = computed(() => {
  const experiencesCount = props.experiencesCount ?? 0;
  const isEmpty = experiencesCount === 0;
  const isSingular = experiencesCount === 1;

  let num: 0 | 1 | 2 = 0;
  if (!isEmpty) {
    num = isSingular ? 1 : 2;
  }

  return $t("advancedSearch.query.experiencesCount", {
    num,
    placeholders: { count: experiencesCount },
  });
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.AdvancedSearchQuery {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: var(--border-radius-default);

  &__first-row {
    display: flex;
    width: 100%;
    align-items: center;

    .toggle {
      align-self: stretch;
    }
  }

  &__divider {
    background-color: var(--color-neutral-40);
    height: 1px;
    width: 100%;
    border: 0;
  }

  &__second-row {
    display: flex;
    width: 100%;
    align-items: center;
    height: 100%;

    .experiences-count {
      margin-right: rem(14);
      height: 100%;

      p {
        white-space: nowrap;
        @include font-regular(14);
      }
    }
  }

  &__chips {
    min-height: rem(26);
  }
}
</style>
