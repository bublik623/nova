<script setup lang="ts">
import FieldListBox from "@/features/experience-shared/components/FieldListBox.vue";
import FieldListBoxItem from "@/features/experience-shared/components/FieldListBoxItem.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import { City } from "@/types/generated/GeoMasterDataApi";
import { useMasterData } from "@/stores/master-data";

defineProps<{ disabled?: boolean }>();

const selectedCities = defineModel<City[]>("modelValue", { default: () => [] });

const { getCountryByCode } = useMasterData();
const handleRemove = (city: City) => {
  selectedCities.value = selectedCities.value.filter((c) => c.code !== city.code);
};
</script>

<template>
  <FieldListBox v-if="selectedCities.length" class="px-4 max-h-[206px]" data-testid="field-selected-additional-cities">
    <FieldListBoxItem v-for="city in selectedCities" :key="city.id">
      <span class="mr-2">{{ city.name }}</span>
      <span class="text-xs text-text-80">{{ getCountryByCode(city.country_code_alpha2).name }}</span>
      <template v-if="!disabled" #actions>
        <NovaButtonIcon
          data-testid="button-remove-city"
          :size="16"
          name="trash"
          theme="dark"
          shape="square"
          @click="handleRemove(city)"
        />
      </template>
    </FieldListBoxItem>
  </FieldListBox>
</template>
