<template>
  <StepDialog class="CreateCategoryDialog" data-testid="create-category-dialog" @close="handleClose">
    <template #title>
      <h2 class="title text-center">{{ $t("masterdata.commercial.add-new-category.title") }}</h2>
    </template>

    <template #step-1="{ handler: { setNavigation } }">
      <p class="text">
        {{ $t("masterdata.commercial.add-new-category.description") }}
      </p>
      <div class="mt-4">
        <NovaInputText
          id="create-category-title-input"
          v-model="categoryTitle"
          :placeholder="$t('masterdata.commercial.add-new-category.placeholder')"
          @vue:mounted="setNavigation(categoryTitleSchema.safeParse(categoryTitle).success)"
          @update:model-value="(value) => setNavigation(categoryTitleSchema.safeParse(value).success)"
        />
      </div>
    </template>

    <template #step-2>
      <p class="text">
        {{ $t("masterdata.commercial.add-items-category.description") }}
      </p>
      <div class="mt-4">
        <h3 class="subtitle mt-5">{{ $t("masterdata.detail-card.category") }}</h3>
        <span class="text">{{ categoryTitle }}</span>
        <h3 class="subtitle mt-5">{{ $t("masterdata.commercial.add-new-item.items") }}</h3>
        <CreatePremadeItemList v-model="items" @update:validation="(value) => (canSave = value)" />
      </div>
    </template>
    <template #complete>
      <NovaButton :loading="loading" :disabled="!canSave" @click="handleSave">
        {{ $t("masterdata.commercial.add-items-category.complete") }}
      </NovaButton>
    </template>
  </StepDialog>
</template>

<script setup lang="ts">
import { UseAsyncModalEvents } from "@/features/core-shared/composables/useAsyncModal";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { z } from "zod";
import CreatePremadeItemList from "./CreatePremadeItemList.vue";
import StepDialog from "./StepDialog.vue";

type Props = { handler: (categoryName: string, items: string[]) => Promise<unknown> };

type Events = UseAsyncModalEvents;

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const categoryTitle = ref("");
const categoryTitleSchema = z.string().min(1);

const items = ref<string[]>([]);

const loading = ref(false);
const canSave = ref(false);

async function handleSave() {
  loading.value = true;
  try {
    await props.handler(categoryTitle.value, items.value);
    emits("confirm");
  } catch (error) {
    emits("cancel");
    throw error;
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  emits("confirm");
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.CreateCategoryDialog {
  width: rem(640px);

  .title {
    @include font-bold(16);

    color: var(--color-text-100);
  }

  .subtitle {
    @include font-bold(12);

    color: var(--color-text-90);
  }

  .text {
    @include font-regular(14);
  }
}
</style>
