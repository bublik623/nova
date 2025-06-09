<template>
  <div class="DistributionAttributes">
    <div class="DistributionAttributes__header" @click="toggleCollapse">
      <h3 class="DistributionAttributes__title">
        {{ $t("action.bar.attribute-selection.header") }}
      </h3>
      <div class="DistributionAttributes__icon">
        <NovaIcon :name="open ? 'chevron-up' : 'chevron-down'" :size="12" />
      </div>
    </div>

    <div v-show="open" class="DistributionAttributes__container">
      <div ref="component" data-testid="distribution-attributes-selection">
        <DistributionAttributeSelect
          :readonly="readonly"
          :options="curationOptions"
          :selected="attributeValues.curationLevel"
          :label="$t('experience.attributes.curation_level.title')"
          :placeholder="$t('experience.attributes.curation_level.placeholder')"
          test-id="distribution-attribute-select-curation-level"
          @update:selected-attribute="setCurationLevel"
        />
        <DistributionAttributeSelect
          :readonly="readonly"
          :options="priorityOptions"
          :selected="attributeValues.priority"
          :label="$t('experience.attributes.priority.title')"
          :placeholder="$t('experience.attributes.priority.placeholder')"
          test-id="distribution-attribute-select-priority"
          @update:selected-attribute="setPriority"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDistributionAttributes } from "@/features/experience-shared/composables/useDistributionAttributes";
import DistributionAttributeSelect from "@/features/experience-shared/components/DistributionAttributeSelect.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

interface DistributionAttributesProps {
  readonly?: boolean;
}

defineProps<DistributionAttributesProps>();

const { attributeValues, curationOptions, priorityOptions, setCurationLevel, setPriority } =
  useDistributionAttributes();

const open = ref(true);

const toggleCollapse = () => {
  open.value = !open.value;
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.DistributionAttributes {
  padding-bottom: rem(16);
  border-bottom: 1px solid var(--color-grey-90);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    margin-bottom: rem(8);
  }

  &__title {
    @include font-bold(12);
  }

  &__icon {
    display: flex;
    align-items: center;
  }

  &__container {
    padding: rem(10) rem(10) 0;
    border: 1px solid var(--color-neutral-60);
    border-radius: var(--border-radius-default);
  }
}
</style>
