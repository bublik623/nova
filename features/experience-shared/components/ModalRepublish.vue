<template>
  <div class="RepublishModal" data-testid="modal-republish">
    <NovaIcon class="RepublishModal__icon" name="warning-solid" :size="48" />
    <h2 class="RepublishModal__title">{{ $t("experience.modal.republish.title") }}</h2>
    <div class="RepublishModal__description">
      <p>{{ $t("experience.modal.republish.description") }}</p>
      <p class="font-bold">
        {{ $t("experience.modal.republish.prompt") }}
      </p>
    </div>
    <div class="RepublishModal__actions">
      <NovaButton
        data-testid="modal-action-submit"
        size="sm"
        variant="underlined"
        @click="onSubmit(() => $emit('confirm'))"
      >
        {{ $t("experience.modal.republish.submit") }}
      </NovaButton>
      <NovaButton data-testid="modal-action-publish" size="sm" @click="onPublish(() => $emit('confirm'))">
        {{ $t("experience.modal.republish.publish") }}
      </NovaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { UseAsyncModalEvents } from "@/features/core-shared/composables/useAsyncModal";

type Emits = UseAsyncModalEvents;
type Props = {
  onPublish: (closeModal: CallableFunction) => void;
  onSubmit: (closeModal: CallableFunction) => void;
};

defineEmits<Emits>();
defineProps<Props>();
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.font-bold {
  @include font-bold(14);
}

.RepublishModal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: rem(410);
  padding: rem(24);

  &__title {
    margin-top: rem(8);
    font-weight: bold;
    color: var(--color-text-100);
    @include font-bold(18);
  }

  &__description {
    margin-top: rem(16);
    line-height: rem(20);
    text-align: center;
    color: var(--color-text-90);
    @include font-regular(14);
  }

  &__actions {
    margin-top: rem(20);
    display: flex;
    gap: rem(20);
    justify-content: space-between;
  }
}
</style>
