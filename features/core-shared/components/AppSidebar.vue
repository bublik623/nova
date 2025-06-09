<template>
  <div class="AppSidebar__container" data-testid="app-sidebar-container" :open="show || null">
    <nav class="AppSidebar">
      <ul class="AppSidebar__ul">
        <li v-for="element in navElements" :key="element.title" class="AppSidebar__li">
          <NuxtLink class="AppSidebar__anchor" :to="unref(element.path)">
            <NovaButtonIcon
              :id="getElementId(element)"
              theme="light"
              :selected="$route.path === element.path"
              :name="element.icon"
              class="AppSidebar__icon"
              data-testid="app-sidebar-button-icon"
            />
            <label v-show="show" :for="getElementId(element)" class="AppSidebar__text" data-testid="app-sidebar-text">
              {{ element.title }}
            </label>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="AppSidebar__footer" :open="show || null">
      <NovaButton
        v-show="show"
        class="AppSidebar__footer-btn mr-2 AppSidebar__collapse-btn"
        variant="action"
        size="xxs"
        theme="dark"
        data-testid="app-sidebar-collapse-icon-opened"
        @click="$emit('click:collapsing')"
      >
        <NovaIcon
          class="AppSidebar__collapse-icon"
          name="chevrons-left"
          :size="18"
          :style="{
            margin: '-2px',
          }"
        /><span class="ml-1">
          {{ $t("sidebar.button.close") }}
        </span>
      </NovaButton>

      <NovaButton
        v-show="!show"
        variant="action"
        size="xxs"
        theme="dark"
        class="AppSidebar__footer-btn"
        data-testid="app-sidebar-collapse-icon-closed"
        @click="$emit('click:collapsing')"
      >
        <NovaIcon
          class="AppSidebar__collapse-icon"
          name="chevrons-right"
          :size="18"
          :style="{
            margin: '-2px',
          }"
        />
      </NovaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { unref, Ref } from "vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { RouteLocationResolvedGeneric } from "vue-router";

export interface NavElement {
  icon: Icon;
  title: string;
  path: string | Ref<string> | RouteLocationResolvedGeneric;
}

interface Props {
  show: boolean;
  navElements: NavElement[];
}

interface Events {
  (e: "click:collapsing"): void;
}

defineProps<Props>();
defineEmits<Events>();

const getElementId = (element: NavElement) => {
  return `sidebar-${element.title.toLowerCase()}`;
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.AppSidebar {
  &__container {
    position: sticky;
    top: var(--header-height);
    background: var(--color-text-100);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: calc(100vh - var(--header-height));
    width: rem(48px);

    &[open] {
      width: rem(136px);

      .AppSidebar__collapse-btn {
        @include font-semibold(12);
      }
    }
  }

  &__ul {
    height: 100%;
    padding-top: rem(14px);
    padding-left: rem(6px);
  }

  &__text {
    @include font-bold(12);

    margin-left: rem(10);
    white-space: nowrap;
    transform: translateX(-5px);
    transition: transform 0.2s ease-in-out;
    cursor: pointer;
  }

  &__anchor {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--color-white);
  }

  &__btn {
    width: fit-content;
    margin: 0 auto;
    background: none;
    color: var(--color-white);
    border: none;
    cursor: pointer;
  }

  &__footer {
    padding: rem(2px);
    display: flex;
    justify-content: center;
    margin-top: auto;
    margin-bottom: rem(10);

    &[open] {
      justify-content: flex-end;
    }
  }

  &__icon {
    margin: rem(2px);

    &:hover + .AppSidebar__text {
      transform: translateX(0);
    }
  }
}

@include start-from(desktop-md) {
  .AppSidebar {
    &__container {
      width: rem(56px);

      &[open] {
        width: rem(144px);
      }
    }

    &__ul {
      padding-left: rem(10px);
    }
  }
}

@include start-from(desktop-lg) {
  .AppSidebar {
    &__container {
      width: rem(64px);

      &[open] {
        width: rem(152px);
      }
    }

    &__ul {
      padding-left: rem(14px);
    }
  }
}
</style>
