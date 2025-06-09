<template>
  <div class="ActionBar" data-testid="document-action-bar">
    <div class="ActionBar__menu">
      <NovaButtonIcon
        v-if="slots.actions"
        name="grid"
        :selected="selectedSection === 'ACTIONS' && show"
        data-testid="document-action-bar-actions-btn"
        theme="dark"
        @click="handleSelectSection('ACTIONS')"
      />
      <NovaButtonIcon
        v-if="slots.history"
        name="history"
        :selected="selectedSection === 'HISTORY' && show"
        data-testid="document-action-bar-history-btn"
        theme="dark"
        @click="handleSelectSection('HISTORY')"
      />
    </div>

    <div v-show="show || isBigDesktop" class="ActionBar__content" data-testid="document-action-bar-content">
      <div class="ActionBar__header">
        <h2 class="ActionBar__title">
          {{ $t(`action.bar.header.title.${selectedSection.toLowerCase()}`) }}
        </h2>

        <div v-if="!isBigDesktop" class="ActionBar__icon" data-testid="document-action-bar-close" @click="show = !show">
          <NovaIcon name="close" :size="12" />
        </div>
      </div>

      <div v-show="selectedSection === 'ACTIONS'" class="overflow-y-auto">
        <div class="ActionBar__body" data-testid="document-action-bar-actions">
          <slot name="actions"></slot>
        </div>
      </div>

      <div v-show="selectedSection === 'HISTORY'" class="ActionBar__history" data-testid="document-action-bar-history">
        <slot name="history"></slot>
      </div>

      <div v-if="slots.actions_footer" class="ActionBar__footer">
        <slot name="actions_footer"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, useSlots } from "vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { useMediaQuery } from "@/composables/useMediaQuery";

interface Props {
  initialSection?: ActionBarSection;
}

type ActionBarSection = "ACTIONS" | "HISTORY";

const { isBigDesktop } = useMediaQuery();
const slots = useSlots();
const props = defineProps<Props>();

const show = ref(true);
const selectedSection = ref<ActionBarSection>(props.initialSection || "ACTIONS");

function handleSelectSection(section: ActionBarSection) {
  if (!show.value) {
    show.value = true;
  }
  selectedSection.value = section;
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.ActionBar {
  position: sticky;
  top: calc(var(--header-height) + var(--tab-navigation-height));
  display: flex;
  height: var(--window-height);
  background-color: white;
  border-left: 1px solid var(--color-grey-90);
  transition: transform 0.2s ease-in-out;

  &__menu {
    padding-top: rem(4px);
    width: rem(40px);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: rem(10);
  }

  &__content {
    display: grid;
    grid-template-rows: auto 1fr auto;
    border-left: 1px solid var(--color-grey-90);
    width: rem(232);
  }

  &__header {
    padding: rem(12);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-grey-90);
  }

  &__title {
    color: var(--color-text-80);

    @include font-semibold(14);
  }

  &__icon {
    cursor: pointer;
    padding: rem(2);

    &:hover {
      opacity: 0.7;
    }
  }

  &__body {
    padding: 0 rem(12);
  }

  &__history {
    overflow-y: hidden;
  }

  &__footer {
    padding: rem(5);
    border-top: var(--border-default);
    display: flex;
    justify-content: center;
  }
}
@include start-from(desktop-md) {
  .ActionBar {
    &__menu {
      width: rem(48px);
    }

    &__content {
      width: rem(240px);
    }
  }
}
@include start-from(desktop-lg) {
  .ActionBar {
    &__menu {
      width: rem(64px);
    }

    &__content {
      width: rem(256px);
    }
  }
}
</style>
