<template>
  <StepDialog class="TranslationDialog" @close="$emit('confirm')">
    <template #title>
      <h2 class="title text-center">{{ translations[action].title }}</h2>
    </template>

    <template #step-1="{ handler: { setNavigation } }">
      <p class="TranslationDialog__description">
        {{ $t("masterdata.commercial.add-translation.description.step-1") }}
      </p>

      <div class="TranslationDialog__translations mt-7">
        <div class="TranslationDialog__translation">
          <span class="TranslationDialog__flag">
            <NovaIconFlag :country-code="mainTranslation.language_code" shape="circle" :size="10" class="mr-1" />
            {{ $t(`common.language.${mainTranslation.language_code}`) }}
          </span>
          {{ mainTranslation.name }}
        </div>

        <div class="TranslationDialog__translation">
          <span class="TranslationDialog__flag mb-1">
            <NovaIconFlag :country-code="translationToUpdate.language_code" shape="circle" :size="10" class="mr-1" />
            {{ $t(`common.language.${translationToUpdate.language_code}`) }}
          </span>
          <NovaTextarea
            id="update-translation-input"
            v-model="newTranslation"
            :placeholder="$t('masterdata.commercial.update-translation.placeholder')"
            @vue:mounted="setNavigation(newTranslationSchema.safeParse(newTranslation).success)"
            @update:model-value="(value) => setNavigation(newTranslationSchema.safeParse(value).success)"
          />
        </div>
      </div>
    </template>

    <template #step-2>
      <p class="TranslationDialog__description">
        {{ $t("masterdata.commercial.add-translation.description.step-2") }}
      </p>

      <div class="TranslationDialog__translations mt-7">
        <div class="TranslationDialog__translation">
          <span class="TranslationDialog__flag">
            <NovaIconFlag :country-code="mainTranslation.language_code" shape="circle" :size="10" class="mr-1" />
            {{ $t(`common.language.${mainTranslation.language_code}`) }}
          </span>
          <p>
            {{ mainTranslation.name }}
          </p>
        </div>

        <div class="TranslationDialog__translation">
          <span class="TranslationDialog__flag">
            <NovaIconFlag :country-code="translationToUpdate.language_code" shape="circle" :size="10" class="mr-1" />
            {{ $t(`common.language.${translationToUpdate.language_code}`) }}
          </span>
          <p class="break-words">
            {{ newTranslation }}
          </p>
        </div>
      </div>
    </template>
    <template #complete>
      <NovaButton data-testid="translation-publish-button" :loading="loading" @click="handleSave">
        {{ $t("masterdata.commercial.add-translation.complete-btn") }}
      </NovaButton>
    </template>
  </StepDialog>
</template>

<script setup lang="ts">
import { UseAsyncModalEvents } from "@/features/core-shared/composables/useAsyncModal";
import StepDialog from "./StepDialog.vue";
import { z } from "zod";
import { ExperienceMasterDataItem } from "@/composables/useExperienceMasterDataApi";
import NovaIconFlag from "@/ui-kit/NovaIconFlag/NovaIconFlag.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaTextarea from "@/ui-kit/NovaTextarea/NovaTextarea.vue";

export type ValidDialogActions = "add" | "update";
type Props = {
  mainTranslation: ExperienceMasterDataItem;
  translationToUpdate: ExperienceMasterDataItem;
  handler: (translation: ExperienceMasterDataItem, newValue: string) => Promise<unknown>;
  action: ValidDialogActions;
};

const { $t } = useNuxtApp();
const emits = defineEmits<UseAsyncModalEvents>();
const props = defineProps<Props>();
const loading = ref(false);

const newTranslation = ref(props.translationToUpdate.name);
const newTranslationSchema = z.string().min(1);

async function handleSave() {
  loading.value = true;
  try {
    await props.handler(props.translationToUpdate, newTranslation.value);
    emits("confirm");
  } catch (error) {
    emits("cancel");
    throw error;
  } finally {
    loading.value = false;
  }
}

const translations: Record<ValidDialogActions, { title: string }> = {
  add: {
    title: $t("masterdata.commercial.add-translation.title"),
  },
  update: {
    title: $t("masterdata.commercial.update-translation.title"),
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.TranslationDialog {
  &__description {
    @include font-regular(14);
  }

  &__translations {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    @include font-regular(14);
  }

  &__flag {
    display: flex;
    align-items: center;
    color: var(--color-text-90);

    @include font-regular(12);
  }

  &__translation {
    width: rem(290);
    min-height: rem(60);
  }
}
</style>
