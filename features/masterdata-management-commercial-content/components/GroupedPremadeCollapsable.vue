<template>
  <NovaCollapse
    :active="to === $route.path"
    :model-value="open"
    size="no-limit"
    :class="!!anItemIsSelected ? 'border-blue' : ''"
  >
    <template #title>
      <div class="GroupedPremade__head">
        <NuxtLink class="GroupedPremade__title" :to="to" @click.stop>
          {{ name }}
        </NuxtLink>

        <p class="GroupedPremade__subtitle">
          {{ options.length + " " + $t("common.items") }}
        </p>
      </div>
    </template>
    <template #default>
      <ul class="GroupedPremade__list">
        <li v-for="item in options" :key="item.id" class="GroupedPremade__list-item">
          <PremadeListItem :item="item" :to="itemRoute(item.code)" :selected="isCurrentItem(item)" />
        </li>
      </ul>
    </template>
  </NovaCollapse>
</template>

<script setup lang="ts">
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import PremadeListItem from "./PremadeListItem.vue";
import { ExperienceMasterDataItem } from "@/composables/useExperienceMasterDataApi";
const route = useRoute();

const props = defineProps<{
  name?: string;
  options: ExperienceMasterDataItem[];
  to?: string;
  open: boolean;
}>();

const anItemIsSelected = computed(() => props.options.find((el) => itemRoute(el.code) === route.path));

function isCurrentItem(item: ExperienceMasterDataItem) {
  return item.code === route.params.code;
}

function itemRoute(code: string) {
  return `${props.to}/${code}`;
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.GroupedPremade {
  &__head {
    padding: rem(10) rem(0);
  }

  &__title {
    @include font-semibold(14);

    &:hover {
      text-decoration: underline;
    }
  }

  &__subtitle {
    @include font-regular(14);
  }

  &__list {
    .PremadeListItem {
      width: calc(100% + rem(2));
      position: relative;
      left: rem(-1);
      margin-bottom: rem(-1);
    }

    li:last-child .PremadeListItem {
      border-radius: 0 0 var(--border-radius-default) var(--border-radius-default);
      border-bottom-color: transparent;
      height: calc(100% + rem(2));
      margin-top: rem(-1);

      &[selected] {
        border-bottom-color: var(--color-primary-100);
      }
    }

    li:first-child:not(:last-child) > .PremadeListItem {
      margin-bottom: rem(-2);
      top: rem(-1);
    }
  }
}

.border-blue {
  border: 1px solid var(--color-primary-100);
}
</style>
