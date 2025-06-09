<script setup lang="ts">
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import type { Pax as MasterDataPax } from "@/types/generated/ExperienceMasterDataApi";
import type { Pax as ExperiencePax } from "@/types/generated/OfferServiceApi";

const props = defineProps<{
  masterDataPax: MasterDataPax;
  errors?: Record<keyof ExperiencePax, string[]>;
}>();
const item = defineModel<ExperiencePax>({ required: true, default: () => ({}) });
const isSelected = defineModel<boolean>("isSelected", { required: true, default: false });

function updateConfig<K extends keyof ExperiencePax>(field: K, value: ExperiencePax[K]) {
  const updatedConfig = {
    ...item.value,
    [field]: value,
  };

  item.value = updatedConfig;
}

function toggleAllAges(value: boolean) {
  const updatedConfig = {
    ...item.value,
    all_ages: value,
    age_from: value ? undefined : 0,
    age_to: value ? undefined : 0,
  };

  item.value = updatedConfig;
}

const showAllAgesToggle = computed(() => "all_ages" in props.masterDataPax);
const isAllAgesDisabled = computed(() => !isSelected.value);
const isAgeRangeDisabled = computed(() => !isSelected.value || item.value.all_ages);
const isFreeOfChargeDisabled = computed(() => !isSelected.value);

const ageFromValue = computed(() => item.value.age_from ?? 0);
const ageToValue = computed(() => item.value.age_to ?? 0);
</script>

<template>
  <div class="flex items-center justify-center px-2 py-[9px]" data-testid="pax-item">
    <!-- Pax Type Selection -->
    <div class="flex items-center gap-2">
      <NovaCheckbox
        :input-props="{ id: `pax-item-${item.pax_code}-checkbox` }"
        :value="item.pax_code"
        :checked="isSelected"
        :status="isSelected ? 'checked' : 'unchecked'"
        @update:status="() => (isSelected = !isSelected)"
      />
      <label :for="`pax-item-${item.pax_code}-checkbox`" class="cursor-pointer text-sm font-normal">
        {{ masterDataPax.description }}
      </label>
    </div>

    <!-- Second Column -->
    <div class="flex items-center gap-4 flex-1 justify-end">
      <!-- All Ages Toggle -->
      <div v-if="showAllAgesToggle" class="flex items-center gap-2">
        <NovaCheckbox
          :input-props="{ id: `pax-item-${item.pax_code}-all-ages` }"
          value="all_ages"
          :status="item.all_ages ? 'checked' : 'unchecked'"
          :disabled="isAllAgesDisabled"
          @update:status="() => toggleAllAges(!item.all_ages)"
        />
        <label
          :for="`pax-item-${item.pax_code}-all-ages`"
          class="text-sm font-normal"
          :class="[
            isAllAgesDisabled ? 'cursor-not-allowed text-text-90' : 'cursor-pointer',
            item.all_ages && isSelected ? 'text-text-100' : '',
          ]"
        >
          All ages
        </label>
      </div>

      <!-- Separator -->
      <hr v-if="showAllAgesToggle" class="w-px h-6 bg-neutral-60" />

      <!-- Age Range -->
      <div class="flex items-center gap-2">
        <label
          :for="`pax-item-${item.pax_code}-age-from`"
          class="text-sm font-normal text-text-70"
          :class="[isAgeRangeDisabled ? 'cursor-not-allowed' : 'cursor-pointer']"
        >
          Age Range
        </label>
        <NovaInputNumber
          :id="`pax-item-${item.pax_code}-age-from`"
          class="!w-16"
          :model-value="ageFromValue"
          :disabled="isAgeRangeDisabled"
          :min-value="0"
          :max-value="99"
          placeholder="0"
          :is-invalid="errors?.age_from?.length ? true : false"
          @update:model-value="(value) => updateConfig('age_from', value)"
        />

        <span class="text-sm text-text-70">to</span>
        <NovaInputNumber
          :id="`pax-item-${item.pax_code}-age-to`"
          class="!w-16"
          :model-value="ageToValue"
          :disabled="isAgeRangeDisabled"
          :min-value="0"
          :max-value="99"
          placeholder="0"
          :is-invalid="errors?.age_to?.length ? true : false"
          @update:model-value="(value) => updateConfig('age_to', value)"
        />
      </div>

      <!-- Free of Charge -->
      <div class="flex items-center gap-2">
        <NovaCheckbox
          :input-props="{ id: `pax-item-${item.pax_code}-free-of-charge` }"
          value="free_of_charge"
          :status="item.free_of_charge ? 'checked' : 'unchecked'"
          :disabled="isFreeOfChargeDisabled"
          @update:status="() => updateConfig('free_of_charge', !item.free_of_charge)"
        />
        <label
          :for="`pax-item-${item.pax_code}-free-of-charge`"
          class="cursor-pointer text-sm font-normal text-text-90"
        >
          Free of charge
        </label>
      </div>
    </div>
  </div>
</template>
