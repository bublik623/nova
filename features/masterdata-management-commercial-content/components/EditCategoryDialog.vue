<template>
  <StepDialog class="w-[640px]" @close="$emit('confirm')">
    <template #title>
      <h2 class="title text-center">{{ $t("masterdata.commercial.edit-category.title") }}</h2>
    </template>

    <template #step-1="{ handler: { setNavigation } }">
      <p class="text-sm font-normal">
        {{ $t("masterdata.commercial.edit-category.description.step-1") }}
      </p>

      <div class="mt-4">
        <div class="border-b border-b-neutral-60 pb-4">
          <p class="text-xs font-bold text-text-90">
            {{ $t("masterdata.commercial.edit-category.previous-version") }}
          </p>
          <p class="my-2 text-xs font-medium text-text-90">
            {{ $t("masterdata.commercial.edit-category.category") }}
          </p>
          <p class="font-normal text-sm">{{ category.name }}</p>
        </div>

        <div class="pb-4 mt-4">
          <p class="text-xs font-bold text-text-90">
            {{ $t("masterdata.commercial.edit-category.new-version") }}
          </p>
          <p class="mt-2 mb-1 text-xs font-medium text-text-90">
            {{ $t("masterdata.commercial.edit-category.category") }}
          </p>
          <NovaInputText
            id="update-category-name-input"
            v-model="newCategoryName"
            :placeholder="$t('masterdata.commercial.update-category-name.placeholder')"
            @vue:mounted="setNavigation(newCategoryNameSchema.safeParse(newCategoryName).success)"
            @update:model-value="(value) => setNavigation(newCategoryNameSchema.safeParse(value).success)"
          />
        </div>
      </div>
    </template>

    <template #step-2>
      <p class="mt-2 mb-1 text-xs font-medium text-text-90">
        {{ $t("masterdata.commercial.edit-category.category") }}
      </p>
      <p class="font-normal text-sm">{{ newCategoryName }}</p>
    </template>
    <template #complete>
      <NovaButton data-testid="translation-publish-button" :loading="loading" @click="handleSave">
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
import { HierarchicalGroup } from "@/types/generated/ExperienceMasterDataApi";

type Props = {
  category: HierarchicalGroup;
  handler: (translation: HierarchicalGroup, newValue: string) => Promise<unknown>;
};

const newCategoryName = ref("");
const newCategoryNameSchema = z.string().trim().min(1);

const emits = defineEmits<UseAsyncModalEvents>();
const props = defineProps<Props>();
const loading = ref(false);

async function handleSave() {
  loading.value = true;
  try {
    await props.handler(props.category, newCategoryName.value);
    emits("confirm");
  } catch (error) {
    emits("cancel");
    throw error;
  } finally {
    loading.value = false;
  }
}
</script>
