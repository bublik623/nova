<template>
  <div class="TabNavigation" data-testid="document-tab-navigation">
    <button
      v-for="tab in props.tabs"
      :key="tab.label"
      class="TabNavigation__item"
      :selected="tab === activeTab"
      :data-testid="`document-tab-navigation-link`"
    >
      <NuxtLink class="TabNavigation__text" :to="tab.path" :data-testid="`document-tab-navigation-nuxt-link`">
        <span>{{ $t(tab.label) || "..." }}</span>
      </NuxtLink>

      <div
        :selected="tab === activeTab"
        class="TabNavigation__icon"
        data-testid="document-tab-navigation-close"
        @click="emits('tabClose', tab)"
      >
        <NovaIcon name="close" :size="10" />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { DocumentTab } from "@/stores/document-tabs";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

export interface DocumentTabProps {
  tabs: DocumentTab[];
  activeTab?: DocumentTab;
}

interface DocumentTabEvents {
  (e: "tabClose", tab: DocumentTab): void;
}

const props = defineProps<DocumentTabProps>();
const emits = defineEmits<DocumentTabEvents>();
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.TabNavigation {
  position: sticky;
  top: var(--header-height);
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--color-grey-70);
  border-bottom: 4px solid var(--color-primary-10);
  z-index: var(--z-index-document-tab-navigation);
  height: var(--tab-navigation-height);

  &__item {
    all: initial;
    position: relative;
    display: flex;
    flex-shrink: 2;
    flex-grow: 1;
    justify-content: space-between;
    align-items: center;
    max-width: rem(170);
    height: rem(32);
    background: #fff;
    color: var(--color-text-90);
    cursor: pointer;
    overflow: hidden;
    border-right: 1px solid var(--color-grey-90);

    @include font-semibold(12);

    &[selected="true"] {
      color: var(--color-text-100);
      background-color: var(--color-primary-10);

      &:hover {
        background-color: var(--color-primary-30);
      }
    }

    &:hover {
      background-color: var(--color-primary-10);
    }
  }

  &__text {
    position: absolute;
    width: 80%;
    height: 100%;
    overflow: hidden;
    padding-left: 8px;
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;

    span {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  &__icon {
    border-radius: 4px;
    position: absolute;
    right: rem(6);
    width: rem(20);
    height: rem(20);
    display: flex;
    justify-content: center;
    align-items: center;

    &[selected]:hover {
      background: rgba(255 255 255 / 50%);
    }

    &:hover {
      background: var(--color-primary-10);
    }
  }

  &__debug {
    margin: 0 8px;

    .IconButton {
      height: 30px;
      width: 30px;
    }
  }

  .ExitModal {
    padding: rem(24px);
    width: rem(311px);

    &__title {
      @include font-bold(16);

      color: var(--color-text-100);
    }

    &__description {
      @include font-semibold(12);

      margin-top: 4px;
    }

    &__buttons {
      margin-top: rem(16px);
      display: flex;
      justify-content: space-evenly;

      button {
        width: rem(109px);
      }
    }
  }
}
</style>
