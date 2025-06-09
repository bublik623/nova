<script setup lang="ts" generic="TValue extends PropertyKey">
import NovaSelect from "@/ui-kit/NovaSelectPrimitive/NovaSelect.vue";
import NovaSelectTrigger from "@/ui-kit/NovaSelectPrimitive/NovaSelectTrigger.vue";
import NovaSelectDropdown from "@/ui-kit/NovaSelectPrimitive/NovaSelectDropdown.vue";
import NovaSelectOption from "@/ui-kit/NovaSelectPrimitive/NovaSelectOption.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { BaseOption } from "@/types/Option";
import { useSingleSelect } from "./useSingleSelect";
import { computed, ref, toRef, nextTick } from "vue";
import { autoUpdate, useFloating, Placement } from "@floating-ui/vue";

export type InlineMultiSelectProps<T> = {
  options: BaseOption<T>[];
  placement?: Placement;
  contentTestId?: string;
};

const props = withDefaults(defineProps<InlineMultiSelectProps<TValue>>(), {
  contentTestId: "inline-select-content",
  placement: "bottom-end",
});
const selectedOptionValue = defineModel<TValue | undefined>("selectedValue", { required: true });

const { $t } = useNuxtApp();

const searchInput = ref<HTMLInputElement | null>(null); // Renamed from searchInputRef for consistency
const isOpen = ref(false);

const options = computed(() => props.options);
const filterKeyword = ref("");
const { matchingOptions, selectOption } = useSingleSelect<TValue>(
  options,
  filterKeyword,
  toRef(selectedOptionValue) // Use toRef to pass reactive prop/model
);

const selectedOptionLabel = computed(() => {
  if (!selectedOptionValue.value) {
    return "";
  }

  const selectedOption = props.options.find((option) => selectedOptionValue.value === option.value);
  return selectedOption?.label;
});

async function handleOpenDropdownChange(newIsOpenState: boolean) {
  if (newIsOpenState) {
    await nextTick(() => {
      searchInput.value?.focus(); // Use correct ref name
    });
  }

  isOpen.value = newIsOpenState;
}

const select = ref();
const trigger = ref();
const dropdown = ref();
const { floatingStyles } = useFloating(trigger, dropdown, {
  placement: props.placement,
  open: isOpen.value,
  whileElementsMounted: autoUpdate,
});

function selectOptionAndCloseDropdown(option: BaseOption<TValue>) {
  selectOption(option);
  select.value.closeDropdown();
}
</script>

<template>
  <NovaSelect ref="select" @update:open="handleOpenDropdownChange">
    <NovaSelectTrigger ref="trigger" data-testid="inline-select-trigger" class="flex flex-row justify-between w-full">
      <span class="truncate">{{ selectedOptionLabel }}</span>
      <NovaIcon name="chevron-down" />
    </NovaSelectTrigger>

    <Teleport to="body">
      <NovaSelectDropdown ref="dropdown" :style="floatingStyles" class="w-96" :data-testid="contentTestId">
        <div class="overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 w-full">
          <div class="max-h-60 overflow-y-auto p-2 w-full">
            <div class="flex flex-col">
              <div class="flex flex-row items-center rounded-xl bg-neutral-30 h-min-max p-2 my-2">
                <NovaIcon name="search" class="color-black mr-2" />
                <input
                  ref="searchInput"
                  type="search"
                  :value="filterKeyword"
                  class="bg-transparent placeholder:italic placeholder:text-text-90 focus:outline-none focus:ring-none w-full"
                  :placeholder="$t('common.search')"
                  data-testid="inline-select-search"
                  @input="(x) => filterKeyword = (x.target as HTMLInputElement).value"
                />
              </div>

              <div class="flex flex-col mt-1">
                <NovaSelectOption
                  v-for="option in matchingOptions"
                  :key="option.value"
                  :value="option.value"
                  :data-testid="`option-item-${String(option.value)}`"
                  class="flex flex-row items-center"
                  @click="selectOptionAndCloseDropdown(option)"
                >
                  <span data-testid="option-label">{{ option.label }}</span>
                </NovaSelectOption>
              </div>
            </div>
          </div>
        </div>
      </NovaSelectDropdown>
    </Teleport>
  </NovaSelect>
</template>
