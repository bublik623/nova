<template>
  <NovaSortableList
    v-slot="{ item: highlight }"
    :model-value="sortableItems"
    layout="list"
    :disabled="sortableItems.length <= 1 || disabled"
    :options="{
      disableDragHandler: true,
    }"
    :locked="locked"
    class="EditableList mt-2"
    data-testid="highlights-wrapper-custom-list"
    @update:model-value="(items) => handleListReorder(items)"
  >
    <ListRow
      data-testid="highlights-wrapper-list-row"
      class="ListItem"
      :added-items="addedItems"
      :removed-items="removedItems"
      :editable="editable"
      :disabled="disabled"
      :highlight="highlight"
      :index="highlight.visualization_order"
      :locked="locked"
      :theme="theme"
      @row:update="(value) => list.edit(highlight.id, value)"
      @row:delete="list.del(highlight.id)"
      @row:is-editing="(value) => (locked = value)"
    />
  </NovaSortableList>
</template>

<script setup lang="ts">
import { GenericHighlight } from "@/types/Highlights";
import NovaSortableList from "@/ui-kit/NovaSortableList/NovaSortableList.vue";
import ListRow from "./ListRow.vue";

export interface Props {
  modelValue: GenericHighlight[];
  disabled?: boolean;
  editable?: boolean;
  theme: "primary" | "secondary" | "disabled";
  removedItems?: GenericHighlight[];
  addedItems?: GenericHighlight[];
}

interface Events {
  (e: "update:modelValue", value: GenericHighlight[]): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const locked = ref(false);
const list = useManageableList();

const sortableItems = computed<GenericHighlight[]>(() =>
  props.modelValue
    .filter((item) => item.action !== "REMOVE" && item.action !== "DELETE")
    .map((item, index) => ({
      ...item,
      visualization_order: index + 1,
    }))
);

watch(list.items.value, () => emits("update:modelValue", list.items.value), {
  deep: true,
});

// We do not use the index to manage the array operation but instead a local ID.
// The index contains elements that must be tracked, but not displayed.
// The  displayableCustomItems index will not match the model.$list index.
function useManageableList() {
  const items = computed(() => props.modelValue);

  return {
    edit,
    del,
    items,
  };

  function edit(id: GenericHighlight["id"], name: string) {
    const index = items.value.findIndex((i) => i.id === id);

    items.value[index].name = name;
    // set the item to EDIT only if it's already created
    if (items.value[index].action !== "CREATE") {
      items.value[index].action = "EDIT";
    }
  }

  function del(id: GenericHighlight["id"]) {
    const index = items.value.findIndex((i) => i.id === id);

    // if the item has not yet been created,
    // we can just remove it from the array
    if (items.value[index].action === "CREATE") {
      items.value.splice(index, 1);
    } else if (items.value[index].id) {
      items.value[index].action = "DELETE";
    } else {
      items.value[index].action = "REMOVE";
    }
  }
}

function handleListReorder(items: GenericHighlight[]) {
  emits(
    "update:modelValue",
    items.map((item, index) => {
      return {
        ...item,
        visualization_order: index + 1,
        // On reorder we must emit a EDIT action, otherwise the new order is not updated in the BE
        action: item.action !== "NOOP" ? item.action : "EDIT",
      };
    })
  );
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.EditableList {
  :deep(.item) {
    border-bottom: 1px solid var(--border-default-color);
  }

  // the siblings selector (+) does not work with :deep
  :deep(.item):last-child {
    border-bottom: none;
  }
}

.ListItem {
  width: 100%;
}
</style>
