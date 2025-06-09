<template>
  <NovaModal :show="showModal">
    <div class="NovaModalConfirm">
      <p v-if="title" class="NovaModalConfirm__title">{{ title }}</p>
      <p class="NovaModalConfirm__description">
        <UtilsRenderHtml :string="description" />
      </p>
      <div class="NovaModalConfirm__buttons">
        <NovaButton
          data-testid="modal-leave-btn"
          variant="underlined"
          size="sm"
          @click="
            async () => {
              loading = true;
              props.cancelCallback();
              loading = false;
            }
          "
        >
          {{ ctaCancelText }}</NovaButton
        >
        <NovaButton
          :loading="loading"
          size="sm"
          data-testid="modal-save-btn"
          @click="
            async () => {
              loading = true;
              await props.confirmCallback();
              loading = false;
            }
          "
          >{{ ctaConfirmText }}</NovaButton
        >
      </div>
    </div>
  </NovaModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import UtilsRenderHtml from "@/components/Utils/RenderHtml/RenderHtml.vue";

export interface NovaModalConfirmProps {
  title?: string;
  description: string;
  ctaConfirmText: string;
  ctaCancelText: string;
  showModal: boolean;
  confirmCallback: () => Promise<void>;
  cancelCallback: () => void;
}

const props = defineProps<NovaModalConfirmProps>();

const loading = ref(false);
</script>

<style lang="scss">
@import "@/assets/scss/utilities";

.NovaModalConfirm {
  padding: rem(24px);
  width: rem(320px);

  &__title {
    @include font-bold(16);

    color: var(--color-text-100);
  }

  &__description {
    @include font-regular(12);

    margin-top: 4px;
  }

  &__buttons {
    margin-top: rem(14px);
    display: flex;
    justify-content: space-between;
    gap: rem(8px);

    button {
      white-space: nowrap;
    }
  }
}
</style>
