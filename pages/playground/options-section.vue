<script setup lang="ts">
import OptionsSection from "@/features/opinoia/operational/sections/options/OptionsSection.vue";
import { useOptionsSection } from "@/features/opinoia/operational/sections/options/useOptionsSection";

const experienceId = ref("");
const { setExperienceId, workingCopyData } = useOptionsSection();

watch(experienceId, (newExperienceIdValue) => setExperienceId(newExperienceIdValue));
</script>

<template>
  <div class="p-6 flex flex-col">
    <div class="mb-5">
      <label for="experience-id">experience id:</label>
      <input id="experience-id" type="text" class="border-2 ml-2" v-model="experienceId" />
    </div>
    <hr />
    <OptionsSection class="my-5" :experienceId></OptionsSection>
    <hr />
    <div class="mt-5">
      <pre class="mb-2">experience-id: {{ experienceId }}</pre>
      <pre>options: {{ JSON.stringify(workingCopyData, null, 2) }}</pre>
    </div>
  </div>
</template>
