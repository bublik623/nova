<template>
  <FormSection id="info_voucher">
    <div class="mt-4">
      <FlagLanguageDisplay country-code="en" class="mb-2" />
      <NovaTextEditor
        id="editorial-info-voucher"
        :model-value="curationValues.info_voucher"
        :placeholder="$t('experience.voucher.editor.placeholder')"
        :readonly="true"
      >
        <DiffHtml
          v-if="hasDiff"
          :old-value="diffValues?.info_voucher || ''"
          :value="curationValues.info_voucher || ''"
        />
      </NovaTextEditor>
    </div>

    <div class="mt-6">
      <FlagLanguageDisplay :country-code="language" class="mb-2" />

      <NovaTextEditor
        id="translation-info-voucher"
        v-model="formValues.info_voucher"
        :placeholder="$t('experience.voucher.editor.placeholder')"
        :readonly="readonly"
      />
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import { useFormValidation } from "@/features/experience-translation/composables/useFormValidation";
import { useFormValues } from "@/features/experience-translation/composables/useFormValues";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import { z } from "zod";
import FlagLanguageDisplay from "../components/FlagLanguageDisplay.vue";
import DiffHtml from "@/features/experience-shared/components/DiffHtml.vue";
import { TranslationFormProps } from "../types";

export interface TranslationCustomerInformationFormValues {
  info_voucher?: string;
}

type Props = TranslationFormProps<TranslationCustomerInformationFormValues>;

interface Events {
  (e: "update:modelValue", update: TranslationCustomerInformationFormValues): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const formSchema = z.object({
  info_voucher: z.string().min(2),
});

const { formValues } = useFormValues(props.initialValues, handleUpdate);
const { runValidation } = useFormValidation(formValues, formSchema);

function handleUpdate() {
  runValidation();
  emits("update:modelValue", formValues.value);
}
</script>
