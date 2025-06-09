<template>
  <div class="PremadeListItem" :selected="selected || null">
    <span class="PremadeListItem__name">
      <NuxtLink :to="to" :data-testid="`premade-list-item-${item.code}`">
        {{ item.name }}
      </NuxtLink>
    </span>
  </div>
</template>

<script setup lang="ts">
import { Highlights, ImportantInformation, Included } from "@/types/generated/ExperienceMasterDataApi";
interface Props {
  item: Highlights | Included | ImportantInformation;
  to: string;
  selected?: boolean;
}
defineProps<Props>();
</script>

<style lang="scss">
@import "@/assets/scss/utilities";

.PremadeListItem {
  padding: rem(12) rem(16);
  color: var(--color-text-100);
  border: 1px solid transparent;
  border-bottom-color: var(--color-neutral-60);

  @include font-regular(14);

  &[selected] {
    background: var(--color-primary-05);
    border: 1px solid var(--color-primary-100);
  }

  &__name:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}

a {
  color: inherit;
  text-decoration: inherit;
  word-wrap: break-word;
}
</style>
