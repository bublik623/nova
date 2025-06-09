<template>
  <draggable
    tag="ul"
    :list="list"
    class="NovaSortableList"
    :class="`NovaSortableList--${layout}`"
    chosen-class="NovaSortableList__ghost-img"
    ghost-class="NovaSortableList__dragging"
    handle=".drag-handle"
    :animation="150"
    item-key="id"
    data-testid="nova-sortable-list"
    :disabled="disabled || locked || null"
    @sort="updateListSorting($event.oldIndex, $event.newIndex)"
  >
    <template #item="{ element }: { element: ManageableItem }">
      <li class="item" data-testid="nova-sortable-list-item">
        <div
          v-if="!disabled && !options?.disableDragHandler"
          class="grip drag-handle"
          data-testid="nova-sortable-list-drag-handle"
        >
          <NovaIcon name="grip-dots" :size="18" />
        </div>
        <slot :item="element"></slot>
      </li>
    </template>
  </draggable>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { ManageableItem } from "@/types/ManageableItems";

export interface Props {
  modelValue: ManageableItem[];
  layout: "grid" | "list";
  gridColumns?: number;
  disabled?: boolean;
  locked?: boolean;
  options?: {
    // disables the default drag handler
    // add `.drag-handle` to any slot element
    // to add a custom handler
    disableDragHandler?: boolean;
  };
}

interface Events {
  (e: "update:modelValue", items: ManageableItem[]): void;
}

const emit = defineEmits<Events>();
const props = withDefaults(defineProps<Props>(), {
  gridColumns: 4,
  options: undefined,
});

const list = computed(() =>
  props.modelValue.map((item, index) => ({
    ...item,
    visualization_order: index + 1,
  }))
);

const updateListSorting = (oldIndex: number, newIndex: number) => {
  const movedItem = props.modelValue.find((_, index) => index === oldIndex);
  const remainingItems = props.modelValue.filter((_, index) => index !== oldIndex);

  if (!movedItem) {
    throw new Error("Error while sorting the list. Item not found");
  }

  const reorderedItems = [...remainingItems.slice(0, newIndex), movedItem, ...remainingItems.slice(newIndex)];

  emit(
    "update:modelValue",
    reorderedItems.map((item, idx) => ({
      ...item,
      visualization_order: idx + 1,
    }))
  );
};

const gridColumnsValue = `repeat(${props.gridColumns}, 1fr)`;
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaSortableList {
  // we need to use the BEM modifiers here, as the draggable
  // component does not accept a custom attribute
  &--grid {
    display: grid;
    gap: 16px;
    grid-template-columns: v-bind(gridColumnsValue);

    .grip {
      position: absolute;
      bottom: 5px;
      left: 44%;
    }
  }

  &--list {
    .grip {
      margin-right: rem(8);
      transform: rotate(90deg);
    }

    .item {
      display: flex;
      align-items: center;
    }
  }

  .grip {
    width: 20px;
    height: 18px;
    border-radius: var(--border-radius-xs);
    cursor: move;

    &:hover {
      background-color: var(--color-primary-10);
    }
  }

  .item {
    position: relative;
    border-radius: var(--border-radius-xs);
  }

  &__dragging {
    &::after {
      content: "";
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: var(--color-grey-80);
      border: 1px dashed var(--color-grey-100);
      border-radius: var(--border-radius-xs);
    }
  }

  &__ghost-img {
    opacity: 1;
    box-shadow: var(--box-shadow-popover);
  }

  ul,
  li {
    margin: 0;
    padding: 0;
    text-indent: 0;
    list-style-type: 0;
  }
}
</style>
