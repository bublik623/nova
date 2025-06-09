<template>
  <div
    v-if="isVisible"
    :key="highlight.id"
    class="HighlightManagerRow"
    :disabled="disabled || null"
    :theme="theme || null"
    data-testid="highlights-manager-list-item"
    :class="{
      'HighlightManagerRow--isEditing': isEditing,
      'HighlightManagerRow--isLocked': !!locked,
    }"
  >
    <div class="HighlightManagerRow__content">
      <div v-if="!disabled && draggable" class="grip drag-handle" data-testid="nova-sortable-list-drag-handle">
        <NovaIcon name="grip-dots" :size="18" />
      </div>
      <div class="HighlightManagerRow__index" :class="{ 'HighlightManagerRow__index--disabled': disabled }">
        {{ index }}.
      </div>
      <slot>
        <template v-if="isEditing && !disabled">
          <div class="HighlightManagerRow__input">
            <NovaTextarea
              id="newValue"
              v-model="value"
              :rows="textareaRows"
              :disabled="disabled"
              :placeholder="$t('experience.highlights.creation.placeholder')"
            />
          </div>
        </template>
        <template v-else-if="editable">
          <div class="HighlightManagerRow__text" :class="{ added: isAdded, removed: isRemoved }">
            {{ highlight.name }}
          </div>
          <NovaButton
            v-if="!disabled"
            :disabled="locked"
            variant="underlined"
            size="xxs"
            class="HighlightManagerRow__edit"
            data-testid="highlights-manager-list-item-edit"
            @click="isEditing = true"
          >
            {{ $t("common.edit") }}
          </NovaButton>

          <NovaButtonIcon
            v-if="!disabled"
            class="HighlightManagerRow__delete"
            data-testid="highlights-manager-list-item-delete"
            name="close"
            :size="10"
            shape="square"
            @click="$emit('row:delete')"
          />
        </template>
        <template v-else>
          <div class="HighlightManagerRow__text" :class="{ added: isAdded, removed: isRemoved }">
            {{ highlight.name }}
          </div>
          <NovaButtonIcon
            v-if="!disabled"
            class="HighlightManagerRow__delete"
            data-testid="highlights-manager-list-item-delete"
            name="close"
            :size="10"
            shape="square"
            @click="$emit('row:delete')"
          />
        </template>
      </slot>
    </div>

    <div v-if="isEditing" class="HighlightManagerRow__input-controls">
      <NovaButton
        v-if="!disabled"
        class="HighlightManagerRow__save ml-2"
        :disabled="!!!value"
        variant="underlined"
        size="xxs"
        @click="(isEditing = false), $emit('row:update', value)"
      >
        {{ $t("common.save") }}
      </NovaButton>
      <NovaButton
        v-if="!disabled"
        class="HighlightManagerRow__save ml-2"
        :disabled="!!!value"
        variant="underlined"
        size="xxs"
        @click="(isEditing = false), (value = highlight.name)"
      >
        {{ $t("common.cancel") }}
      </NovaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { GenericHighlight } from "@/types/Highlights";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaTextarea from "@/ui-kit/NovaTextarea/NovaTextarea.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

export interface Props {
  highlight: GenericHighlight;
  editable?: boolean;
  disabled?: boolean;
  locked?: boolean;
  draggable?: boolean;
  index: number;
  addedItems?: GenericHighlight[];
  removedItems?: GenericHighlight[];
  theme: "primary" | "secondary" | "disabled";
}

const props = withDefaults(defineProps<Props>(), {
  draggable: true,
  addedItems: () => [],
  removedItems: () => [],
});

const emits = defineEmits<{
  (e: "row:delete"): void;
  (e: "row:update", value: string): void;
  (e: "row:is-editing", value: boolean): void;
}>();

const value = ref<string>(props.highlight.name);
const isEditing = ref(false);
const isVisible = computed(() => props.highlight.action !== "DELETE");

const isAdded = computed(() => props.addedItems?.some((item) => item.name === props.highlight.name));
const isRemoved = computed(() => props.removedItems?.some((item) => item.name === props.highlight.name));

watch(isEditing, () => {
  emits("row:is-editing", isEditing.value);
});

// Returns an higher text area depending on the input length
const textareaRows = computed(() => {
  if (value.value.length < 30) {
    return 1;
  } else if (value.value.length < 70) {
    return 2;
  } else {
    return 3;
  }
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.HighlightManagerRow {
  --text-color: var(--color-text-100);
  --index-text-color: var(--text-color)

  color: var(--text-color);
  @include font-semibold(14);

  &__content {
    padding: rem(2) 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 42px;
  }

  &__index {
    margin-right: rem(8);
    min-width: 20px;
    min-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 10px;
    text-align: center;
    color: var(--index-text-color);
    background-color: var(--index-background-color);
    @include font-bold(12);

    &--disabled{
      color:var(--color-text-70);
      background: var(--color-neutral-40);
    }
  }

  &__input {
    width: 100%;
    position: relative;
  }

  &__input-controls {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding-top: rem(4);
  }

  &--isEditing {
    background-color: var(--color-grey-80);
    padding: rem(8);
    padding-left: 0;
  }

  &--isLocked {
    .grip {
      cursor: not-allowed;

      svg {
        color: var(--color-text-70);
      }

      &:hover {
        background-color: transparent;
      }
    }
  }

  /* stylelint-disable-next-line no-descending-specificity */
  .grip {
    width: 20px;
    height: 18px;
    border-radius: var(--border-radius-xs);
    cursor: move;
    margin-right: rem(4);
    transform: rotate(90deg);

    &:hover {
      background-color: var(--color-primary-10);
    }
  }

  &__text {
    margin-right: auto;
    @include font-regular(14);
  }

  &[disabled] {
    --text-color: var(--color-text-70);
    --index-background-color: var(--color-secondary-10);
  }

  &[theme="primary"] {
    --index-background-color: var(--color-primary-10);
  }

  &[theme="secondary"] {
    --index-background-color: var(--color-secondary-30);
  }

  &[theme="disabled"] {
    --index-text-color: var(--color-text-70)
  }
}

.added {
  background: var(--color-success-10);
  color: var(--color-success-100);
  text-decoration: underline;
}

.removed {
  background: var(--color-error-90);
  color: var(--color-error-100);
  text-decoration: line-through;
}
</style>
