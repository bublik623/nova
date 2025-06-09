<template>
  <div v-if="!disabled" class="CustomHighlights__newHighlight mt-3" data-testid="custom-value-input">
    <NovaInputText
      id="newValue"
      :model-value="newHighlightValue"
      :placeholder="placeholder"
      @update:model-value="(value) => (newHighlightValue = value)"
    />
    <NovaButton
      class="ml-2 newValueButton"
      :disabled="!!!newHighlightValue"
      variant="outline"
      size="sm"
      data-testid="custom-highlights-add-new"
      @click="handleCreate"
    >
      {{ $t("common.add") }}
    </NovaButton>
  </div>
</template>

<script setup lang="ts">
import { GenericHighlight } from "@/types/Highlights";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { uuid } from "@/utils/uuid";

export interface Props {
  visualizationOrder: number;
  disabled?: boolean;
  placeholder?: string;
}

interface Events {
  (e: "create:new-highlight", value: GenericHighlight): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const newHighlightValue = ref<string>();

function handleCreate() {
  const name = newHighlightValue.value;

  if (name == null || name.length === 0) {
    return;
  }

  const highlight = {
    name,
    visualization_order: props.visualizationOrder,
    id: Math.floor(Math.random() * 10000).toString(),
    action: "CREATE",
    code: uuid(),
    language_code: "en",
  } as const;

  emits("create:new-highlight", highlight);
  newHighlightValue.value = "";
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.CustomHighlights {
  --text-color: var(--color-text-100);

  &__newHighlight {
    display: grid;
    grid-template-columns: 300px auto;
  }

  &[disabled] {
    --text-color: var(--color-text-70);
    --index-background-color: var(--color-secondary-10);
  }
}
</style>
