<script setup lang="ts">
import FieldVenues from "@/features/experience-shared/components/FieldVenues.vue";
import FieldVenuesList from "@/features/experience-shared/components/FieldVenuesList.vue";
import { Venue } from "@/types/generated/GeoMasterDataApi";
import { dummyVenuesData } from "@/utils/__test__/dummyData";
const venues = dummyVenuesData;

const selectedVenues = ref<string[]>([]);
const selectedVenuesList = computed(() => {
  return selectedVenues.value
    .map((venueCode) => venues.find((v) => v.code === venueCode))
    .filter((v): v is Venue => v !== undefined);
});
function handleRemove(venue: Venue) {
  selectedVenues.value = selectedVenues.value.filter((v) => v !== venue.code);
}
</script>

<template>
  <div class="p-4">
    <div class="mb-4 max-w-xl">
      <h2 class="text-xl font-semibold mb-2">Venues</h2>
      <FieldVenues v-model="selectedVenues" :options="venues" />
    </div>

    <div class="mb-4 max-w-xl">
      <FieldVenuesList :items="selectedVenuesList" @remove="handleRemove" />
    </div>

    <div class="mt-16">
      <h2 class="text-xl font-semibold mb-2">Selected Venues (Raw Data):</h2>
      <pre
        v-if="selectedVenues.length > 0"
        class="bg-gray-100 p-3 rounded-md whitespace-pre-wrap break-words text-xs"
        >{{ JSON.stringify(selectedVenues, null, 2) }}</pre
      >
      <p v-else class="text-gray-500">No venues selected</p>
    </div>
  </div>
</template>
