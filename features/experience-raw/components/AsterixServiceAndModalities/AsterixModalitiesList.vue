<template>
  <div class="flex flex-row justify-between my-3">
    <span class="content-center text-xs" test-id="selected-modalities-count">
      {{ modalities.length ?? 0 }} {{ $t("common.selected") }}
    </span>
    <NovaButton
      v-if="!readonly"
      size="xs"
      variant="underlined"
      test-id="clear-all"
      style="margin: 0; padding: 0"
      @click="store.removeAllModalities(serviceAndModalitiesId)"
      >{{ $t("common.dropdown.clear.button") }}</NovaButton
    >
  </div>
  <ul class="bg-neutral-0 border p-4 grid gap-1">
    <li v-for="modality in modalities" :key="modality.code" class="flex flex-row justify-between list-element">
      <span class="content-center text-sm" data-testid="selected-modality-name">{{
        modality.code + " - " + modality.default_name
      }}</span>
      <NovaButtonIcon
        v-if="!readonly"
        name="trash"
        :test-id="'remove-modality-' + modality.code"
        @click="store.removeModality(serviceAndModalitiesId, modality)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useRawServiceAndModalitiesStore } from "../../stores/useRawServiceAndModalitiesStore";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
export interface Props {
  serviceAndModalitiesId: string;
  readonly: boolean;
}

const props = defineProps<Props>();
const store = useRawServiceAndModalitiesStore();

const modalities = computed(() =>
  store.selectedServicesAndModalities
    .filter((selectedServiceAndModalities) => selectedServiceAndModalities.id === props.serviceAndModalitiesId)
    .flatMap((selectedServiceAndModalities) => selectedServiceAndModalities.modalities)
);
</script>

<style lang="scss">
@import "@/assets/scss/utilities";

.border {
  border: var(--border-default);
  border-radius: var(--border-radius-default);
}

.list-element {
  &:not(:last-child) {
    border-bottom: var(--border-default);
  }
}
</style>
