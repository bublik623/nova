<template>
  <NovaModal :show="isModalOpen" @click:on-overlay="isModalOpen = false">
    <div class="RequiredFieldsModal" data-testid="modal-required-fields">
      <NovaIcon class="RequiredFieldsModal__icon" name="warning-solid" :size="48" />
      <h2 class="RequiredFieldsModal__title">{{ $t("experience.modal.required_fields.title") }}</h2>
      <div class="RequiredFieldsModal__description">
        <p class="font-bold">{{ $t("experience.modal.required_fields.instruction.info") }}</p>
        <ul class="RequiredFieldsModal__list">
          <li class="RequiredFieldsModal__list-item">
            {{ $t("experience.modal.required_fields.instruction.add_title") }}
          </li>
          <li class="RequiredFieldsModal__list-item">
            {{ $t("experience.modal.required_fields.instruction.add_supplier_name") }}
          </li>
        </ul>
      </div>
      <NovaButton class="mt-5" data-testid="modal-action-ok" size="sm" @click="isModalOpen = false">
        {{ $t("common.modal.action.ok_i_understand") }}
      </NovaButton>
    </div>
  </NovaModal>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";
import { useVModel } from "@vueuse/core";

export type ModalRequiredFieldsProps = {
  modelValue: boolean;
};

type Emits = {
  "update:modelValue": [value: boolean];
};

const emit = defineEmits<Emits>();
const props = defineProps<ModalRequiredFieldsProps>();

const isModalOpen = useVModel(props, "modelValue", emit, { passive: true });
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.font-bold {
  @include font-bold(14);
}

.RequiredFieldsModal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: rem(400);
  padding: rem(24);

  &__title {
    margin-top: rem(8);
    font-weight: bold;
    @include font-bold(18);
  }

  &__description {
    margin-top: rem(16);
    line-height: rem(20);
    @include font-regular(14);
  }

  &__list {
    text-align: center;
    list-style-type: disc;
    list-style-position: inside;
  }

  &__list-item {
    color: var(--color-text-90);
  }
}
</style>
