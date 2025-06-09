<template>
  <NovaCollapse :model-value="true">
    <template #title>
      <div class="flex items-center">
        <NovaCheckbox
          v-if="!isReadonly"
          :value="slots[0].timeslice_id"
          :status="allSlotsAreChecked ? 'checked' : 'unchecked'"
          @update:status="
            $emit(
              'toggle:check-slots',
              slots.map((slot) => slot.timeslice_id)
            )
          "
        />
        <span class="ml-4">{{ date ? format(new Date(date), "eee, dd MMM yyyy") : "" }}</span>
      </div>
    </template>
    <table class="TableResult font-light" aria-label="slots results">
      <thead class="TableResult__head">
        <tr>
          <th scope="col"></th>
          <th scope="col" class="font-light">{{ $t("stop_sales.table.header.ref_code") }}</th>
          <th scope="col" class="font-light">{{ $t("stop_sales.table.header.experience") }}</th>
          <th scope="col" class="font-light">
            {{ $t("stop_sales.table.header.option") }}
          </th>
          <th scope="col" class="font-light">
            {{ $t("stop_sales.table.header.time") }}
          </th>
          <th scope="col" class="font-light">
            {{ $t("stop_sales.table.header.capacity") }}
          </th>
          <th scope="col" class="font-light">{{ $t("stop_sales.table.header.booked") }}</th>
          <th scope="col" class="font-light">{{ $t("stop_sales.table.header.available") }}</th>
          <th scope="col" class="font-light">
            {{ $t("stop_sales.table.header.total") }}
          </th>
          <th scope="col" class="font-light">
            {{ $t("stop_sales.table.header.actions") }}
          </th>
          <th scope="col" class="font-light">
            {{ $t("stop_sales.table.header.status") }}
          </th>
          <th scope="col"></th>
        </tr>
      </thead>

      <tbody>
        <ResultTableStopSales
          v-for="slot in slots"
          :key="slot.id"
          :time-slice-slot="slot"
          :checked="checkedTimeSliceIds.includes(slot.timeslice_id)"
          :on-update-capacity="onUpdateCapacity"
          :experiences="experiences"
          :grid-columns="tableColumnTemplate"
          :is-readonly="isReadonly"
          @toggle:checkbox="$emit('toggle:check-slots', [slot.timeslice_id])"
          @toggle:status="$emit('toggle:status', $event)"
        >
        </ResultTableStopSales>
      </tbody>
    </table>
  </NovaCollapse>
</template>

<script setup lang="ts">
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import { format } from "date-fns";
import { CapacityUpdatePayload } from "@/features/experience-agenda/components/ResultTableRow.vue";
import { TimeSliceSlotType } from "@/features/experience-agenda/types/Agenda";
import { ExperienceOption } from "@/features/stop-sales/components/FilterExperiences.vue";
import ResultTableStopSales from "@/features/stop-sales/components/ResultTableStopSales.vue";

export interface Props {
  slots: TimeSliceSlotType[];
  date?: string;
  checkedTimeSliceIds: string[];
  onUpdateCapacity: (paylaod: CapacityUpdatePayload[]) => Promise<void>;
  experiences: ExperienceOption[];
  isReadonly: boolean;
}
interface Events {
  (e: "toggle:check-slots", value: string[]): void;
  (e: "toggle:status", value: { timeslice_id: string; value: boolean }): void;
}
const props = defineProps<Props>();
defineEmits<Events>();
const { $t } = useNuxtApp();

const allSlotsAreChecked = computed(() => {
  return props.slots.every((slot) => props.checkedTimeSliceIds.includes(slot.timeslice_id));
});

const colCheckbox = "50px";
const colRefCode = "120px";
const colExperienceName = "minmax(125px, 2.8fr)";
const colOptionName = "minmax(125px, 2.8fr)";
const colTime = "minmax(100px, 0.5fr)";
const colCapacity = "minmax(100px, 1fr)";
const colBookedAvailableTotal = "repeat(3, minmax(70px, 0.6fr))";
const colActions = "80px";
const colStatus = "90px";
const colToggle = "50px";
const tableColumnTemplate = computed(
  () =>
    `${colCheckbox} ${colRefCode} ${colExperienceName} ${colOptionName} ${colTime} ${colCapacity} ${colBookedAvailableTotal} ${colActions} ${colStatus} ${colToggle}`
);
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
