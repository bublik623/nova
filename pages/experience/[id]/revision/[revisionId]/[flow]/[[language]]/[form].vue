<template>
  <RevisionFormHandler :flow="flow" :form="form" :language="language" />
</template>

<script setup lang="ts">
import RevisionFormHandler from "@/features/experience-revision/components/RevisionFormHandler.vue";

const route = useRoute();
const { flow, language, form } = route.params as Record<string, string>;
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.wrapper {
  display: grid;
  justify-items: start;
  grid-template-columns: auto 1fr auto;
}

.DocumentSidebar {
  &__header {
    padding: rem(25) 0;
  }

  &__title {
    @include font-semibold(14);

    color: var(--color-text-90);
  }
}
</style>
