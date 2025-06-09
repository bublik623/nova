<template>
  <div v-for="(_, index) in items" :key="index" class="mt-2 flex">
    <NovaInputText
      :id="`premade-item-input-${index}`"
      v-model="items[index]"
      :placeholder="$t('masterdata.commercial.add-new-item.placeholder')"
    />
    <NovaButtonIcon
      v-if="canDelete"
      :data-testid="`premade-item-delete-${index}`"
      class="ml-1"
      name="trash"
      @click="handleDeleteItem(index)"
    />
  </div>

  <NovaButton
    data-testid="add-item-button"
    variant="underlined"
    class="mt-2"
    size="xs"
    :disabled="!validation.isValid.value"
    @click="handleAddItem"
  >
    + {{ $t("common.add.item") }}
  </NovaButton>
</template>

<script setup lang="ts">
import { array, string } from "zod";
import { useGenericValidation } from "@/features/experience-calendar/composables/useGenericValidation";
import { useVModel } from "@vueuse/core";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";

type Props = {
  modelValue: string[];
};

type Events = {
  (e: "update:modelValue", value: string[]): void;
  (e: "update:validation", value: boolean): void;
};

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const items = useVModel(props, "modelValue", emits);

const schema = array(string().min(1)).min(1);
const validation = useGenericValidation(schema);

const canDelete = computed(() => items.value.length > 1);

watch(
  () => items.value,
  () => {
    if (items.value.length === 0) {
      items.value.push("");
    }
    validation.runValidation(items.value);
    emits("update:validation", validation.isValid.value);
  },
  { immediate: true, deep: true }
);

function handleAddItem() {
  items.value.push("");
}

function handleDeleteItem(index: number) {
  items.value.splice(index, 1);
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
