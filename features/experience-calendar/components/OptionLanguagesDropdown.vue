<script setup lang="ts">
import {
  MultiSelect,
  MultiSelectCheckbox,
  MultiSelectItem,
  MultiSelectPortal,
  MultiSelectTrigger,
} from "@/features/stop-sales/components/MultiSelect";
import { MultiSelectOption } from "@/features/stop-sales/components/MultiSelect/multi-select.types";
import NovaSpinner from "@/ui-kit/NovaSpinner/NovaSpinner.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import RenderHtml from "@/components/Utils/RenderHtml/RenderHtml.vue";

export type LanguageOption = MultiSelectOption<string>;

const searchQuery = ref("");
const items = defineModel<LanguageOption[]>({ default: [] });
const selectedItems = defineModel<LanguageOption[]>("selectedItems", { default: [] });
const props = defineProps<{
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  isReadonly?: boolean;
}>();

const filteredItems = computed(() => {
  return items.value.filter((item) => item.label.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const sortedItems = computed(() => {
  return filteredItems.value.sort((a, b) => a.label.localeCompare(b.label));
});

function handleClear() {
  selectedItems.value = [];
}
</script>

<template>
  <template v-if="isReadonly">
    <RenderHtml class="text-sm" :string="selectedItems.map(({ label }) => label).join(', ')" />
  </template>
  <MultiSelect v-else v-model:selected-values="selectedItems" placement="bottom-start">
    <template #default="{ isDropdownOpen }">
      <MultiSelectTrigger v-slot="context" as-child>
        <div v-bind="context?.triggerProps">
          <button
            v-show="!isDropdownOpen"
            class="w-full h-8 flex items-center justify-between px-2 text-sm border rounded-lg overflow-hidden"
            :class="[
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              props.error ? 'border-error-100' : 'border-neutral-60',
            ]"
            :disabled="disabled"
            data-testid="option-languages-trigger"
            :aria-invalid="!!props.error"
            @click="context?.actions.handleToggle"
          >
            <span
              class="text-sm font-normal"
              :class="[selectedItems.length ? 'text-text-100' : 'text-text-70 italic']"
              :title="selectedItems.length ? `${selectedItems.length} selected` : $t('common.select')"
            >
              {{
                selectedItems.length
                  ? `${selectedItems.length} ${$t("common.dropdown.header.selected")}`
                  : $t("common.select")
              }}
            </span>
            <NovaIcon name="chevron-down" :size="14" />
          </button>

          <NovaInputText
            v-show="isDropdownOpen"
            id="option-languages-search"
            v-model="searchQuery"
            size="md"
            left-icon="search"
            :placeholder="$t('common.search')"
            :disabled="disabled"
            data-testid="option-languages-input-search"
          />
        </div>
      </MultiSelectTrigger>

      <MultiSelectPortal
        class="mt-1 bg-white w-full ring-1 ring-neutral-60 rounded-lg shadow-popover overflow-hidden"
        data-testid="option-languages-dropdown"
        match-trigger-width
      >
        <div>
          <div class="flex items-center justify-between px-2 py-1 border-b border-neutral-40">
            <span class="text-xs text-text-90 font-normal">
              {{ selectedItems.length || "0" }} {{ $t("common.dropdown.header.selected") }}
            </span>
            <NovaButton
              data-testid="dropdown-clear-all"
              variant="underlined"
              :disabled="selectedItems.length === 0"
              size="xs"
              @click="handleClear"
            >
              {{ $t("common.dropdown.clear.button") }}
            </NovaButton>
          </div>

          <div class="px-1 min-h-16 max-h-72 overflow-y-auto">
            <div v-if="isLoading" class="flex items-center justify-center py-4">
              <NovaSpinner :size="16" />
            </div>

            <template v-else-if="sortedItems.length">
              <div v-for="item in sortedItems" :key="item.val" class="flex items-center gap-2 py-2 rounded px-1">
                <MultiSelectCheckbox :input-props="{ id: `language-checkbox-${item.val}` }" :model-value="item" />
                <MultiSelectItem
                  :for="`language-checkbox-${item.val}`"
                  data-testid="language-label"
                  class="flex-1 cursor-pointer text-sm font-normal"
                >
                  {{ item.label }}
                </MultiSelectItem>
              </div>
            </template>

            <div v-else class="text-sm text-center text-neutral-500 py-2">
              {{ $t("common.no.items.found") }}
            </div>
          </div>
        </div>
      </MultiSelectPortal>
    </template>
  </MultiSelect>
</template>
