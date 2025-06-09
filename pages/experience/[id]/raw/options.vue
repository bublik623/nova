<template>
  <DocumentFormSection
    id="raw.options.settings"
    data-testid="raw-options-settings"
    :required="document.fields.options?.required"
  >
    <OptionsRecap :readonly="isReadonly" />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import { useExperienceRaw } from "@/stores/experience-raw";
import OptionsRecap from "@/features/experience-calendar/components/OptionsRecap.vue";
import { hasPermission } from "@/features/roles/lib/has-permission";

const experienceRaw = useExperienceRaw();

const { params } = useRoute();
const id = params.id as string;

const document = computed(() => experienceRaw.rawContents[id]);

const isReadonly = !hasPermission("experience.options.canWrite");
</script>
