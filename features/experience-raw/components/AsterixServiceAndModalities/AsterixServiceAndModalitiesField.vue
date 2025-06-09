<template>
  <div class="p-3 border" data-testid="service-and-modalities-field">
    <DocumentFormSection
      :id="'raw-asterix-service-code'"
      class="InnerSection"
      :required="true"
      :show-description="false"
    >
      <AsterixServiceSelectInput
        :service-and-modalities-id="serviceAndModalitiesId"
        :readonly="readonly"
      ></AsterixServiceSelectInput>
    </DocumentFormSection>
    <div class="p-3 mt-4 border bg-neutral-30">
      <DocumentFormSection
        :id="'raw-asterix-modalities-codes'"
        class="InnerSection"
        :required="true"
        :show-description="false"
      >
        <AsterixModalitiesSelectInput
          v-if="!readonly"
          :service-and-modalities-id="serviceAndModalitiesId"
        ></AsterixModalitiesSelectInput>
        <AsterixModalitiesList
          v-if="hasAnySelectedModality"
          :service-and-modalities-id="serviceAndModalitiesId"
          :readonly="readonly"
        ></AsterixModalitiesList>
      </DocumentFormSection>
    </div>
    <div v-if="!readonly" class="mt-3 flex flex-row place-content-end">
      <NovaButton
        variant="text"
        size="sm"
        theme="primary"
        data-testid="delete-service-and-modalities"
        style="margin: 0; padding: 5px"
        @click="deleteServiceAndRelatedModalities()"
      >
        {{ $t("common.delete") }}<NovaIcon name="trash" class="inline-block ml-1" />
      </NovaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import AsterixServiceSelectInput from "./AsterixServiceSelectInput.vue";
import AsterixModalitiesSelectInput from "./AsterixModalitiesSelectInput.vue";
import AsterixModalitiesList from "./AsterixModalitiesList.vue";
import { useRawServiceAndModalitiesStore } from "../../stores/useRawServiceAndModalitiesStore";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";

export interface Props {
  serviceAndModalitiesId: string;
  readonly: boolean;
}

const props = defineProps<Props>();

const servicesAndModalitiesStore = useRawServiceAndModalitiesStore();
const hasAnySelectedModality = computed(() =>
  servicesAndModalitiesStore.hasAnySelectedModality(props.serviceAndModalitiesId)
);

function deleteServiceAndRelatedModalities() {
  servicesAndModalitiesStore.remove(props.serviceAndModalitiesId);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.border {
  border: var(--border-default);
  border-radius: var(--border-radius-default);
}

.InnerSection {
  :deep(p) {
    font-size: 14px;
  }
}
</style>
