<template>
  <main class="form">
    <FormSection id="curation.asterix-integration.service-and-modalities-codes" :required="true" :slot-max-width="700">
      <CurationAsterixServiceAndModalitiesTitleListField
        :readonly="readonly"
        :show-reference="showRawFields"
        :target-value="store.values.serviceAndModalitiesTitleTranslationList"
        @update:value="(newValue) => store.updateValues({ serviceAndModalitiesTitleTranslationList: newValue })"
      ></CurationAsterixServiceAndModalitiesTitleListField>
    </FormSection>
  </main>
</template>
<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";

import CurationAsterixServiceAndModalitiesTitleListField from "../components/CurationAsterixServiceAndModalitiesTitleListField.vue";
import { useCurationAsterixIntegrationStore } from "../stores/useCurationAsterixIntegrationStore";

export interface Props {
  readonly: boolean;
  showRawFields: boolean;
}
export interface Events {
  (e: "hasUnsavedChanges", hasUnsavedChanges: boolean): void;
}

defineProps<Props>();
const emits = defineEmits<Events>();

const store = useCurationAsterixIntegrationStore();

watch(
  () => store.hasChanges,
  (hasChanges) => emits("hasUnsavedChanges", hasChanges)
);
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
