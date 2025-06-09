<template>
  <div class="page-content flex flex-col">
    <form @submit.prevent>
      <label for="experience-id">Experience ID:</label>
      <input type="text" name="experience-id" :value="experienceId" @input="updateExperienceId" />
    </form>

    <h1>Raw snapshots</h1>
    <div class="flex flex-row">
      <div class="flex flex-col w-1/2">
        <h3>Raw Snapshots</h3>
        <ol type="1">
          <li v-for="snapshot in rawSnapshots" :key="snapshot.id">
            <pre>{{ snapshot }}</pre>
          </li>
        </ol>
      </div>
    </div>

    <h1>Snapshots</h1>
    <div class="flex flex-row">
      <div class="flex flex-col w-1/2">
        <h3>Snapshots</h3>
        <ol type="1">
          <li v-for="snapshot in snapshots" :key="snapshot.id">
            <pre>{{ snapshot }}</pre>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { computedAsync } from "@vueuse/core";

const experienceRawApi = useExperienceRawApi();

const experienceId = ref<string>("");
const rawSnapshots = computedAsync(async () => {
  if (experienceId.value == "") return [];

  const response = await experienceRawApi.getAllRawSnapshots(experienceId.value);
  return response.data;
});

const snapshots = computedAsync(async () => {
  if (experienceId.value == "") return [];

  const response = await experienceRawApi.getAllTranslationSnapshots(experienceId.value, "en");
  return response.data;
});

const updateExperienceId = (event: Event) => {
  const inputValue = (event.target as { value: string } | null)?.value ?? "";
  experienceId.value = inputValue;
};
</script>

<style lang="scss" scoped>
.page-content {
  margin: 50px;
}

form {
  margin: 30px 0;
}

label {
  font-size: 1.1rem;
  margin-right: 20px;
}

input {
  border: 1px solid #000;
  height: 1.5rem;
  width: 400px;
  text-align: center;
}

h1 {
  font-weight: bold;
  font-size: 2rem;
  margin-top: 30px;
  margin-bottom: 20px;
}

ol {
  list-style: decimal outside none;
  padding-inline-start: 40px;
  padding-left: 40px;
  margin: 16px 0 30px;
}

pre {
  border: 1px solid #000;
  font-size: 0.7rem;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}
</style>
