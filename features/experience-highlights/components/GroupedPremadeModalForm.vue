<template>
  <NovaCollapse
    v-if="getOptions.length > 0"
    class="PremadeForm"
    :active="isGroupSelected(options) || getSelected.length > 0"
    :model-value="open"
  >
    <template #title>
      <NovaCheckbox
        class="mr-2"
        label=""
        value=""
        :status="isGroupSelected(options) ? 'checked' : getSelected.length > 0 ? 'indeterminate' : 'unchecked'"
        @update:status="() => toggleAll(options)"
      />
      {{ name }}
    </template>
    <div class="mx-4 pt-3 pb-1 PremadeForm__header">
      <div class="PremadeForm__selected">
        {{ `${getSelected.length} ${$t("common.selected").toLowerCase()}` }}
      </div>

      <div>
        <NovaButton
          size="xs"
          data-testid="highlight-manager-premade-clear-group"
          variant="underlined"
          :disabled="getSelected.length === 0"
          @click="() => clearAll()"
          >{{ $t("common.actions.clear_all.text") }}</NovaButton
        >
      </div>
    </div>
    <ul class="px-4 pt-4 pb-2 PremadeForm__list">
      <template v-for="item in getOptions" :key="item.id">
        <li class="PremadeForm__list-item">
          <NovaCheckbox
            data-testid="highlight-manager-premade-list-modal-checkbox"
            :label="item.name"
            :value="item.id"
            :status="modelValue.has(item.id) ? 'checked' : 'unchecked'"
            @update:status="() => toggle(item)"
          />
        </li>
      </template>
    </ul>
  </NovaCollapse>
</template>

<script setup lang="ts">
import { ExperienceMasterDataItem } from "@/composables/useExperienceMasterDataApi";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import { useMemoize } from "@vueuse/core";

interface Props {
  name: string;
  modelValue: Map<string, ExperienceMasterDataItem>;
  options: ExperienceMasterDataItem[];
  filteredOptions?: ExperienceMasterDataItem[] | null;
  open?: boolean;
}

const props = defineProps<Props>();

const isGroupSelected = computed(
  useMemoize(() => (groupOptions: ExperienceMasterDataItem[]) => groupOptions.every((i) => props.modelValue.has(i.id)))
);

const getSelected = computed(() => props.options.flatMap((i) => (props.modelValue.has(i.id) ? i.id : [])));

// We need to split the filtered options, otherwise we can't accurately track what is selected when the filter is active.
const getOptions = computed(() => props.filteredOptions || props.options);

function toggle(item: ExperienceMasterDataItem) {
  if (props.modelValue.has(item.id)) {
    props.modelValue.delete(item.id);
  } else {
    props.modelValue.set(item.id, item);
  }
}

function toggleAll(groupOptions: ExperienceMasterDataItem[]) {
  const isSelected = isGroupSelected.value(groupOptions);

  if (isSelected) {
    groupOptions.forEach((item) => props.modelValue.delete(item.id));
  } else {
    groupOptions.forEach((item) => props.modelValue.set(item.id, item));
  }
}

function clearAll() {
  getSelected.value.forEach((id) => props.modelValue.delete(id));
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.PremadeForm {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: var(--border-default);
    border-bottom-color: var(--color-neutral-60);
  }

  &__selected {
    color: var(--color-text-90);

    @include font-regular(12);
  }

  &__list-item {
    padding: rem(6px) 0;
  }
}
</style>
