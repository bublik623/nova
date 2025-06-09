<template>
  <div class="NovaFieldHeading">
    <div class="NovaFieldHeading__title" data-testid="field-heading-title">
      <p>{{ title }}</p>
      <span v-if="required" class="NovaFieldHeading__required">*</span>
    </div>
    <p v-if="description" data-testid="field-heading-description" class="NovaFieldHeading__description">
      {{ description }}
    </p>
  </div>
</template>
<script setup lang="ts">
export interface NovaFieldHeadingProps {
  title: string;
  description?: string;
  /**
   * Display a `required` badge right next to title
   */
  required?: boolean;
}

withDefaults(defineProps<NovaFieldHeadingProps>(), {
  description: undefined,
  required: false,
});
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaFieldHeading {
  &__title {
    margin-bottom: rem(8);
    display: flex;
    align-items: center;
    gap: rem(2);
    @include font-bold(16);
  }

  &__description {
    max-width: rem(730);
    color: var(--color-text-90);

    @include font-regular(14);
  }

  &__required {
    color: var(--color-error-110);
    font-size: rem(18);
  }
}
</style>
