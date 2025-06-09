<template>
  <StepDialog class="w-[640px]" @close="$emit('confirm')">
    <template #title>
      <h2 class="title text-center">{{ $t("masterdata.commercial.edit-item.title") }}</h2>
    </template>

    <template #step-1="{ handler: { setNavigation } }">
      <p class="text-sm font-normal">
        {{ $t("masterdata.commercial.edit-item.description.step-1") }}
      </p>

      <div class="mt-4">
        <div class="border-b border-b-neutral-60 pb-4">
          <p class="my-2 text-xs font-medium text-text-90">
            {{ $t("masterdata.commercial.edit-item.category") }}
          </p>
          <NovaSelectSearch
            id="masterdata-commercial-edit-item-dialog-categories-select"
            v-model:search-query="searchQuery"
            :max-height="300"
            class="w-[260px]"
            :selected="[selectedCategory]"
            :options="filteredCategories"
            @select:option="handleSelectOption"
          ></NovaSelectSearch>
        </div>

        <div class="pb-4 mt-4">
          <p class="text-xs font-bold text-text-90">
            {{ $t("masterdata.commercial.edit-item.item.previous-version") }}
          </p>
          <p class="mt-2 mb-4 text-xs font-medium text-text-90">
            {{ itemToUpdate.name }}
          </p>

          <p class="text-xs font-bold text-text-90">
            {{ $t("masterdata.commercial.edit-item.item.new-version") }}
          </p>
          <p class="mt-2 mb-1 text-xs font-medium text-text-90">
            {{ $t("common.item") }}
          </p>
          <NovaInputText
            id="update-category-name-input"
            v-model="newItemName"
            :placeholder="$t('masterdata.commercial.update-item-name.placeholder')"
            @vue:mounted="setNavigation(newCategoryNameSchema.safeParse(newItemName).success)"
            @update:model-value="(value) => setNavigation(newCategoryNameSchema.safeParse(value).success)"
          />
        </div>
      </div>
    </template>

    <template #step-2>
      <div class="border-b border-b-neutral-60 pb-4">
        <p class="mt-2 mb-1 text-xs font-medium text-text-90">
          {{ $t("masterdata.commercial.edit-item.category") }}
        </p>
        <p class="font-normal text-sm">{{ selectedCategory.label }}</p>
      </div>
      <div class="pt-4">
        <p class="text-xs font-bold text-text-90">
          {{ $t("masterdata.commercial.edit-item.item.new-version") }}
        </p>
        <p class="mt-2 mb-1 text-xs font-medium text-text-90">
          {{ $t("common.item") }}
        </p>
        <p class="font-normal text-sm">{{ newItemName }}</p>
      </div>
    </template>
    <template #complete>
      <NovaButton data-testid="edit-item-publish-button" :loading="loading" @click="handleSave">
        {{ $t("common.save") }}
      </NovaButton>
    </template>
  </StepDialog>
</template>

<script setup lang="ts">
import { UseAsyncModalEvents } from "@/features/core-shared/composables/useAsyncModal";
import StepDialog from "./StepDialog.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { z } from "zod";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaSelectSearch from "@/ui-kit/NovaSelectSearch/NovaSelectSearch.vue";
import { BaseOption } from "@/types/Option";

type Props = {
  itemToUpdate: ExperienceMasterDataItem;
  categoryList: BaseOption[];
  handler: (item: ExperienceMasterDataItem, newItemName: string, newCategoryCode: string) => Promise<unknown>;
};

const emits = defineEmits<UseAsyncModalEvents>();
const props = defineProps<Props>();

const loading = ref(false);
const searchQuery = ref("");
const filteredCategories = computed(() => {
  const search = searchQuery.value.toLowerCase();
  return props.categoryList.filter((category) => category.label.toLowerCase().includes(search));
});

const findCategoryByHierarchicalCode = (HierarchicalCode?: string): BaseOption => {
  if (!HierarchicalCode) {
    return { label: "Uncategorized", value: "" };
  }

  const itemCategory = props.categoryList.find((category) => category.value === HierarchicalCode);

  if (!itemCategory) {
    console.warn(
      "The current hierarchical code in the item has no match in the hierarchical groups from the masterdata"
    );

    return { label: "unknown", value: HierarchicalCode };
  }
  return itemCategory;
};
const selectedCategory = ref(findCategoryByHierarchicalCode(props.itemToUpdate.hierarchical_group_code));
const newItemName = ref(props.itemToUpdate.name);
const newCategoryNameSchema = z.string().trim().min(1);

function handleSelectOption(selectedOption: BaseOption) {
  selectedCategory.value = findCategoryByHierarchicalCode(selectedOption.value);
}

async function handleSave() {
  loading.value = true;
  try {
    await props.handler(props.itemToUpdate, newItemName.value, selectedCategory.value.value);
    emits("confirm");
  } catch (error) {
    emits("cancel");
    throw error;
  } finally {
    loading.value = false;
  }
}
</script>
