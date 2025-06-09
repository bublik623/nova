<template>
  <div class="ModalDistributionAttributes">
    <div>
      <div class="ModalDistributionAttributes__heading">
        <h3 class="ModalDistributionAttributes__title">{{ $t("experience.modal.attributes.title") }}</h3>
        <h6 class="ModalDistributionAttributes__description">{{ $t("experience.modal.attributes.description") }}</h6>
      </div>
      <div class="ModalDistributionAttributes__dropdown-container">
        <DistributionAttributeSelect
          :options="curationOptions"
          :selected="attributeValues.curationLevel"
          :label="$t('experience.attributes.curation_level.title')"
          :placeholder="$t('experience.attributes.curation_level.placeholder')"
          test-id="modal-distribution-attribute-curation-level"
          @update:selected-attribute="(value) => setCurationLevel(value)"
        />
        <DistributionAttributeSelect
          :options="priorityOptions"
          :selected="attributeValues.priority"
          :label="$t('experience.attributes.priority.title')"
          :placeholder="$t('experience.attributes.priority.placeholder')"
          test-id="modal-distribution-attribute-priority"
          @update:selected-attribute="(value) => setPriority(value)"
        />
      </div>
      <div class="ModalDistributionAttributes__actions">
        <NovaButton variant="underlined" data-testid="modal-distribution-cancel" @click="$emit('cancel')">{{
          $t("common.cancel")
        }}</NovaButton>
        <NovaButton :disabled="isDisabled" data-testid="modal-distribution-submit" @click="$emit('confirm')">{{
          $t("common.submit")
        }}</NovaButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import DistributionAttributeSelect from "@/features/experience-shared/components/DistributionAttributeSelect.vue";
import { useDistributionAttributes } from "@/features/experience-shared/composables/useDistributionAttributes";
import { UseAsyncModalEvents } from "@/features/core-shared/composables/useAsyncModal";

type Emits = UseAsyncModalEvents;
defineEmits<Emits>();

const { attributeValues, curationOptions, priorityOptions, setPriority, setCurationLevel } =
  useDistributionAttributes();

const isDisabled = computed(() => {
  return !attributeValues.value.curationLevel || attributeValues.value.priority === undefined;
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.ModalDistributionAttributes {
  width: rem(550);
  height: rem(200);
  padding: rem(18) rem(18) rem(10);

  &__dropdown-container {
    display: flex;
    flex-direction: row;
    gap: rem(12);
  }

  &__heading {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    margin-bottom: rem(8);
    @include font-bold(18);
  }

  &__description {
    margin-bottom: rem(16);
    @include font-regular(14);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: rem(10);
    gap: rem(10);
  }
}
</style>
