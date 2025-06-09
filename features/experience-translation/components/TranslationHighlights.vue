<template>
  <HighlightsWrapper>
    <template v-if="showPremade">
      <h3 class="title" :class="{ disabled }">
        {{ $t("experience.highlights.premade.title") }}
      </h3>

      <EmptyList v-if="premades.length === 0" data-testid="translation-highlight-empty-list" />
      <EditableList
        v-else-if="disabled"
        v-model="premades"
        :disabled="disabled"
        theme="disabled"
        data-testid="translation-highlight-simple-list"
        :added-items="addedItemsPremade"
        :removed-items="removedItemsPremade"
        class="list"
      />
      <EditableList
        v-else
        v-model="premades"
        theme="primary"
        data-testid="translation-highlight-premade-list"
        class="list"
        :disabled="true"
      />

      <div class="divider" />
    </template>

    <h3 class="title" :class="{ disabled }">
      {{ $t("experience.highlights.custom.title") }}
    </h3>

    <EmptyList v-if="customs.length === 0" data-testid="translation-highlight-empty-list" />
    <EditableList
      v-else-if="disabled"
      :disabled="disabled"
      theme="disabled"
      data-testid="translation-highlight-simple-list"
      :model-value="customs"
      :added-items="addedItemsCustom"
      :removed-items="removedItemsCustom"
      class="list"
    />
    <TranslationList v-else v-model="customs" data-testid="translation-highlight-translation-list" class="list" />
  </HighlightsWrapper>
</template>

<script setup lang="ts">
import EmptyList from "@/features/experience-highlights/components//EmptyList.vue";
import TranslationList from "@/features/experience-highlights/components//TranslationList.vue";
import HighlightsWrapper from "@/features/experience-highlights/components/HighlightsWrapper.vue";
import { GenericHighlight, MixedHighlightValue } from "@/types/Highlights";
import { useVModel } from "@vueuse/core";
import EditableList from "@/features/experience-highlights/components//EditableList.vue";
import {
  getAddedItems,
  getRemovedItems,
  mergeUnique,
} from "@/features/experience-highlights/utils/highlights-diff-utils";

interface Props {
  modelValue: GenericHighlight[]; //custom highlights
  premadeItems: GenericHighlight[]; //premade highlights
  disabled?: boolean;
  showPremade: boolean;
  showDiff?: boolean;
  diffOldValue?: MixedHighlightValue;
  diffNewValue?: MixedHighlightValue;
}

interface Events {
  (e: "update:modelValue", update: GenericHighlight[]): void;
  (e: "update:premadeItems", update: GenericHighlight[]): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();
const customs = useVModel(props, "modelValue", emits, { passive: true });
const premades = useVModel(props, "premadeItems", emits, { passive: true });

const addedItemsPremade = ref<GenericHighlight[]>([]);
const removedItemsPremade = ref<GenericHighlight[]>([]);
const addedItemsCustom = ref<GenericHighlight[]>([]);
const removedItemsCustom = ref<GenericHighlight[]>([]);

const calculateChanges = () => {
  if (props.showDiff) {
    // Full diff mode - comparing old and new values
    addedItemsPremade.value = getAddedItems(props.diffOldValue?.premade, props.diffNewValue?.premade, "code");
    removedItemsPremade.value = getRemovedItems(props.diffOldValue?.premade, props.diffNewValue?.premade, "code");
    addedItemsCustom.value = getAddedItems(props.diffOldValue?.custom, props.diffNewValue?.custom, "name");
    removedItemsCustom.value = getRemovedItems(props.diffOldValue?.custom, props.diffNewValue?.custom, "name");

    const allPremades = mergeUnique(props.diffOldValue?.premade, props.diffNewValue?.premade, "code");
    const allCustoms = mergeUnique(props.diffOldValue?.custom, props.diffNewValue?.custom, "name");

    customs.value = allCustoms;
    premades.value = allPremades;
  } else {
    // Normal mode - no diff highlighting
    addedItemsPremade.value = [];
    addedItemsCustom.value = [];
    removedItemsPremade.value = [];
    removedItemsCustom.value = [];

    customs.value = props.modelValue;
    premades.value = props.premadeItems;
  }
};

watch(
  [() => props.diffOldValue, () => props.diffNewValue, () => props.showDiff],
  async () => {
    calculateChanges();
  },
  { immediate: true, deep: true }
);
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.disabled {
  color: var(--color-text-70);
}
</style>
