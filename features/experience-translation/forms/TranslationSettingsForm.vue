<template>
  <FormSection id="title" :required="true" :slot-max-width="500">
    <div class="mt-4">
      <FlagLanguageDisplay class="mb-2" country-code="en" />
      <NovaInputText
        id="editorial-title-input"
        :model-value="curationValues.title"
        :readonly="true"
        :readonly-placeholder="$t('common.no-content')"
      >
        <DiffText v-if="hasDiff" :old-value="diffValues?.title ?? ''" :value="curationValues.title ?? ''" />
      </NovaInputText>
    </div>

    <div class="mt-4">
      <FlagLanguageDisplay class="mb-2" :country-code="language" />
      <NovaInputText
        id="translation-title-input"
        v-model="formValues.title"
        :placeholder="$t('experience.title.input.placeholder')"
        :error="getFieldErrors('title')"
        :readonly="readonly"
        :readonly-placeholder="$t('common.no-content')"
      />
    </div>
  </FormSection>

  <FormSection id="seo_title" :slot-max-width="500" required>
    <div class="mt-4">
      <FlagLanguageDisplay class="mb-2" country-code="en" />
      <NovaInputText
        id="editorial-seo-title-input"
        :model-value="curationValues.seo_title"
        :readonly="true"
        :placeholder="$t('experience.seo_title.title')"
        :readonly-placeholder="$t('common.no-content')"
      >
        <DiffText v-if="hasDiff" :old-value="diffValues?.seo_title ?? ''" :value="curationValues.seo_title ?? ''" />
      </NovaInputText>
    </div>
    <div class="mt-4">
      <FlagLanguageDisplay class="mb-2" :country-code="language" />
      <NovaInputText
        id="translation-seo-title-input"
        v-model="formValues.seo_title"
        :placeholder="$t('experience.seo_title.title')"
        :error="getFieldErrors('seo_title')"
        :readonly="readonly"
        :readonly-placeholder="$t('common.no-content')"
      />
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import { useFormValidation } from "@/features/experience-translation/composables/useFormValidation";
import { useFormValues } from "@/features/experience-translation/composables/useFormValues";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import { z } from "zod";
import FlagLanguageDisplay from "../components/FlagLanguageDisplay.vue";
import DiffText from "@/features/experience-shared/components/DiffText.vue";
import { TranslationFormProps } from "../types";

export interface TranslationSettingsFormValues {
  title?: string;
  seo_title?: string;
}

type Props = TranslationFormProps<TranslationSettingsFormValues>;

interface Events {
  (e: "update:modelValue", update: TranslationSettingsFormValues): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const formSchema = z.object({
  title: z.string().min(2),
  seo_title: z.string().min(2),
});

const { formValues } = useFormValues(props.initialValues, handleUpdate);
const { getFieldErrors, runValidation } = useFormValidation(formValues, formSchema);

function handleUpdate() {
  runValidation();
  emits("update:modelValue", formValues.value);
}
</script>
