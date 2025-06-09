<template>
  <div class="grid gap-14">
    <component :is="getFormComponent.is" v-bind="getFormComponent.props" />
  </div>
</template>

<script setup lang="ts">
import { allowedRevisionFlowSchema } from "@/features/experience-revision/schema";
import { getRawForms } from "@/features/experience-revision/config/raw.config";
import { getCurationForms } from "@/features/experience-revision/config/curation.config";
import { getTranslationForms } from "@/features/experience-revision/config/translation.config";
import { useRevisionStore } from "@/features/experience-revision/store/useRevisionStore";
import { getMediaForms } from "@/features/experience-revision/config/media.config";
import { RevisionFormProps } from "../types/forms";

const props = defineProps<{
  flow: string;
  language: string;
  form: string;
}>();

const safeFlow = allowedRevisionFlowSchema.parse(props.flow);

const store = useRevisionStore();

const newFormMap = {
  raw: getRawForms(store.rawValues, store.rawOptions || {}, store.sideBarConfig.requiredFields),
  curation: getCurationForms(store.curationValues, store.curationOptions || {}, store.sideBarConfig.requiredFields),
  translation: getTranslationForms(props.language, store.translationRevision, store.curationValues),
  media: getMediaForms(store.mediaValues, {}, store.sideBarConfig.requiredFields),
} as const;

const getFormComponent = computed(() => {
  const config = newFormMap[safeFlow];

  if (config == null) {
    throw new Error(`Could not get form config: ${safeFlow}`);
  }

  const key = props.form as keyof typeof config;

  if (key in config === false) {
    throw new Error(`Could not get form component: ${props.form}`);
  }

  // We have to type the object, otherwise TS will not be able to infer the type of the component
  const component: {
    is: unknown;
    props: RevisionFormProps;
  } = config[key];

  if (component == null) {
    throw new Error(`Could not get form component: ${props.form}`);
  }

  return component;
});
</script>
