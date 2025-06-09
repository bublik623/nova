<template>
  <HighlightsWrapper class="RawHighlights">
    <div class="PremadeHighlightsTitle my-1">
      <h3 class="title" :class="{ readonly }">
        {{ $t("experience.highlights.premade.title") }}
      </h3>

      <GroupedPremadeModal
        v-if="!readonly"
        v-model="premadeModel"
        data-testid="raw-highlights-premade-modal"
        class="mr-4"
        :options="(masterdataOptions as ExperienceMasterDataItem[])"
        :title="options?.title || ''"
        :hierarchical-groups="hierarchicalGroups"
      />
    </div>

    <EmptyList
      v-if="readonly && modelValue.premade.length <= 0"
      data-testid="raw-highlights-empty-premade-list"
      class="list pb-2"
    />

    <EditableList
      v-model="model.premade"
      data-testid="raw-highlights-editable-premade-list"
      class="list"
      :disabled="readonly"
      theme="primary"
      :added-items="diffNewValue?.premade?.length ? addedItemsPremade : []"
      :removed-items="diffNewValue?.premade?.length ? removedItemsPremade : []"
    />

    <div class="divider" />

    <h3 class="title" :class="{ readonly }">
      {{ $t("experience.highlights.custom.title") }}
    </h3>

    <NewHighlight
      data-testid="raw-highlights-new-highlight"
      :visualization-order="modelValue.custom.length + 1"
      :disabled="readonly"
      :placeholder="options?.placeholder"
      class="list pb-2"
      @create:new-highlight="(item) => model.custom.push(item)"
    />

    <EmptyList
      v-if="readonly && modelValue.custom.length <= 0"
      data-testid="raw-highlights-empty-custom-list"
      class="list pb-2"
    />

    <EditableList
      v-model="model.custom"
      data-testid="raw-highlights-editable-custom-list"
      class="list"
      :disabled="readonly"
      :editable="true"
      theme="secondary"
      :added-items="diffNewValue?.custom?.length ? addedItemsCustom : []"
      :removed-items="diffNewValue?.custom?.length ? removedItemsCustom : []"
    />
  </HighlightsWrapper>
</template>

<script setup lang="ts">
import EditableList from "@/features/experience-highlights/components/EditableList.vue";
import EmptyList from "@/features/experience-highlights/components//EmptyList.vue";
import NewHighlight from "@/features/experience-highlights/components//NewHighlight.vue";
import GroupedPremadeModal from "@/features/experience-highlights/components//GroupedPremadeModal.vue";
import HighlightsWrapper from "@/features/experience-highlights/components/HighlightsWrapper.vue";
import { GenericHighlight, MixedHighlightValue } from "@/types/Highlights";
import { useVModel } from "@vueuse/core";
import { ExperienceMasterDataItem } from "@/composables/useExperienceMasterDataApi";
import { HierarchicalGroup } from "@/types/generated/ExperienceMasterDataApi";
import {
  getAddedItems,
  getRemovedItems,
  mergeUnique,
} from "@/features/experience-highlights/utils/highlights-diff-utils";

export interface Props {
  modelValue: MixedHighlightValue;
  readonly?: boolean;
  masterdataOptions: ExperienceMasterDataItem[];
  hierarchicalGroups: Map<string, HierarchicalGroup>;
  options?: {
    title?: string;
    placeholder?: string;
  };
  showDiff?: boolean;
  diffNewValue?: MixedHighlightValue;
  diffOldValue?: MixedHighlightValue;
}

interface Events {
  (e: "update:modelValue", value: MixedHighlightValue): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const model = useVModel(props, "modelValue", emits);

const addedItemsPremade = ref<GenericHighlight[]>([]);
const removedItemsPremade = ref<GenericHighlight[]>([]);
const addedItemsCustom = ref<GenericHighlight[]>([]);
const removedItemsCustom = ref<GenericHighlight[]>([]);

const calculateDiff = () => {
  addedItemsPremade.value = getAddedItems(props.diffOldValue?.premade, props.diffNewValue?.premade, "code");
  removedItemsPremade.value = getRemovedItems(props.diffOldValue?.premade, props.diffNewValue?.premade, "code");
  addedItemsCustom.value = getAddedItems(props.diffOldValue?.custom, props.diffNewValue?.custom, "name");
  removedItemsCustom.value = getRemovedItems(props.diffOldValue?.custom, props.diffNewValue?.custom, "name");
  const premade = mergeUnique(props.diffOldValue?.premade, props.diffNewValue?.premade, "code");
  const custom = mergeUnique(props.diffOldValue?.custom, props.diffNewValue?.custom, "name");

  model.value.premade = premade;
  model.value.custom = custom;
};

watch(
  () => props.diffOldValue,
  async () => {
    if (props.showDiff && props.diffOldValue) {
      calculateDiff();
    }
  },
  { immediate: true, deep: true }
);

// In the store the premades are an array. We need to convert it to a map to use it in the modal.
const premadeModel = computed({
  get: () => {
    return new Map(model.value.premade.map((item) => [item.id, item as ExperienceMasterDataItem]));
  },
  set: (updatedValues) => {
    //@ts-expect-error This should now be a GenericHighlight.
    model.value.premade = Array.from(updatedValues.values());
  },
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.readonly {
  color: var(--color-text-70);
}

.PremadeHighlightsTitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
