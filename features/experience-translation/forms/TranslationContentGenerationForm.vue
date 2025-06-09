<template>
  <FormSection id="description" required>
    <div class="mt-4">
      <FlagLanguageDisplay country-code="en" class="mb-2" />
      <NovaTextEditor
        id="editorial-description"
        :model-value="curationValues.text1"
        :placeholder="$t('experience.description.editor.placeholder')"
        :readonly="true"
      >
        <DiffHtml v-if="hasDiff" :old-value="diffValues?.text1 ?? ''" :value="curationValues.text1 ?? ''" />
      </NovaTextEditor>
    </div>

    <div class="mt-6">
      <FlagLanguageDisplay :country-code="language" class="mb-2" />

      <NovaTextEditor
        id="translation-description"
        v-model="formValues.text1"
        class=""
        :placeholder="$t('experience.description.editor.placeholder')"
        :readonly="readonly"
      />
    </div>
  </FormSection>

  <FormSection id="seo_description" required>
    <div class="mt-4">
      <FlagLanguageDisplay country-code="en" class="mb-2" />
      <NovaTextEditor
        id="editorial-seo-description"
        class=""
        :model-value="curationValues.seo_description"
        :placeholder="$t('experience.seo_description.title')"
        :readonly="true"
      >
        <DiffHtml
          v-if="hasDiff"
          :old-value="diffValues?.seo_description ?? ''"
          :value="curationValues.seo_description ?? ''"
        />
      </NovaTextEditor>
    </div>

    <div class="mt-6">
      <FlagLanguageDisplay :country-code="language" class="mb-2" />

      <NovaTextEditor
        id="translation-seo-description"
        v-model="formValues.seo_description"
        class=""
        :placeholder="$t('experience.seo_description.title')"
        :readonly="readonly"
      />
    </div>
  </FormSection>

  <FormSection id="additional_description">
    <div class="mt-4">
      <FlagLanguageDisplay country-code="en" class="mb-2" />
      <NovaTextEditor
        id="editorial-additional-description"
        class=""
        :model-value="curationValues.text2 ?? ''"
        :placeholder="$t('experience.additional_description.title')"
        :readonly="true"
      >
        <DiffHtml v-if="hasDiff" :old-value="diffValues?.text2 ?? ''" :value="curationValues.text2 ?? ''" />
      </NovaTextEditor>
    </div>

    <div class="mt-6">
      <FlagLanguageDisplay :country-code="language" class="mb-2" />
      <NovaTextEditor
        id="translation-additional-description"
        v-model="formValues.text2"
        class=""
        :placeholder="$t('experience.additional_description.title')"
        :readonly="readonly"
      />
    </div>
  </FormSection>
  <FormSection id="highlights" :required="true">
    <div class="TranslationHighlightsSwitch">
      <span class="mr-4">
        {{ $t("experience.highlights.premade-content") }}
      </span>
      <NovaSwitch v-model="showPremade[0].value" />
    </div>
    <div class="DocumentForm__horizontal-container">
      <div>
        <FlagLanguageDisplay country-code="en" class="mb-2" />
        <TranslationHighlights
          :model-value="curationValues.custom_highlights"
          data-testid="editorial-highlights"
          :premade-items="curationValues.premade_highlights"
          :disabled="true"
          :show-premade="showPremade[0].value"
          :show-diff="hasDiff"
          :diff-old-value="{
            custom: diffValues?.custom_highlights ?? [],
            premade: diffValues?.premade_highlights ?? [],
          }"
          :diff-new-value="{ custom: curationValues.custom_highlights, premade: curationValues.premade_highlights }"
        />
      </div>
      <div>
        <FlagLanguageDisplay :country-code="language" class="mb-2" />
        <TranslationHighlights
          v-model="formValues.custom_highlights"
          data-testid="translation-highlights"
          :premade-items="initialValues.premade_highlights"
          :show-premade="showPremade[0].value"
          :disabled="readonly"
        />
      </div>
    </div>
  </FormSection>
  <FormSection id="included" :required="true">
    <div class="TranslationHighlightsSwitch">
      <span class="mr-4">
        {{ $t("experience.highlights.premade-content") }}
      </span>
      <NovaSwitch v-model="showPremade[1].value" />
    </div>
    <div class="DocumentForm__horizontal-container">
      <div>
        <FlagLanguageDisplay country-code="en" class="mb-2" />
        <TranslationHighlights
          :model-value="curationValues.custom_included"
          data-testid="editorial-included"
          :premade-items="curationValues.premade_included"
          :disabled="true"
          :show-premade="showPremade[1].value"
          :show-diff="hasDiff"
          :diff-old-value="{ custom: diffValues?.custom_included ?? [], premade: diffValues?.premade_included ?? [] }"
          :diff-new-value="{ custom: curationValues.custom_included, premade: curationValues.premade_included }"
        />
      </div>
      <div>
        <FlagLanguageDisplay :country-code="language" class="mb-2" />
        <TranslationHighlights
          v-model="formValues.custom_included"
          data-testid="translation-included"
          :premade-items="initialValues.premade_included"
          :show-premade="showPremade[1].value"
          :disabled="readonly"
        />
      </div>
    </div>
  </FormSection>
  <FormSection id="non_included">
    <div class="TranslationHighlightsSwitch">
      <span class="mr-4">
        {{ $t("experience.highlights.premade-content") }}
      </span>
      <NovaSwitch v-model="showPremade[2].value" />
    </div>
    <div class="DocumentForm__horizontal-container">
      <div>
        <FlagLanguageDisplay country-code="en" class="mb-2" />
        <TranslationHighlights
          :model-value="curationValues.custom_non_included"
          data-testid="editorial-non_included"
          :premade-items="curationValues.premade_non_included"
          :disabled="true"
          :show-premade="showPremade[2].value"
          :show-diff="hasDiff"
          :diff-old-value="{
            custom: diffValues?.custom_non_included ?? [],
            premade: diffValues?.premade_non_included ?? [],
          }"
          :diff-new-value="{
            custom: curationValues.custom_non_included,
            premade: curationValues.premade_non_included,
          }"
        />
      </div>
      <div>
        <FlagLanguageDisplay :country-code="language" class="mb-2" />
        <TranslationHighlights
          v-model="formValues.custom_non_included"
          data-testid="translation-non_included"
          :premade-items="initialValues.premade_non_included"
          :show-premade="showPremade[2].value"
          :disabled="readonly"
        />
      </div>
    </div>
  </FormSection>
  <FormSection id="important_information">
    <div class="TranslationHighlightsSwitch">
      <span class="mr-4">
        {{ $t("experience.highlights.premade-content") }}
      </span>
      <NovaSwitch v-model="showPremade[3].value" />
    </div>
    <div class="DocumentForm__horizontal-container">
      <div>
        <FlagLanguageDisplay country-code="en" class="mb-2" />
        <TranslationHighlights
          :model-value="curationValues.custom_important_information"
          data-testid="editorial-important_information"
          :premade-items="curationValues.premade_important_information"
          :disabled="true"
          :show-premade="showPremade[3].value"
          :show-diff="hasDiff"
          :diff-old-value="{
            custom: diffValues?.custom_important_information ?? [],
            premade: diffValues?.premade_important_information ?? [],
          }"
          :diff-new-value="{
            custom: curationValues.custom_important_information,
            premade: curationValues.premade_important_information,
          }"
        />
      </div>
      <div>
        <FlagLanguageDisplay :country-code="language" class="mb-2" />
        <TranslationHighlights
          v-model="formValues.custom_important_information"
          data-testid="translation-important_information"
          :premade-items="initialValues.premade_important_information"
          :show-premade="showPremade[3].value"
          :disabled="readonly"
        />
      </div>
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import { useFormValidation } from "@/features/experience-translation/composables/useFormValidation";
import { useFormValues } from "@/features/experience-translation/composables/useFormValues";
import { GenericHighlight, MixedHighlightValue } from "@/types/Highlights";
import NovaSwitch from "@/ui-kit/NovaSwitch/NovaSwitch.vue";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import { z } from "zod";
import FlagLanguageDisplay from "../components/FlagLanguageDisplay.vue";
import TranslationHighlights from "../components/TranslationHighlights.vue";
import DiffHtml from "@/features/experience-shared/components/DiffHtml.vue";
import { TranslationFormProps } from "../types";

export interface TranslationContentGenerationValues {
  text1?: string;
  seo_description?: string;
  text2?: string;
  custom_highlights: GenericHighlight[];
  custom_included: GenericHighlight[];
  custom_non_included: GenericHighlight[];
  custom_important_information: GenericHighlight[];
  premade_highlights: GenericHighlight[];
  premade_important_information: GenericHighlight[];
  premade_included: GenericHighlight[];
  premade_non_included: GenericHighlight[];
}

interface DiffValues {
  text1?: string;
  seo_description?: string;
  text2?: string;
  highlights?: {
    highlights: MixedHighlightValue;
    included: MixedHighlightValue;
    non_included: MixedHighlightValue;
    important_information: MixedHighlightValue;
  };
}

type Props = TranslationFormProps<TranslationContentGenerationValues> & {
  diffValues?: DiffValues;
};
interface Events {
  (e: "update:modelValue", update: TranslationContentGenerationValues): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const formSchema = z.object({
  description: z.string(),
  seo_description: z.string(),
  additional_description: z.string().optional(),
});

const { formValues } = useFormValues(props.initialValues, handleUpdate);
const { runValidation } = useFormValidation(formValues, formSchema);

const showPremade = [ref(true), ref(true), ref(true), ref(true)];

function handleUpdate() {
  runValidation();
  emits("update:modelValue", formValues.value);
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.TranslationHighlightsSwitch {
  display: flex;
  margin-top: rem(24);
  margin-bottom: rem(24);

  @include font-regular(12);
}
</style>
