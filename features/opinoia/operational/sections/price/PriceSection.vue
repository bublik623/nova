<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import SaveAndGoNext from "@/features/experience-shared/components/SaveAndGoNext.vue";
import PriceTable from "./table/PriceTable.vue";
import { usePriceSection } from "./usePriceSection";
import { useOptionsQuery } from "../options/queries/useOptionsQuery";
import { useMasterData } from "@/stores/master-data";
import { useExperienceLanguagesQuery } from "../configuration/queries/useExperienceLanguagesQuery";
import { useGetPaxQuery } from "@/features/masterdata/api/useMasterdataQuery";
import { useOptionsPaxesQueries } from "../options/queries/useOptionsPaxesQueries";
import { useGetExperiencePaxesQuery } from "@/features/experience-raw/api/useExperiencePaxesQuery";

export type PriceSectionProps = {
  experienceId: string;
};

const props = defineProps<PriceSectionProps>();
const { $t } = useNuxtApp();

const { lastSavedData, workingCopyData, canSave, isSaving, save } = usePriceSection();

const masterdata = useMasterData();
const optionsQuery = useOptionsQuery(ref(props.experienceId));
const optionList = computed(
  () => optionsQuery.data.value?.map((option) => ({ label: option.code!, value: option.id! })) ?? []
);
const currencyList = computed(() =>
  masterdata.currencies.map((currency) => ({ label: currency.code, value: currency.code }))
);
const experienceLanguagesQuery = useExperienceLanguagesQuery(ref(props.experienceId));
const languageList = computed(
  () =>
    experienceLanguagesQuery.data.value?.languages?.map((language) => ({
      label: $t(`common.language.${language}`),
      value: language,
    })) ?? []
);
const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const dayList = computed(() => days.map((day) => ({ label: $t(`common.${day.toLowerCase()}`), value: day })));

// data for the pax dropdown
const { data: dataPaxes } = useGetPaxQuery(ref("PERSON"));
const paxData = computed(() => dataPaxes.value?.map((pax) => ({ code: pax.name, description: pax.description })) ?? []);

// formatted option paxes data
const optionIds = computed(() => optionsQuery.data.value?.map((option) => option.id!) ?? []);
const optionsPaxesQueries = useOptionsPaxesQueries(optionIds);
const optionPaxesMap = computed<Map<string, string[]>>(() => {
  const filteredPaxes = optionsPaxesQueries.value.map((query) => query.data).filter((optionPaxes) => !!optionPaxes);

  const map = new Map<string, string[]>();

  filteredPaxes
    .filter((item) => !!item)
    .forEach((item) => {
      const optionId = item.optionId;
      const paxCodes = item.optionPaxes.pax_list.map((pax) => pax.pax_code);
      map.set(optionId, paxCodes);
    });

  return map;
});

// experience paxes data
const experiencePaxesQuery = useGetExperiencePaxesQuery(ref(props.experienceId));
const experiencePaxes = computed(() => experiencePaxesQuery.data.value ?? []);

async function saveAndNavigateToNextSection() {
  await save();
  navigateToNextSection();
}

function navigateToNextSection() {
  // TODO: add implementation
}
</script>

<template>
  <div class="flex flex-col justify-between py-4">
    <FormSection id="opinoia.price-section.fields.price" required :show-description="false">
      <PriceTable
        :experience-id
        :prices="workingCopyData.prices"
        :option-list="optionList"
        :currency-list="currencyList"
        :language-list="languageList"
        :day-list="dayList"
        :last-saved-prices="lastSavedData.prices"
        :invalid-prices-id="[]"
        :pax-data="paxData"
        :option-paxes="optionPaxesMap"
        :experience-paxes="experiencePaxes"
      />
    </FormSection>
    <div class="flex flex-row justify-end">
      <SaveAndGoNext
        :readonly="false"
        :disabled="!canSave"
        :loading="isSaving"
        @click:save-and-navigate="saveAndNavigateToNextSection"
        @click:navigate="navigateToNextSection"
      />
    </div>
  </div>
</template>
