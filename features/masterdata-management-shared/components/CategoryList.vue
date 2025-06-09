<template>
  <div class="CategoryList__action">
    <NovaCheckbox status="unchecked" value="ViewRequiredOnly" />
    <p class="ml-2">View requiring translation only</p>
  </div>
  <div class="CategoryList__list">
    <NovaCollapse
      v-for="(category, idx) in categories"
      :key="idx"
      size="no-limit"
      class="CategoryList mt-2"
      :model-value="idx === 0"
    >
      <template #title>
        <div class="CategoryList__head">
          {{ category.name }}
          <div class="CategoryList__subtitle mt-2">{{ category.items.length + " " + $t("common.items") }}</div>
        </div>
      </template>
      <div v-for="item in category.items" :key="item.id" class="CategoryList__item">
        {{ item.title }}
      </div>
    </NovaCollapse>
  </div>
</template>

<script setup lang="ts">
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";

interface Props {
  categories: { name: string; items: { title: string; id: string }[] }[];
}
defineProps<Props>();
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.CategoryList {
  &__list {
    height: 100%;
    overflow-x: hidden;
    margin-top: rem(8);
  }

  &:first-of-type {
    margin-top: 0;
  }

  &__action {
    border: 1px solid var(--color-neutral-60);
    border-radius: var(--border-radius-default);
    padding: rem(9) rem(16);
    display: flex;
    @include font-regular(14);
  }

  &__head {
    height: rem(64);
    padding: rem(12) 0;
    @include font-regular(14);
  }

  &__subtitle {
    color: var(--color-text-100);
    @include font-regular(12);
  }

  &__item {
    padding: rem(12) rem(16);
    @include font-regular(14);

    border-bottom: 1px solid var(--color-neutral-60);

    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }

    &:last-of-type {
      border: none;
    }
  }
}
</style>
