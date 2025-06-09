<template>
  <div class="p-3 border w-full" data-testid="service-and-modalities-title-editor">
    <FormSection id="asterix-service-title" class="InnerSection" :required="true" :show-description="false">
      <AsterixTitleEditor
        :id="`service-${targetValue.serviceCode}`"
        :data-testid="`service-title-editor-${targetValue.serviceCode}`"
        :max-length="70"
        :reference-value="referenceValue.title"
        :target-value="targetValue.title"
        :show-reference="showReference"
        :readonly="readonly"
        @update:target-value="(newServiceTitle) => updateServiceTitle(targetValue, newServiceTitle)"
      >
        <template #reference-label>
          <slot name="reference-label"></slot>
        </template>
        <template #target-label>
          <slot name="target-label"></slot>
        </template>
      </AsterixTitleEditor>
    </FormSection>
    <div class="py-3 px-2 mt-8 border bg-neutral-30">
      <FormSection :id="'asterix-modalities-title'" class="InnerSection" :required="true" :show-description="false">
        <div
          v-for="modality in targetValue.modalities"
          :key="modality.modalityCode"
          class="p-3 pb-6 mt-4 border bg-white"
        >
          <AsterixTitleEditor
            :id="`modality-${modality.modalityCode}`"
            :data-testid="`modality-title-editor-${modality.modalityCode}`"
            :max-length="70"
            :reference-value="getModalityReferenceTitle(modality.modalityCode)"
            :target-value="modality.title"
            :show-reference="showReference"
            :readonly="readonly"
            @update:target-value="
              (newModalityTitle) => updateModalityTitle(targetValue, modality.modalityCode, newModalityTitle)
            "
          >
            <template #reference-label>
              <slot name="reference-label"></slot>
            </template>
            <template #target-label>
              <slot name="target-label"></slot>
            </template>
          </AsterixTitleEditor>
        </div>
      </FormSection>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ServiceAndModalitiesTitleValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";
import AsterixTitleEditor from "./AsterixTitleEditor.vue";
import FormSection from "@/components/Document/FormSection/FormSection.vue";

export interface AsterixServiceAndModalitiesTitleEditorProps {
  referenceValue?: ServiceAndModalitiesTitleValue;
  targetValue: ServiceAndModalitiesTitleValue;
  showReference: boolean;
  readonly: boolean;
}

export interface AsterixServiceAndModalitiesTitleEditorEvents {
  (e: "update:value", value: ServiceAndModalitiesTitleValue): void;
  (e: "update:modalityTitle", modalityCode: string, value: string): void;
}

const props = withDefaults(defineProps<AsterixServiceAndModalitiesTitleEditorProps>(), {
  referenceValue: () => ({ serviceCode: "", title: "", modalities: [] }),
});
const emit = defineEmits<AsterixServiceAndModalitiesTitleEditorEvents>();

function updateServiceTitle(value: ServiceAndModalitiesTitleValue, newServiceTitle: string) {
  emit("update:value", { ...value, title: newServiceTitle });
}

function updateModalityTitle(value: ServiceAndModalitiesTitleValue, modalityCode: string, newModalityTitle: string) {
  const modalities = props.targetValue.modalities.map((modality) => ({ ...modality }));
  modalities[props.targetValue.modalities.findIndex((modality) => modality.modalityCode === modalityCode)].title =
    newModalityTitle;

  emit("update:value", { ...value, modalities });
}

function getModalityReferenceTitle(modalityCode: string) {
  return props.referenceValue.modalities.find((modality) => modality.modalityCode === modalityCode)?.title ?? "";
}
</script>
<style scoped lang="scss">
@import "@/assets/scss/utilities";

.border {
  border: var(--border-default);
  border-radius: var(--border-radius-default);
}

.InnerSection {
  :deep(p) {
    font-size: 14px;
  }
}
</style>
