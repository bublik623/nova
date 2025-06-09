<template>
  <ul class="TranslationHighlight">
    <li
      v-for="(item, index) in data"
      :key="item.id"
      data-testid="translation-highlight-row"
      class="TranslationHighlight__ListItem mb-3"
    >
      <ListRow theme="secondary" :index="index + 1" :highlight="item" :draggable="false">
        <NovaInputText
          :id="item.id"
          :model-value="item.name"
          :error="translationHighlightSchema.safeParse(item).success ? undefined : 'Name cannot be blank'"
          @update:model-value="
            (e) =>
              handleUpdate(
                {
                  ...item,
                  name: e,
                  action: 'EDIT',
                  visualization_order: index,
                },
                index
              )
          "
        />
      </ListRow>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { translationHighlightSchema } from "@/features/experience-translation/schemas";
import { GenericHighlight } from "@/types/Highlights";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { useVModel } from "@vueuse/core";
import ListRow from "./ListRow.vue";

export interface Props {
  modelValue: GenericHighlight[];
}

interface Events {
  (e: "update:modelValue", update: GenericHighlight[]): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();
const data = useVModel(props, "modelValue", emits);

function handleUpdate(updatedValue: GenericHighlight, index: number) {
  const updateArray = [...data.value];

  updateArray[index] = updatedValue;

  emits("update:modelValue", updateArray);
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
