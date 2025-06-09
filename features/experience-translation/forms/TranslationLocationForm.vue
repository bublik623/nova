<template>
  <FormSection id="meeting_point_details">
    <div class="mt-4">
      <FlagLanguageDisplay country-code="en" class="mb-2" />
      <NovaTextEditor
        id="editorial-meeting-point"
        :model-value="curationValues.meeting_point_details"
        :placeholder="$t('experience.description.editor.placeholder')"
        :readonly="true"
      >
        <DiffHtml
          v-if="hasDiff"
          :old-value="diffValues?.meeting_point_details || ''"
          :value="curationValues.meeting_point_details || ''"
        />
      </NovaTextEditor>
    </div>

    <div class="mt-6">
      <FlagLanguageDisplay :country-code="language" class="mb-2" />

      <NovaTextEditor
        id="translation-meeting-point"
        v-model="formValues.meeting_point_details"
        :placeholder="$t('experience.description.editor.placeholder')"
        :readonly="readonly"
      />
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import { z } from "zod";
import { useFormValidation } from "../composables/useFormValidation";
import { useFormValues } from "../composables/useFormValues";
import FlagLanguageDisplay from "../components/FlagLanguageDisplay.vue";
import DiffHtml from "@/features/experience-shared/components/DiffHtml.vue";
import { TranslationFormProps } from "../types";

export interface TranslationLocationFormValues {
  meeting_point_details?: string;
}

type Props = TranslationFormProps<TranslationLocationFormValues>;

interface Events {
  (e: "update:modelValue", update: TranslationLocationFormValues): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const formSchema = z.object({
  meeting_point_details: z.string().optional(),
});

const { formValues } = useFormValues(props.initialValues, handleUpdate);
const { runValidation } = useFormValidation(formValues, formSchema);

function handleUpdate() {
  runValidation();
  emits("update:modelValue", formValues.value);
}
</script>
