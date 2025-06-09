<script setup lang="ts">
import FieldAdditionalCities from "@/features/experience-shared/components/FieldAdditionalCities.vue";
import FieldAdditionalCitiesList from "@/features/experience-shared/components/FieldAdditionalCitiesList.vue";
import { City } from "@/types/generated/GeoMasterDataApi";

const cities = useMasterData().geoCities;

const selectedCities = ref<City[]>([]);
</script>

<template>
  <div class="p-4">
    <div class="mb-4 max-w-xl">
      <h2 class="text-xl font-semibold mb-2">Additional Cities</h2>
      <FieldAdditionalCities v-model="selectedCities" :options="cities" />
    </div>

    <div class="mb-4 max-w-xl">
      <FieldAdditionalCitiesList v-model="selectedCities" />
    </div>

    <div class="mt-16">
      <h2 class="text-xl font-semibold mb-2">Selected Cities (Raw Data):</h2>
      <pre
        v-if="selectedCities.length > 0"
        class="bg-gray-100 p-3 rounded-md whitespace-pre-wrap break-words text-xs"
        >{{ JSON.stringify(selectedCities, null, 2) }}</pre
      >
      <p v-else class="text-gray-500">No cities selected</p>
    </div>
  </div>
</template>
