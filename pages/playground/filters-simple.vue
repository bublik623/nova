<template>
  <div class="mt-10">
    <MultiSelect v-model:selected-values="selectedGames">
      <div class="flex gap-1">
        <MultiSelectCheckbox :model-value="{ label: 'Super Mario Bros', val: 'mario' }" />
        <MultiSelectItem>Super Mario Bros</MultiSelectItem>
      </div>
      <div class="flex gap-1">
        <MultiSelectCheckbox :model-value="{ label: 'GTA VI', val: 'gta6' }" />
        <MultiSelectItem>GTA VI</MultiSelectItem>
      </div>
      <div class="flex gap-1">
        <MultiSelectCheckbox :model-value="{ label: 'Doom', val: 'doom' }" />
        <MultiSelectItem>Doom</MultiSelectItem>
      </div>
      <div class="flex gap-1">
        <MultiSelectCheckbox :model-value="{ label: 'Fifa 2024', val: 'fifa24' }" />
        <MultiSelectItem>Fifa 2024</MultiSelectItem>
      </div>
      <div class="flex gap-1">
        <MultiSelectCheckbox :model-value="{ label: 'Museum of Modern Art', val: 'moma' }" />
        <MultiSelectItem>Museum of Modern Art</MultiSelectItem>
      </div>
    </MultiSelect>
    <div>
      Selected Games:
      <pre>{{ selectedGames }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MultiSelect, MultiSelectCheckbox, MultiSelectItem } from "@/features/stop-sales/components/MultiSelect";

const selectedGames = ref([
  {
    label: "Fifa 2024",
    val: "fifa24",
  },
]);
</script>
