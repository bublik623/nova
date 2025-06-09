<template>
  <section :id="id">
    <form :aria-required="required" class="FormSection" data-testid="document-form-section" @submit.prevent>
      <NovaFieldHeading
        :title="$t(`experience.${id}.title`)"
        :description="description"
        :required="required"
      ></NovaFieldHeading>
      <div v-if="examples" class="FormSection__examples">
        <p>{{ $t("common.examples") }}:</p>
        <ul>
          <li v-for="example in examples" :key="example" data-testid="form-example">
            {{ example }}
          </li>
        </ul>
      </div>
      <div class="mt-4" :style="{ maxWidth: `${slotMaxWidth}px` || '100%' }" data-testid="form-slot-container">
        <slot />
      </div>
    </form>
  </section>
</template>

<script lang="ts" setup>
import NovaFieldHeading from "@/ui-kit/NovaFieldHeading/NovaFieldHeading.vue";

export interface Props {
  id: string;
  required?: boolean;
  showDescription?: boolean;
  examples?: string[];
  slotMaxWidth?: number;
}

const props = withDefaults(defineProps<Props>(), { showDescription: true });
const { $t } = useNuxtApp();
const description = computed(() => {
  return props.showDescription ? $t(`experience.${props.id}.description`) : undefined;
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.FormSection {
  &__examples {
    margin-bottom: rem(15);
    color: var(--color-text-90);
    @include font-regular(12);
  }

  &__examples > ul {
    list-style: circle;
    padding-left: rem(20);
  }
}
</style>
