<template>
  <div class="MasterDataSidebar">
    <ul v-for="[key, category] in Object.entries(categories)" :key="key" class="MasterDataSidebar__list">
      <li class="MasterDataSidebar__list-title">{{ generateTranslationKey(key) }}</li>
      <li
        v-for="field in category"
        :key="field.id"
        :selected="route.fullPath.includes(field.url) || null"
        class="MasterDataSidebar__list-item"
      >
        <NuxtLink :data-testid="`masterdata-management-sidebar-list-item-${field.id}`" :to="field.url">
          {{ generateTranslationKey(field.id) }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from "#app";

export interface Props {
  categories: Categories;
}

export type Categories = { [key: string]: { id: string; url: string }[] };

const route = useRoute();
const { $t } = useNuxtApp();

const generateTranslationKey = (id: string) => $t(`masterdata-management.sidebar-title.${id}`);

defineProps<Props>();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

a {
  color: inherit;
  text-decoration: none;
}

.MasterDataSidebar {
  height: calc(100vh - var(--header-height));
  width: rem(200);
  background: var(--color-text-100);

  &__list {
    color: var(--color-text-80);
    @include font-regular(12);

    padding-top: rem(24);

    &:first-of-type {
      padding-top: rem(20);
    }
  }

  &__list-title {
    padding: rem(8) rem(20);
  }

  &__list-item {
    color: var(--color-white);
    cursor: pointer;

    a {
      display: block;
      padding: rem(12) rem(20);
    }

    &[selected] {
      background: var(--color-white-02);
    }

    &:hover {
      background: var(--color-white-01);

      &[selected] {
        background: var(--color-white-04);
      }
    }
  }
}

@include start-from(desktop-md) {
  .MasterDataSidebar {
    width: rem(232);
  }
}

@include start-from(desktop-lg) {
  .MasterDataSidebar {
    width: rem(248);
  }
}
</style>
