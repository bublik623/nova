<script setup lang="ts">
import type { Pax as ExperiencePax } from "@/types/generated/OfferServiceApi";
import FieldPax from "@/features/experience-raw/components/FieldPax/FieldPax.vue";

const paxList = ref<ExperiencePax[]>([
  {
    pax_type: "PERSON",
    pax_code: "adult",
    all_ages: false,
    age_from: 33,
    age_to: 44,
    free_of_charge: false,
  },
]);
</script>

<template>
  <div class="mx-auto max-w-6xl p-6">
    <div class="p-6 rounded-lg">
      <h2 class="text-lg font-medium mb-2">Pax Types</h2>
      <FieldPax v-model="paxList" />
    </div>
  </div>
  <pre>{{ JSON.stringify(paxList, null, 2) }}</pre>
</template>
