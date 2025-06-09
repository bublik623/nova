<template>
  <DocumentFormSection id="description" :required="curationDocument.fields.description.required">
    <div v-show="showRawFields">
      <div class="mb-2">
        <NovaLabel theme="middle-grey">{{ $t("experience.curation.view-type.raw") }}</NovaLabel>
      </div>
      <NovaTextEditor
        v-model="rawDocument.fields.description.value"
        readonly
        :placeholder="$t('experience.description.editor.placeholder')"
        :data-testid="`raw-description`"
        ><DiffHtml
          v-if="curationStore.hasDiff"
          :value="rawDocument.fields.description.value"
          :old-value="rawSnapshot?.raw?.commercial?.description ?? ''"
      /></NovaTextEditor>
    </div>

    <div class="mb-2 mt-8">
      <NovaLabel theme="teal-green">{{ $t("experience.curation.view-type.commercial") }}</NovaLabel>
    </div>
    <NovaTextEditor
      v-model="curationDocument.fields.description.value"
      :placeholder="$t('experience.description.editor.placeholder')"
      :data-testid="`editorial-description`"
      :readonly="isReadonly"
    />
  </DocumentFormSection>

  <DocumentFormSection id="seo_description" :required="curationDocument.fields.seo_description.required">
    <div class="mb-2">
      <NovaLabel theme="teal-green">{{ $t("experience.curation.view-type.commercial") }}</NovaLabel>
    </div>
    <NovaTextEditor
      v-model="curationDocument.fields.seo_description.value"
      :data-testid="`editorial-seo-description`"
      :placeholder="$t('experience.seo_description.title')"
      :readonly="isReadonly"
    />
  </DocumentFormSection>

  <DocumentFormSection id="additional_description" :required="curationDocument.fields.additional_description.required">
    <NovaButton
      v-if="
        !rawDocument.fields.additional_description.value &&
        !curationDocument.fields.additional_description.value &&
        hideAdditionalDescription &&
        !isReadonly
      "
      data-testid="editorial-additional-description-button"
      @click="hideAdditionalDescription = false"
      >{{ $t("experience.additional_description.btn.add") }}</NovaButton
    >
    <template v-else>
      <div v-show="showRawFields" class="mb-4">
        <div class="mb-2">
          <NovaLabel theme="middle-grey">{{ $t("experience.curation.view-type.raw") }}</NovaLabel>
        </div>
        <NovaTextEditor
          v-model="rawDocument.fields.additional_description.value"
          :readonly="true"
          :placeholder="$t('experience.additional_description.editor.placeholder')"
          data-testid="raw-additional-description"
          ><DiffHtml
            v-if="curationStore.hasDiff"
            :value="rawDocument.fields.additional_description.value"
            :old-value="rawSnapshot?.raw?.commercial?.additional_description ?? ''"
          />
        </NovaTextEditor>
      </div>

      <div class="mb-2">
        <NovaLabel theme="teal-green">{{ $t("experience.curation.view-type.commercial") }}</NovaLabel>
      </div>
      <NovaTextEditor
        v-model="curationDocument.fields.additional_description.value"
        :placeholder="$t('experience.additional_description.editor.placeholder')"
        :readonly="isReadonly"
        data-testid="editorial-additional-description"
      />
    </template>
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="features">
    <NovaCheckboxGroup
      v-model="curationDocument.fields.features.value"
      class="experience__features"
      :options="featuresOptions"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
    />
  </DocumentFormSection>

  <template v-for="keys in highlightsKeys" :key="keys.app">
    <DocumentFormSection :id="keys.app" :required="curationDocument.fields[keys.app].required">
      <div class="form__horizontal-container">
        <div v-show="showRawFields">
          <div class="mb-2">
            <NovaLabel theme="middle-grey">{{ $t("experience.curation.view-type.raw") }}</NovaLabel>
          </div>
          <RawHighlights
            v-model="rawDocument.fields[keys.app].value"
            :hierarchical-groups="masterData.hierarchicalGroups"
            :data-testid="`raw-${keys.app}`"
            :masterdata-options="masterData[keys.store]"
            :options="{
              title: `experience.${keys.app}.title`,
              placeholder: $t(`experience.${keys.app}.creation.placeholder`),
            }"
            :readonly="true"
            :show-diff="curationStore.hasDiff"
            :diff-new-value="rawDocument.fields[keys.app].value"
            :diff-old-value="curationStore.diff[keys.app]"
          />
        </div>
        <div>
          <div class="mb-2">
            <NovaLabel theme="teal-green">{{ $t("experience.curation.view-type.commercial") }}</NovaLabel>
          </div>

          <RawHighlights
            v-model="curationDocument.fields[keys.app].value"
            :hierarchical-groups="masterData.hierarchicalGroups"
            :data-testid="`curation-${keys.app}`"
            :masterdata-options="masterData[keys.store]"
            :options="{
              title: `experience.${keys.app}.title`,
              placeholder: $t(`experience.${keys.app}.creation.placeholder`),
            }"
            :readonly="isReadonly"
          />
        </div>
      </div>
    </DocumentFormSection>
  </template>

  <DocumentFormSection
    v-show="isAllView"
    id="duration"
    :required="curationDocument.fields.additional_services.required"
  >
    <DocumentAdditionalServices
      id="duration-curation"
      v-model="curationDocument.fields.additional_services.value"
      :style="{ maxWidth: '425px' }"
      :additional-services="masterData.getAdditionalServicesByFGCode('DURATION')"
      :open="additionalServicesOpen.duration"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      @toggle:open="additionalServicesOpen.duration = !additionalServicesOpen.duration"
    />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import { useExperienceCuration } from "@/stores/experience-curation";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useMasterData } from "@/stores/master-data";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";
import { saveCurationContent } from "@/features/experience-curation/lib/saveCurationContent";
import RawHighlights from "@/features/experience-raw/components/RawHighlights.vue";
import { premadeApiKeys } from "@/features/experience-highlights/lib/get-all-premade-highlights";
import { CurationPageEvents, CurationPageProps } from "@/features/experience-curation/types";
import DiffHtml from "@/features/experience-shared/components/DiffHtml.vue";
import NovaCheckboxGroup from "@/ui-kit/NovaCheckboxGroup/NovaCheckboxGroup.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import { areNonCommercialFieldsEditableForUser, viewIsTypeAll } from "@/features/experience-curation/lib/viewTypeUtils";

const props = defineProps<CurationPageProps>();
const emit = defineEmits<CurationPageEvents>();

const masterData = useMasterData();
const route = useRoute();
const id = route.params.id as string;
const rawStore = useExperienceRaw();
const curationStore = useExperienceCuration();
const rawSnapshot = computed(() => curationStore.rawSnapshot);
const rawDocument = computed(() => rawStore.rawContents[id]);
const curationDocument = computed(() => curationStore.curationDocuments[id]);
const isAllView = computed(() => viewIsTypeAll(props.selectedView));
const areNonCommercialFieldsReadonly = computed(() => !areNonCommercialFieldsEditableForUser());

const highlightsKeys = premadeApiKeys;

const hideAdditionalDescription = ref(true);

const additionalServicesOpen = reactive({
  duration: true,
});

const featuresOptions = computed(() =>
  masterData.getAdditionalServicesByFGCode("FEATURES").map((i) => ({
    label: i.name,
    value: i.code,
  }))
);

watch(
  // watch all the stores used in the page
  () => curationDocument.value.fields,
  (curr, prev) => {
    // needed to not trigger the watcher when curation document load
    if (curr === prev && !curationStore.isSaving) {
      emit("hasUnsavedChanges", true);
    }
  },
  {
    deep: true,
  }
);

// Saving
const stopBus = eventBusCuration.on(
  async (event, opt: { nextSection: string; publish: boolean; redirect: boolean; translate: boolean; force: true }) => {
    if (event === "SAVE") {
      saveCurationContent({
        afterSaving: () => {
          eventBusCuration.emit("SAVED", opt);
        },
        id,
        nextSection: opt?.nextSection,
        redirect: opt?.redirect,
        translate: opt?.translate,
        publish: opt?.publish,
        force: opt?.force,
      });
    }
  }
);
onBeforeUnmount(() => stopBus());
</script>
