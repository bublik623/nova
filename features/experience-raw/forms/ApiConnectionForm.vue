<template>
  <template v-if="apiConnectionStore.isInitialized">
    <FormSection
      id="raw-event-selection-form"
      :required="apiConnectionStore.fields.event.required"
      :slot-max-width="700"
      show-description
    >
      <EventField
        v-model:applied-event="apiConnectionStore.fields.event.value"
        :supplier-id="selectedSupplierId"
        :readonly
      />
    </FormSection>
  </template>
</template>

<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import EventField from "../components/ApiConnection/EventField.vue";
import { useRawApiConnectionStore } from "@/features/experience-raw/stores/useRawApiConnectionStore";
import { useDistributionContentStore } from "@/features/experience-shared/stores/useDistributionContentStore";

interface Props {
  experienceId: string;
  readonly: boolean;
}

defineProps<Props>();

const apiConnectionStore = useRawApiConnectionStore();
const distributionContentStore = useDistributionContentStore();
const selectedSupplierId = computed(() => distributionContentStore.values.supplier_id || "");
</script>
