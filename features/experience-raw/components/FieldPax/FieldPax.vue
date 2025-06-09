<script setup lang="ts">
import type { Pax as ExperiencePax } from "@/types/generated/OfferServiceApi";
import type { Pax as MasterDataPax } from "@/types/generated/ExperienceMasterDataApi";
import PaxTypeItem from "./FieldPaxItem.vue";
import { useGetPaxQuery } from "@/features/masterdata/api/useMasterdataQuery";
import { mapMasterdataPaxToExperiencePax } from "./field-pax-utils";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import type { PaxErrorMap } from "@/features/experience-shared/schemas/experience-paxes-schema";

defineProps<{ errors?: PaxErrorMap }>();

const selectedPaxList = defineModel<ExperiencePax[]>({ required: true, default: () => [] });

const { data: dataPaxes } = useGetPaxQuery(ref("PERSON"));
const experiencePaxes = ref<Record<string, ExperiencePax>>({});
const selectedPaxCodes = computed(() => selectedPaxList.value.map((pax) => pax.pax_code));

function init(dataPaxes: MasterDataPax[]) {
  // map all masterdata pax types to offer pax types
  dataPaxes.forEach((paxType) => {
    if (!experiencePaxes.value[paxType.name]) {
      experiencePaxes.value[paxType.name] = mapMasterdataPaxToExperiencePax(paxType);
    }
  });
  // Also ensure all selected pax are in the config map
  selectedPaxList.value.forEach((pax) => {
    experiencePaxes.value[pax.pax_code] = pax;
  });
}

function handlePaxSelection(paxCode: string, selected: boolean) {
  if (selected) {
    selectedPaxList.value = [...selectedPaxList.value, experiencePaxes.value[paxCode]];
  } else {
    selectedPaxList.value = selectedPaxList.value.filter((pax) => pax.pax_code !== paxCode);
  }
}

function handlePaxConfigUpdate(paxCode: string, updatedPax: ExperiencePax) {
  experiencePaxes.value[paxCode] = updatedPax;
  selectedPaxList.value = selectedPaxList.value.map((pax) => (pax.pax_code === paxCode ? updatedPax : pax));
}

// Initialize pax configurations when pax types are loaded
watch(
  dataPaxes,
  () => {
    if (!dataPaxes.value?.length) {
      return;
    }
    init(dataPaxes.value);
  },
  { immediate: true }
);

// Update config map when selected pax list changes
watch(selectedPaxList, () => {
  selectedPaxList.value.forEach((pax) => {
    experiencePaxes.value[pax.pax_code] = pax;
  });
});
</script>

<template>
  <div>
    <NovaAlert
      v-show="errors?.pax_list?.errors?.includes('overlap')"
      status="error"
      size="sm"
      variant="solid"
      class="mb-4"
      data-testid="pax-error-overlapping-age-range"
      >{{ $t("experience.holder.holders.error.overlapping") }}
    </NovaAlert>
    <div
      data-testid="field-pax"
      class="border border-neutral-60 divide-y divide-neutral-60 rounded-lg px-2 bg-white shadow-sm"
    >
      <PaxTypeItem
        v-for="masterDataPax in dataPaxes"
        :key="masterDataPax.name"
        :model-value="experiencePaxes[masterDataPax.name]"
        :is-selected="selectedPaxCodes.includes(masterDataPax.name)"
        :errors="errors?.[masterDataPax.name]"
        :master-data-pax="masterDataPax"
        @update:is-selected="(selected) => handlePaxSelection(masterDataPax.name, selected)"
        @update:model-value="(pax) => handlePaxConfigUpdate(masterDataPax.name, pax)"
      />
    </div>
  </div>
</template>
