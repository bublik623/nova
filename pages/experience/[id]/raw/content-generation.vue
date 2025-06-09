<template>
  <DocumentFormSection id="description" :required="document.fields.description.required">
    <NovaTextEditor
      v-model="document.fields.description.value"
      :placeholder="$t('experience.description.editor.placeholder')"
      data-testid="description-textarea"
      :disabled="isDisabledDuringCuration('description', document.data.status_code)"
      :readonly="isReadonly"
    />
  </DocumentFormSection>

  <DocumentFormSection id="additional_description" :required="document.fields.additional_description.required">
    <NovaButton
      v-if="!document.fields.additional_description.value && hideAdditionalDescription && !isReadonly"
      :disabled="isReadonly || isDisabledDuringCuration('additional_description', document.data.status_code)"
      @click="hideAdditionalDescription = false"
      >{{ $t("experience.additional_description.btn.add") }}</NovaButton
    >
    <NovaTextEditor
      v-else
      v-model="document.fields.additional_description.value"
      :placeholder="$t('experience.additional_description.editor.placeholder')"
      data-testid="additional_description-textarea"
      :readonly="isReadonly"
      :disabled="isDisabledDuringCuration('additional_description', document.data.status_code)"
    />
  </DocumentFormSection>

  <DocumentFormSection id="features">
    <NovaCheckboxGroup
      v-model="document.fields.features.value"
      class="experience__features"
      :options="featuresOptions"
      :readonly="isReadonly"
    />
  </DocumentFormSection>

  <template v-for="keys in highlightsKeys" :key="keys.app">
    <DocumentFormSection :id="keys.app" :required="document.fields[keys.app].required">
      <RawHighlights
        v-model="document.fields[keys.app].value"
        :hierarchical-groups="masterData.hierarchicalGroups"
        :readonly="isReadonly"
        :data-testid="`raw-${keys.app}`"
        :style="{ maxWidth: '428px' }"
        :masterdata-options="masterData[keys.store]"
        :options="{
          title: `experience.${keys.app}.title`,
          placeholder: $t(`experience.${keys.app}.creation.placeholder`),
        }"
      />
    </DocumentFormSection>
  </template>

  <DocumentFormSection id="duration" :required="document.fields.additional_services.required">
    <DocumentAdditionalServices
      id="duration"
      v-model="document.fields.additional_services.value"
      :style="{ maxWidth: '425px' }"
      :additional-services="masterData.getAdditionalServicesByFGCode('DURATION')"
      :open="additionalServicesOpen.duration"
      :readonly="isReadonly"
      @toggle:open="additionalServicesOpen.duration = !additionalServicesOpen.duration"
    />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useMasterData } from "@/stores/master-data";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import RawHighlights from "@/features/experience-raw/components/RawHighlights.vue";
import { premadeApiKeys } from "@/features/experience-highlights/lib/get-all-premade-highlights";
import { RawPageProps } from "@/features/experience-raw/types/pages";
import { isDisabledDuringCuration } from "@/features/experience-raw/utils/experience-raw-utils";
import NovaCheckboxGroup from "@/ui-kit/NovaCheckboxGroup/NovaCheckboxGroup.vue";
import { useLegacyStores } from "@/features/experience-raw/stores/useLegacyStores";

defineProps<RawPageProps>();
const experienceRaw = useExperienceRaw();
const masterData = useMasterData();
const route = useRoute();

const id = route.params.id as string;
const document = computed(() => experienceRaw.rawContents[id]);

const legacyStore = useLegacyStores();

if (document == null) {
  throw new Error(`Could not load raw document with id: ${id}, make sure it's loaded in the store.`);
}

const highlightsKeys = premadeApiKeys;

const featuresOptions = computed(() =>
  masterData.getAdditionalServicesByFGCode("FEATURES").map((i) => ({
    label: i.name,
    value: i.code,
  }))
);

const hideAdditionalDescription = ref(true);

const additionalServicesOpen = reactive({
  duration: true,
});

watch(
  // watch all the stores used in the page
  () => document.value.fields,
  (curr, prev) => {
    // needed to not trigger the watcher when raw document load
    if (curr === prev) {
      legacyStore.hasChanges = true;
    }
  },
  {
    deep: true,
  }
);
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
