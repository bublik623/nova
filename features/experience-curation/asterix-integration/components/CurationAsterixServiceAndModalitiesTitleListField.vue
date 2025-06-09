<template>
  <AsterixServiceAndModalitiesTitleListField
    :reference-value="referenceValue ?? []"
    :target-value="targetValue"
    :readonly="readonly"
    :show-reference="showReference"
    @update:value="(newValue) => $emit('update:value', newValue)"
  >
    <template #reference-label>
      <NovaLabel theme="middle-grey" class="grow-0">{{ $t("common.raw") }}</NovaLabel>
    </template>
    <template #target-label>
      <NovaLabel theme="teal-green" class="grow-0">Commercial</NovaLabel>
    </template>
  </AsterixServiceAndModalitiesTitleListField>
</template>
<script setup lang="ts">
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import AsterixServiceAndModalitiesTitleListField, {
  AsterixServiceAndModalitiesTitleListFieldProps,
  AsterixServiceAndModalitiesTitleListFieldEvents,
} from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/components/AsterixServiceAndModalitiesTitleListField.vue";
import { useServiceAndModalitiesTitleListQuery } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/queries/useServiceAndModalitiesTitleListQuery";

export type CurationAsterixServiceAndModalitiesTitleListFieldProps = Omit<
  AsterixServiceAndModalitiesTitleListFieldProps,
  "referenceValue"
>;

const props = defineProps<CurationAsterixServiceAndModalitiesTitleListFieldProps>();
defineEmits<AsterixServiceAndModalitiesTitleListFieldEvents>();

const serviceCodes = computed(() => props.targetValue?.map((item) => item.serviceCode) ?? []);

const { data: referenceValue } = useServiceAndModalitiesTitleListQuery(serviceCodes);
</script>
