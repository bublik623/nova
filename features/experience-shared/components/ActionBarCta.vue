<template>
  <section class="ActionBarCta">
    <h3 class="ActionBarCta__heading">
      {{ title }}
    </h3>

    <slot name="additional-info"></slot>

    <div class="ActionBarCta__action">
      <NovaButton
        size="sm"
        full-width
        :variant="ctaType"
        :theme="ctaTheme"
        :disabled="!ctaEnabled"
        :loading="ctaLoading"
        :data-testid="`document-action-bar-${id}`"
        @click="$emit('click:action')"
      >
        <slot name="ctaText">{{ ctaText }}</slot></NovaButton
      >
    </div>
  </section>
</template>

<script lang="ts" setup>
import NovaButton, { ButtonTheme, ButtonVariant } from "@/ui-kit/NovaButton/NovaButton.vue";

export interface Props {
  id: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaType?: ButtonVariant;
  ctaTheme?: ButtonTheme;
  ctaEnabled?: boolean;
  ctaLoading?: boolean;
}
interface Events {
  (e: "click:action"): void;
}

defineProps<Props>();
defineEmits<Events>();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.ActionBarCta {
  padding: rem(16) 0 rem(16);
  border-bottom: 1px solid var(--color-grey-90);

  &__heading {
    margin-top: rem(2);

    @include font-bold(12);
  }

  &__text {
    padding-top: rem(8);
    color: var(--color-text-90);

    @include font-regular(12);
  }

  &__action {
    padding-top: rem(16);
  }
}
</style>
