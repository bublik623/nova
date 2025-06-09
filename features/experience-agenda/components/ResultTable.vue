<template>
  <NovaCollapse :model-value="true">
    <template #title>
      <NovaCheckbox
        v-if="!readonly"
        class="mr-4"
        :value="slots[0].timeslice_id"
        :status="allSlotsAreChecked ? 'checked' : 'unchecked'"
        @update:status="
          $emit(
            'toggle:check-slots',
            slots.map((slot) => slot.timeslice_id)
          )
        "
      ></NovaCheckbox>
      {{ date ? format(new Date(date), "eee, dd MMM yyyy") : "" }}
    </template>
    <table class="TableResult" aria-label="slots results">
      <thead class="TableResult__head">
        <tr>
          <th scope="col"></th>
          <th v-if="!!slots[0].time" scope="col">
            {{ $t("experience.agenda.table.start-time") }}
          </th>
          <th scope="col">{{ $t("experience.agenda.table.option-name") }}</th>
          <th scope="col">{{ $t("experience.agenda.table.booked") }}</th>
          <th scope="col">{{ $t("experience.agenda.table.available") }}</th>
          <th scope="col">
            {{ shouldShowTotalCapacity ? $t("experience.agenda.table.total") : null }}
          </th>
          <th scope="col">
            {{
              slots.some((s) => s.option.capacity_type !== CapacityType.UNLIMITED)
                ? $t("experience.agenda.table.actions")
                : null
            }}
          </th>
          <th scope="col">
            {{ $t("experience.agenda.table.status") }}
          </th>
          <th scope="col"></th>
        </tr>
      </thead>

      <tbody>
        <ResultTableRow
          v-for="slot in slots"
          :key="slot.id"
          :time-slice-slot="slot"
          :grid-template="tableColumnTemplate"
          :checked="checkedTimeSliceIds.includes(slot.timeslice_id)"
          :on-update-capacity="onUpdateCapacity"
          :readonly="readonly"
          @toggle:checkbox="$emit('toggle:check-slots', [slot.timeslice_id])"
          @toggle:status="$emit('toggle:status', $event)"
        ></ResultTableRow>
      </tbody>
    </table>
  </NovaCollapse>
</template>

<script setup lang="ts">
import { CapacityType } from "@/types/Options";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import { format } from "date-fns";
import { TimeSliceSlotType } from "../types/Agenda";
import ResultTableRow, { CapacityUpdatePayload } from "./ResultTableRow.vue";

export interface Props {
  slots: TimeSliceSlotType[];
  date?: string;
  checkedTimeSliceIds: string[];
  onUpdateCapacity: (paylaod: CapacityUpdatePayload[]) => Promise<void>;
  readonly?: boolean;
}
interface Events {
  (e: "toggle:check-slots", value: string[]): void;
  (e: "toggle:status", value: { timeslice_id: string; value: boolean }): void;
}
const props = defineProps<Props>();
defineEmits<Events>();

const shouldShowTotalCapacity = computed(
  () => !!props.slots.find((slot) => slot.option.capacity_type !== CapacityType.UNLIMITED)
);

const allSlotsAreChecked = computed(() => {
  return props.slots.every((slot) => props.checkedTimeSliceIds.includes(slot.timeslice_id));
});

const tableColumnTemplate = computed(() => `50px ${props.slots[0].time ? "1fr" : ""} 3fr repeat(5, 1fr) 50px`);
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.TableResult {
  display: grid;
  grid-template-rows: auto auto;
  width: 100%;

  &__head {
    color: var(--color-primary-100);
    @include font-regular(14);

    border-bottom: 1px solid #d7d7d7;

    tr {
      display: grid;
      grid-template-columns: v-bind(tableColumnTemplate);
    }

    th {
      text-align: start;
      padding: rem(7) 0;
    }
  }
}
</style>
