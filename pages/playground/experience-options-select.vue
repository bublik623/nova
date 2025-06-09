<script setup lang="ts">
import ExperienceOptionsSelect from "@/features/opinoia/operational/shared/experience-options/ExperienceOptionsSelect.vue";

const experienceId: Ref<string | undefined> = ref(undefined);
const selectedValue: Ref<string | undefined> = ref(undefined);
</script>
<template>
  <div class="flex flex-col p-4">
    <div class="flex flex-row mb-5">
      <label for="experience-id" class="mr-3">ExperienceId:</label>
      <input id="experience-id" v-model="experienceId" class="border" type="text" />
    </div>
    <div class="flex flex-row mb-5">
      <table class="w-full border border-collapse">
        <thead>
          <tr>
            <th class="border p-2">column title</th>
            <th class="border p-2">column title</th>
            <th class="border p-2">Options</th>
            <th class="border p-2">column title</th>
            <th class="border p-2">column title</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-2 p-2 p-2">...</td>
            <td class="border p-2 p-2 p-2">...</td>
            <td class="border p-2 p-2 p-2">
              <ExperienceOptionsSelect v-model:selected="selectedValue" :experience-id />
            </td>
            <td class="border p-2 p-2 p-2">...</td>
            <td class="border p-2 p-2 p-2">...</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex flex-row">
      <span class="mr-3">selected value:</span>
      <pre>{{ selectedValue }}</pre>
    </div>
  </div>
</template>
