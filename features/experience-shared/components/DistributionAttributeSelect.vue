<template>
  <div ref="component" class="DistributionAttributeSelect">
    <div class="DistributionAttributeSelect__dropdown-container">
      <p class="DistributionAttributeSelect__label">{{ label }}</p>
      <template v-if="!readonly">
        <NovaDropdown
          :options="options"
          :show="isDropdownVisible"
          :selected="selectedOption ? [selectedOption] : []"
          @select:option="onSelectedOption"
        >
          <template #toggle>
            <button
              class="DistributionAttributeSelect__toggle"
              :data-testid="testId"
              @click="isDropdownVisible = !isDropdownVisible"
            >
              <template v-if="selectedOption">
                <span class="DistributionAttributeSelect__selectedLabel ml-1">
                  {{ selectedOption.label }}
                </span>
              </template>
              <template v-else>
                <span class="DistributionAttributeSelect__placeholder">
                  {{ placeholder }}
                </span>
              </template>
              <span class="DistributionAttributeSelect__chevron">
                <NovaIcon :name="isDropdownVisible ? 'chevron-up' : 'chevron-down'" :size="14" />
              </span>
            </button>
          </template>
          <template #default="{ option }">
            <div class="DistributionAttributeSelect__item">
              {{ option.label }}
            </div>
          </template>
        </NovaDropdown>
      </template>
      <template v-else>
        <div class="DistributionAttributeSelect__readonly">
          <span v-if="selectedOption" class="DistributionAttributeSelect__readonly-label">
            {{ selectedOption.label }}
          </span>
          <span v-else class="DistributionAttributeSelect__readonly-placeholder">
            {{ placeholder }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" generic="OptionValues extends  number | DistributionContent['curation_level']">
import { computed } from "vue";
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { onClickOutside } from "@vueuse/core";
import { ListOption } from "@/types/Option";
import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";

interface AttributeOptions extends ListOption<{ label: string; value: OptionValues }> {}

interface DistributionAttributeSelectProps {
  options: AttributeOptions[];
  selected?: OptionValues;
  label: string;
  testId: string;
  placeholder: string;
  readonly?: boolean;
}

const component = ref(null);
const isDropdownVisible = ref(false);

const props = defineProps<DistributionAttributeSelectProps>();
const emits = defineEmits<{
  (e: "update:selected-attribute", value: OptionValues): void;
}>();

const selectedOption = computed(() => {
  return props.options.find((option) => option.value === props.selected);
});

const onSelectedOption = (option: AttributeOptions) => {
  emits("update:selected-attribute", option.value);
  isDropdownVisible.value = false;
};

onClickOutside(component, () => (isDropdownVisible.value = false));
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.DistributionAttributeSelect {
  width: 100%;

  &__dropdown-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: rem(10);

    &:nth-child(even) {
      margin-bottom: 0;
    }
  }

  &__label {
    width: 100%;
    color: var(--color-text-90);
    text-align: left;
    margin-bottom: rem(2);
    @include font-semibold(12);
  }

  &__placeholder {
    width: 100%;
    text-align: left;
    font-size: rem(14);
    font-style: italic;
    color: var(--color-text-70);
    padding: rem(7) rem(6);
    @include font-regular(14);
  }

  &__selectedLabel {
    padding: rem(7) rem(6);
  }

  &__toggle {
    width: 100%;
    height: rem(32);
    background-color: transparent;
    border: 1px solid var(--color-neutral-60);
    border-radius: var(--border-radius-default);
    text-align: center;
    color: var(--color-text-100);
    cursor: pointer;
    align-items: center;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    @include font-semibold(12);
  }

  &__item {
    display: flex;
    align-items: center;
    @include font-regular(12);
  }

  &__chevron {
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: rem(9);
  }

  &__readonly {
    border: transparent;
    margin: rem(7) rem(0);
    @include font-semibold(12);
  }
}

:deep(.OptionsList__list-item) {
  padding: rem(8);
}
</style>
