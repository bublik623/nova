<template>
  <div
    class="SidebarSection"
    :open="open || null"
    :category-selected="category.selected || null"
    :is-disabled="category.disabled || null"
    :data-testid="`sidebar-section-wrapper-${category.id}`"
  >
    <button
      class="SidebarSection__title"
      :no-dropdown="!category.dropdown || null"
      data-testid="sidebar-section-button"
      @click.self="category.dropdown && $emit('click:toggle', category.id)"
    >
      <div
        class="circle"
        :required="(category.required && !category.disabled) || null"
        :has-change="(category.hasChange && !category.disabled) || null"
        :completed="(category.completed && !category.disabled) || null"
        :selected="category.selected || null"
        data-testid="sidebar-section-circle-category"
      >
        <NovaIcon v-if="category.hasChange && !category.disabled" name="check" :size="9"></NovaIcon>
        <NovaIcon v-else-if="category.disabled" name="lock"></NovaIcon>
        <NovaIcon v-else-if="category.completed" name="check" :size="9"></NovaIcon>
        <NovaIcon v-else-if="!category.required" name="circle-dotted" :size="16"></NovaIcon>
      </div>

      <NuxtLink
        :to="!category.selected ? category.url : $route.fullPath"
        data-testid="sidebar-section-title"
        @click="!open && category.dropdown && $emit('click:toggle', category.id)"
      >
        <p class="ml-2">
          {{ $t(`experience.sidebar.${category.id}`) }}
        </p>
      </NuxtLink>
      <NovaIcon
        v-if="category.dropdown"
        name="chevron-down"
        class="SidebarSection__chevron"
        :open="open || null"
        :size="12"
        data-testid="sidebar-section-chevron"
      />
      <div
        v-show="category.dropdown"
        class="vertical-line title"
        :selected="indexItemSelected >= 0 || null"
        :open="open || null"
      ></div>
    </button>
    <ul v-if="open && category.dropdown" class="SidebarSection__list" data-testid="sidebar-section-list">
      <li v-for="(item, index) in category.fields" :key="item.id">
        <div
          v-if="index < category.fields.length - 1"
          class="vertical-line"
          :selected="index < indexItemSelected || null"
        ></div>
        <button
          class="SidebarSection__list-item"
          :selected="route.hash === `#${item.id}` || null"
          :data-testid="`sidebar-section-item-${item.id}`"
          @click="$router.push(`${category.url}#${item.id}`)"
        >
          <CurvedLineSvg class="curved-line" />

          <div
            class="circle"
            :has-change="item.hasChange"
            :selected="route.hash === `#${item.id}` || null"
            :completed="item.filled || null"
            data-testid="sidebar-section-circle-item"
            :required="item.required || null"
          >
            <span v-if="item.hasChange">
              <NovaIcon name="check" :size="9" />
            </span>
            <span v-else-if="item.filled">
              <NovaIcon name="check" :size="9"></NovaIcon>
            </span>
            <span v-else-if="!item.required">
              <NovaIcon name="circle-dotted" :size="16" />
            </span>
          </div>
          <p class="ml-2">
            {{ item.title }}
          </p>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CurvedLineSvg from "@/assets/svg/sidebar-section-curved-line.svg";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { MappedCategory } from "@/types/DocumentSidebar";

export interface Props {
  category: MappedCategory;
  open: boolean;
}
interface Events {
  (e: "click:toggle", categoryId: string): void;
}
defineEmits<Events>();
const props = defineProps<Props>();
const route = useRoute();

// return the index of the selected item, if no item is selected returns -1
const indexItemSelected = computed(() => {
  return props.category?.fields?.findIndex((item) => `#${item.id}` === route.hash);
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

a {
  text-decoration: none;
  color: inherit;
}

.vertical-line {
  position: absolute;
  height: rem(38);
  left: rem(16);
  border-left: 1px solid var(--color-grey-100);
  z-index: 2;

  &.title {
    left: rem(15);
    display: none;
  }

  &.title[open] {
    display: block;
    height: rem(14);
    top: rem(27);
  }

  &[selected] {
    border-left: 1px solid var(--color-primary-100);
    z-index: 3;
  }
}

.curved-line {
  color: var(--color-grey-100);
  position: absolute;
  left: rem(14);
  top: rem(1);
}

.SidebarSection {
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-default);
  color: var(--color-text-100);
  cursor: pointer;
  overflow: hidden;

  &:hover:not([is-disabled]) {
    background: var(--color-primary-05);
    border: 1px solid var(--color-text-80);

    &[open] {
      background-color: initial;
    }
  }

  &__chevron {
    user-select: none;
    margin-left: auto;
    transition: transform 0.2s;
    pointer-events: none;

    &[open] {
      transform: rotate(180deg);
    }
  }

  &__title {
    @include font-semibold(14);

    display: flex;
    align-items: center;
    padding: 0 rem(8);
    border: none;
    background: none;
    width: 100%;
    height: rem(39);
    text-align: start;
    cursor: pointer;
    position: relative;

    &[no-dropdown] {
      cursor: initial;
    }

    &:not([is-disabled]) {
      &:hover {
        background: var(--color-primary-10);
      }

      a:hover {
        text-decoration: underline;
        color: var(--color-primary-100);
      }
    }
  }

  &[is-disabled] {
    background: var(--color-grey-70);
    cursor: not-allowed;

    .SidebarSection__title {
      pointer-events: none;
    }
  }

  &__list {
    @include font-regular(14);

    &-item {
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      height: rem(34);
      padding-left: rem(25);

      p {
        text-align: start;
      }

      &:hover {
        background: var(--color-primary-10);
      }

      &[selected] {
        .curved-line {
          color: var(--color-primary-100);
          z-index: 3;
        }
      }
    }
  }

  &[category-selected] {
    border-color: var(--color-primary-100);

    &:hover {
      border-color: var(--color-primary-100);
    }
  }
}
</style>
