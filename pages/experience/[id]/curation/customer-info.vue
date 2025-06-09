<template>
  <DocumentFormSection
    v-show="isAllView"
    id="emergency_contact"
    :required="bookingInfoFields.emergency_contact.required"
    :slot-max-width="300"
  >
    <NovaPhoneNumber
      v-model:number="bookingInfoFields.emergency_contact.value.number"
      v-model:prefix="bookingInfoFields.emergency_contact.value.country_calling_code"
      :countries="masterDataStore.geoCountries"
      :placeholders="{
        phoneNumberInput: $t('experience.raw.customer.info.phone.placeholder'),
        phonePrefixSearch: $t('experience.raw.customer.info.phone.prefix.search'),
        noItemFound: $t('common.search.no-items-found'),
        readonlyEmpty: $t('common.no-content'),
      }"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
    />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="voucher_type" :required="bookingInfoFields.voucher_type.required">
    <NovaInputRadioGroup
      v-model="bookingInfoFields.voucher_type.value"
      data-testid="voucher-type-field"
      layout="vertical"
      name="voucher_type.options"
      :options="voucherTypeOptions"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      :readonly-placeholder="$t('common.no-content')"
    >
      <template #default="{ option }">
        {{ option.label }}

        <NovaLabel v-if="option.value === 'MOBILE'" class="ml-2" size="sm" theme="secondary">
          {{ $t("common.recommended") }}
        </NovaLabel>
      </template>
    </NovaInputRadioGroup>
  </DocumentFormSection>

  <DocumentFormSection id="info_voucher" :required="rawDocument.fields.info_voucher.required">
    <div v-show="showRawFields" class="mb-10">
      <div class="mb-2">
        <NovaLabel theme="middle-grey">{{ $t("experience.curation.view-type.raw") }}</NovaLabel>
      </div>
      <NovaTextEditor
        v-model="rawDocument.fields.info_voucher.value"
        readonly
        :placeholder="$t('experience.voucher.editor.placeholder')"
        data-testid="info_voucher-textarea"
        ><DiffHtml
          v-if="curationStore.hasDiff"
          :value="rawDocument.fields.info_voucher.value"
          :old-value="rawSnapshot?.raw?.commercial?.info_voucher ?? ''"
        />
        <span class="text-text-70 font-italic">{{ handleNoContent }}</span>
      </NovaTextEditor>
    </div>
    <div class="mb-2">
      <NovaLabel theme="teal-green">{{ $t("experience.curation.view-type.commercial") }}</NovaLabel>
    </div>
    <NovaTextEditor
      v-model="curationDocument.fields.info_voucher.value"
      :placeholder="$t('experience.voucher.editor.placeholder')"
      data-testid="info_voucher-textarea"
      :readonly="isReadonly"
    />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import { saveCurationContent } from "@/features/experience-curation/lib/saveCurationContent";
import { CurationPageEvents, CurationPageProps } from "@/features/experience-curation/types";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";
import { useBookingInformationStore } from "@/features/experience-shared/stores/useBookingInformationStore";
import { useExperienceCuration } from "@/stores/experience-curation";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useMasterData } from "@/stores/master-data";
import { BookingInformation } from "@/types/generated/MetadataExperiencesApi";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import NovaPhoneNumber from "@/ui-kit/NovaPhoneNumber/NovaPhoneNumber.vue";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import DiffHtml from "@/features/experience-shared/components/DiffHtml.vue";
import { storeToRefs } from "pinia";
import { areNonCommercialFieldsEditableForUser, viewIsTypeAll } from "@/features/experience-curation/lib/viewTypeUtils";

const { $t } = useNuxtApp();
const props = defineProps<CurationPageProps>();
const emit = defineEmits<CurationPageEvents>();
const bookingInfoStore = useBookingInformationStore();
const masterDataStore = useMasterData();
const { bookingInfoFields } = storeToRefs(bookingInfoStore);
const curationStore = useExperienceCuration();
const experienceRaw = useExperienceRaw();
const { params } = useRoute();
const id = params.id as string;
const rawDocument = computed(() => experienceRaw.rawContents[id]);
const curationDocument = computed(() => curationStore.curationDocuments[id]);
const rawSnapshot = computed(() => curationStore.rawSnapshot);
const isAllView = computed(() => viewIsTypeAll(props.selectedView));
const areNonCommercialFieldsReadonly = computed(() => !areNonCommercialFieldsEditableForUser());

if (document == null) {
  throw new Error(`Could not load raw document with id: ${id}, make sure it's loaded in the store.`);
}

const voucherTypeOptions: {
  label: string;
  value: BookingInformation["voucher_type"];
}[] = [
  { label: $t("experience.voucher-type.option.mobile"), value: "MOBILE" },
  { label: $t("experience.voucher-type.option.printed"), value: "PRINTED" },
];

const handleNoContent = computed(() => {
  const infoVoucherValue = rawDocument.value?.fields.info_voucher?.value;
  const oldInfoVoucherValue = rawSnapshot.value?.raw?.commercial?.info_voucher;
  return !infoVoucherValue && !oldInfoVoucherValue ? $t("common.no-content") : "";
});

watch(
  // watch all the stores used in the page
  [() => curationDocument.value.fields, () => bookingInfoFields.value],
  (curr, prev) => {
    // needed to not trigger the watcher when curation document load
    if (curr[0] === prev[0] && !curationStore.isSaving) {
      emit("hasUnsavedChanges", true);
    }
  },
  {
    deep: true,
  }
);

// Saving
const stopBus = eventBusCuration.on(
  async (
    event,
    opt: { nextSection: string; publish: boolean; redirect: boolean; translate: boolean; force: boolean }
  ) => {
    if (event === "SAVE") {
      saveCurationContent({
        promise: () => bookingInfoStore.saveBookingInfo(id),
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
