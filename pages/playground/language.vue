<script setup lang="ts">
import OptionLanguagesDropdown, {
  LanguageOption,
} from "@/features/experience-calendar/components/OptionLanguagesDropdown.vue";
import { mapLanguagesPayloadToOption } from "@/features/experience-calendar/utils/option-language-utils";

const { availableLanguages } = useMasterData();
const items = computed<LanguageOption[]>(() => {
  return Array.from(availableLanguages)
    .map((language) => ({ language: language }))
    .map(mapLanguagesPayloadToOption);
});
const selectedLanguages = ref<LanguageOption[]>([mapLanguagesPayloadToOption({ language: "en" })]);
const isLoading = ref(false);
const isDisabled = ref(false);
</script>

<template>
  <div class="p-4">
    <div class="flex flex-col gap-4">
      <OptionLanguagesDropdown
        v-model:selected-items="selectedLanguages"
        v-model:is-loading="isLoading"
        v-model:disabled="isDisabled"
        :model-value="items"
      />
    </div>
  </div>
</template>
