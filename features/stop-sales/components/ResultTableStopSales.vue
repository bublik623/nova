<template>
  <tr class="ResultTableStopSales" :editing="isEditing || null">
    <td>
      <div class="ResultTableStopSales__checkbox">
        <NovaCheckbox
          v-if="!isReadonly"
          :status="checked ? 'checked' : 'unchecked'"
          :value="timeSliceSlot.id"
          @update:status="$emit('toggle:checkbox', timeSliceSlot.timeslice_id)"
        />
      </div>
    </td>
    <td data-testid="cell-ref-code">
      {{ getExperienceLabel(timeSliceSlot.experience_id)?.val }}
    </td>
    <td data-testid="cell-experience-name" class="pr-4">
      {{ getExperienceLabel(timeSliceSlot.experience_id)?.label }}
      <NovaLabel
        v-if="timeSliceSlot.option.pricing_type_allowed === PricingDefinition.GROUP"
        class="ml-2"
        theme="solid-secondary"
        size="sm"
        data-testid="result-stop-sales-sub-row-label-group"
      >
        {{ $t("common.groups") }}
      </NovaLabel>
    </td>
    <td data-testid="cell-option-name" class="pr-4">
      {{ timeSliceSlot.option.name }}
    </td>
    <td data-testid="cell-time" class="pr-4">
      {{ timeSliceSlot?.time?.slice(0, -3) ?? "-" }}
    </td>
    <td v-if="timeSliceSlot.option" data-testid="cell-capacity" class="pr-4">
      {{ handleCapacityType() }}
    </td>
    <td data-testid="cell-booked">
      {{ timeSliceSlot.bookings }}
    </td>
    <td data-testid="cell-available">
      <span>
        {{ !hasUnlimitedCapacity ? timeSliceSlot.remaining_capacity : $t("common.unlimited") }}
      </span>
    </td>
    <td data-testid="cell-total">
      <NovaInputNumber
        v-if="isEditing && hasSharedCapacity"
        id="slot-availability-input"
        v-model="slotTotalCapacity[timeSliceSlot.id]"
        :min-value="1"
      />
      <span v-else>{{ timeSliceSlot.total_capacity ?? "-" }}</span>
    </td>
    <td data-testid="actions">
      <template v-if="!hasUnlimitedCapacity">
        <NovaButtonIcon
          v-if="!isEditing"
          name="edit"
          data-testid="action-edit"
          @click="
            open = true;
            isEditing = true;
          "
        />

        <div v-else class="ResultTableStopSales__actions">
          <NovaButtonIcon
            data-testid="action-close"
            name="close"
            :size="12"
            @click="
              isEditing = false;
              resetSlotCapacity();
            "
          />
          <NovaButton data-testid="action-save" size="xs" @click="handleUpdateCapacity">{{
            $t("common.save")
          }}</NovaButton>
        </div>
      </template>
    </td>
    <td class="ResultTableStopSales__status" data-testid="result-stop-sales-row-status">
      <NovaSwitch
        v-if="!isReadonly"
        class="mr-2"
        :model-value="timeSliceSlot.enabled as boolean"
        @update:model-value="
          $emit('toggle:status', {
            timeslice_id: timeSliceSlot.timeslice_id,
            value: !timeSliceSlot.enabled,
          })
        "
      />
      <p v-if="timeSliceSlot.enabled">{{ $t("stop_sales.result_control.show_items.open") }}</p>
      <p v-else>{{ $t("stop_sales.result_control.show_items.closed") }}</p>
    </td>
    <td>
      <div class="ResultTableStopSales__toggle">
        <NovaButtonIcon
          v-if="shouldShowHolders"
          name="chevron-down"
          class="ResultTableStopSales__icon"
          :open="open || null"
          :size="12"
          shape="square"
          @click="open = !open"
        />
      </div>
    </td>
  </tr>
  <tr
    v-for="slot in timeSliceSlot.aggregationSlots"
    v-show="open && shouldShowHolders"
    :key="slot.id"
    class="ResultTableStopSales ResultTableStopSales__open"
    :editing="isEditing || null"
  >
    <template v-if="slot.option.capacity_type === 'language' && slot.option.pricing_type_allowed !== 'group'">
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </template>
    <template v-else>
      <td></td>
      <td></td>
      <td></td>
    </template>
    <td v-if="slot.time"></td>
    <td data-testid="sub-cell-label" class="sub-cell-label pr-4 text-text-90 text-right">
      {{ getAggregationLabel(slot) }}
    </td>
    <td data-testid="sub-cell-bookings">
      {{ slot.bookings }}
    </td>
    <td data-testid="result-stop-sales-sub-row-availabilities">
      {{ !hasSharedCapacity ? slot.remaining_capacity : null }}
    </td>

    <td data-testid="result-stop-sales-sub-row-total">
      <NovaInputNumber
        v-if="isEditing && !hasSharedCapacity"
        id="slot-availability-input"
        v-model="slotTotalCapacity[slot.id]"
        :min-value="1"
      />
      <span v-else>
        {{ !hasSharedCapacity ? slot.total_capacity : null }}
      </span>
    </td>

    <td></td>
  </tr>
</template>

<script setup lang="ts">
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import { CapacityType, PricingDefinition } from "@/types/Options";
import NovaSwitch from "@/ui-kit/NovaSwitch/NovaSwitch.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import { ExperienceOption } from "@/features/stop-sales/components/FilterExperiences.vue";
import { Slot, TimeSliceSlotType } from "@/features/experience-agenda/types/Agenda";

export interface CapacityUpdatePayload {
  id: string;
  capacity: number;
}

export interface Props {
  checked: boolean;
  timeSliceSlot: TimeSliceSlotType;
  onUpdateCapacity: (paylaod: CapacityUpdatePayload[]) => Promise<void>;
  experiences: ExperienceOption[];
  gridColumns?: string;
  isReadonly: boolean;
}

interface Events {
  (e: "toggle:checkbox", value: string): void;
  (e: "toggle:status", value: { timeslice_id: string; value: boolean }): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const { $t } = useNuxtApp();
const open = ref(false);
const isEditing = ref(false);

const hasUnlimitedCapacity = computed(() => props.timeSliceSlot.option.capacity_type === CapacityType.UNLIMITED);
const hasSharedCapacity = computed(() => props.timeSliceSlot.option.capacity_type === CapacityType.SHARED);

const slotTotalCapacity = ref<Record<string, number>>({});

const handleCapacityType = () => {
  switch (props.timeSliceSlot.option.capacity_type) {
    case CapacityType.SHARED:
      return $t("stop_sales.table-row.capacity.shared");
    case CapacityType.LANGUAGE:
      return $t("stop_sales.table-row.capacity.language");
    case CapacityType.PAX:
      return $t("stop_sales.table-row.capacity.pax");
    case CapacityType.UNLIMITED:
      return $t("stop_sales.table-row.capacity.unlimited");
  }
};

// holder should be visible If the capacity is per starting time or unlimited
const shouldShowHolders = computed(() => {
  return (
    props.timeSliceSlot.option.capacity_type !== CapacityType.UNLIMITED &&
    props.timeSliceSlot.option.capacity_type !== CapacityType.SHARED
  );
});

onMounted(() => {
  resetSlotCapacity();
});

function resetSlotCapacity() {
  slotTotalCapacity.value[props.timeSliceSlot.id] = props.timeSliceSlot.total_capacity ?? 0;

  props.timeSliceSlot.aggregationSlots.forEach((slot) => {
    slotTotalCapacity.value[slot.id] = slot.total_capacity ?? 0;
  });
}

async function handleUpdateCapacity() {
  const slotToUpdate = props.timeSliceSlot.aggregationSlots.filter((slot) =>
    Object.entries(slotTotalCapacity.value).find(([_, newTotalCapacity]) => slot.total_capacity !== newTotalCapacity)
  );

  const newCapacities = slotToUpdate.map((slot) => ({
    id: slot.id,
    capacity: slotTotalCapacity.value[slot.id],
  }));

  await props.onUpdateCapacity(newCapacities);
  isEditing.value = false;
}

function getAggregationLabel(slot: Slot) {
  const { age_range } = slot.pricing;
  const holderLabel = `${slot.pricing.holder} ${age_range.from} - ${age_range.to}`;

  const { capacity_type } = slot.option;
  if (capacity_type === CapacityType.LANGUAGE) {
    return slot.language;
  } else if (capacity_type === CapacityType.PAX) {
    return holderLabel;
  } else {
    return slot.option.multilanguage ? slot.language : holderLabel;
  }
}

function getExperienceLabel(experienceId: string) {
  return props.experiences.find((exp) => exp.id === experienceId);
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.sub-cell-label {
  // label width(span) should start from the `time` column to `capacity` column, since we dont have enough space on capacity for long holder labels
  grid-column: span 2 / 7;
}

.ResultTableStopSales {
  min-height: rem(40);
  display: grid;
  grid-template-columns: v-bind(gridColumns);
  align-items: center;

  &__checkbox {
    position: relative;
    top: rem(3);
  }

  &__open {
    @include font-regular(14);
  }

  &__status {
    display: flex;
    color: var(--color-text-100);

    & > p {
      width: rem(40);
      @include font-regular(12);
    }
  }

  &[editing] {
    background-color: var(--color-primary-10);
  }

  td {
    @include font-regular(14);

    &:first-of-type {
      margin-top: rem(-8);
      padding-left: rem(16);
    }

    &:last-of-type {
      padding-right: rem(16);
    }
  }

  &__toggle {
    display: flex;
    justify-content: flex-end;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 2px;
    margin: 0 -8px;
  }

  &__icon[open] {
    transform: rotate(180deg);
  }
}
</style>
