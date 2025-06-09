<template>
  <div class="CreatePremadeItem">
    <div class="header">
      <div />
      <h2 class="title text-center">{{ $t("masterdata.commercial.add-new-item.title") }}</h2>
      <NovaButtonIcon name="close" :size="16" @click="$emit('cancel')" />
    </div>

    <div class="body">
      <p class="description">
        {{ $t("masterdata.commercial.add-new-item.description") }}
      </p>
      <p class="hint mt-5">
        {{ $t("masterdata.detail-card.category") }}
      </p>
      <NovaSelect
        class="mt-2 CategorySelect"
        data-testid="category-select"
        :selected="selectedCategory"
        :options="
          categoryOptions.map((category) => ({
            label: category.name,
            value: category.code,
          }))
        "
        :max-height="350"
        :placeholder="$t('masterdata.commercial.add-new-item.category-placeholder')"
        @select:option="(val) => (selectedCategory = val)"
      />
      <p class="hint mt-5">
        {{ $t("masterdata.commercial.add-new-item.items") }}
      </p>
      <CreatePremadeItemList v-model="items" @update:validation="(value) => (isListValid = value)" />
    </div>
    <div class="footer">
      <NovaButton data-testid="save-form-button" :loading="loading" :disabled="!isFormValid" @click="handleSave">{{
        $t("common.save")
      }}</NovaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import CreatePremadeItemList from "./CreatePremadeItemList.vue";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import { HierarchicalGroup } from "@/types/generated/ExperienceMasterDataApi";
import { z } from "zod";
import { UseAsyncModalEvents } from "@/features/core-shared/composables/useAsyncModal";

interface Props {
  handler: (item: string[], category: string) => Promise<unknown>;
  categoryOptions: HierarchicalGroup[];
  currentCategory?: HierarchicalGroup;
}

type Events = UseAsyncModalEvents;

const { $t } = useNuxtApp();

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const items = ref<string[]>([]);

const loading = ref(false);

const selectedCategory = ref<
  | {
      value: string;
      label: string;
    }
  | undefined
>(
  props.currentCategory && {
    value: props.currentCategory.code,
    label: props.currentCategory.name,
  }
);

const isListValid = ref(false);
const validateCategory = z.object({
  label: z.string(),
  value: z.string(),
});
const isFormValid = computed(() => isListValid.value && validateCategory.safeParse(selectedCategory.value).success);

async function handleSave() {
  try {
    loading.value = true;
    await props.handler(items.value, validateCategory.parse(selectedCategory.value).value);
  } finally {
    emits("confirm");
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.header {
  display: grid;
  grid-template-columns: 28px auto 28px;
  align-items: center;
  padding: rem(16px) rem(20px);
}

.title {
  @include font-bold(16);
}

.description {
  @include font-regular(14);
}

.hint {
  color: var(--color-text-90);

  @include font-semibold(12);
}

.body {
  padding: rem(16px) rem(20px);
  max-height: 500px;
  overflow-y: visible;

  .CategorySelect {
    max-width: rem(250px);
  }
}

.footer {
  padding: rem(16px) rem(20px);
  border-top: var(--border-default);
  display: flex;
  flex-direction: row-reverse;
}
</style>
