<template>
  <tr class="ResultTableRow" :editing="isEditing || null">
    <td>
      <div v-if="!readonly" class="ResultTableRow__checkbox">
        <NovaCheckbox
          :status="checked ? 'checked' : 'unchecked'"
          :value="timeSliceSlot.id"
          @update:status="$emit('toggle:checkbox', timeSliceSlot.timeslice_id)"
        />
      </div>
    </td>
    <td v-if="timeSliceSlot.time" data-testid="resultrow-time">
      {{ timeSliceSlot.time.slice(0, -3) }}
    </td>
    <td data-testid="resultrow-option-name">
      {{ timeSliceSlot.option.name }}
      <NovaLabel
        v-if="timeSliceSlot.option.pricing_type_allowed === PricingDefinition.GROUP"
        class="ml-2"
        theme="solid-secondary"
        size="sm"
        data-testid="resultsubrow-label-group"
      >
        {{ $t("common.groups") }}
      </NovaLabel>
    </td>
    <td data-testid="resultrow-bookings">
      {{ timeSliceSlot.bookings }}
    </td>
    <td data-testid="resultrow-availabilities">
      <span>
        {{ !hasUnlimitedCapacity ? timeSliceSlot.remaining_capacity : $t("common.unlimited") }}
      </span>
    </td>
    <td data-testid="resultrow-total">
      <NovaInputNumber
        v-if="isEditing && hasSharedCapacity"
        :readonly="readonly"
        id="slot-availability-input"
        v-model="slotTotalCapacity[timeSliceSlot.id]"
        :min-value="1"
      />
      <span v-else>{{ timeSliceSlot.total_capacity }}</span>
    </td>
    <td data-testid="resultrow-actions">
      <template v-if="!hasUnlimitedCapacity && !readonly">
        <NovaButtonIcon
          v-if="!isEditing"
          name="edit"
          @click="
            open = true;
            isEditing = true;
          "
        />

        <div v-else class="ResultTableRow__actions">
          <NovaButtonIcon
            name="close"
            :size="12"
            @click="
              isEditing = false;
              resetSlotCapacity();
            "
          />
          <NovaButton data-testid="result-table-save" size="xs" @click="handleUpdateCapacity">{{
            $t("common.save")
          }}</NovaButton>
        </div>
      </template>
    </td>
    <td class="ResultTableRow__status" data-testid="resultrow-status">
      <NovaSwitch
        class="mr-2"
        :model-value="timeSliceSlot.enabled as boolean"
        :disabled="readonly"
        @update:model-value="
          $emit('toggle:status', {
            timeslice_id: timeSliceSlot.timeslice_id,
            value: !timeSliceSlot.enabled,
          })
        "
      />
      <p v-if="timeSliceSlot.enabled">{{ $t("common.open") }}</p>
      <p v-else>{{ $t("common.closed") }}</p>
    </td>
    <td>
      <div class="ResultTableRow__toggle">
        <NovaButtonIcon
          name="chevron-down"
          class="ResultTableRow__icon"
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
    v-show="open"
    :key="slot.id"
    class="ResultTableRow ResultTableRow__open"
    :editing="isEditing || null"
  >
    <td></td>
    <td v-if="slot.time"></td>
    <td data-testid="resultsubrow-label">
      <div class="ResultTableRow__open-label">
        {{ getAggregationLabel(slot) }}
      </div>
    </td>
    <td data-testid="resultsubrow-bookings">
      {{ slot.bookings }}
    </td>
    <td data-testid="resultsubrow-availabilities">
      {{ !hasSharedCapacity ? slot.remaining_capacity : null }}
    </td>

    <td data-testid="resultsubrow-total">
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
import { TimeSliceSlotType, Slot } from "../types/Agenda";
import NovaSwitch from "@/ui-kit/NovaSwitch/NovaSwitch.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";

export interface CapacityUpdatePayload {
  id: string;
  capacity: number;
}

export interface Props {
  checked: boolean;
  timeSliceSlot: TimeSliceSlotType;
  gridTemplate: string;
  onUpdateCapacity: (paylaod: CapacityUpdatePayload[]) => Promise<void>;
  readonly?: boolean;
}

interface Events {
  (e: "toggle:checkbox", value: string): void;
  (e: "toggle:status", value: { timeslice_id: string; value: boolean }): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const open = ref(false);
const isEditing = ref(false);

const hasUnlimitedCapacity = computed(() => props.timeSliceSlot.option.capacity_type === CapacityType.UNLIMITED);
const hasSharedCapacity = computed(() => props.timeSliceSlot.option.capacity_type === CapacityType.SHARED);

const slotTotalCapacity = ref<Record<string, number>>({});

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
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.ResultTableRow {
  height: rem(40);
  display: grid;
  grid-template-columns: v-bind(gridTemplate);
  align-items: center;

  &__checkbox {
    position: relative;
    top: rem(3);
  }

  &__open {
    @include font-regular(14);

    &-label {
      padding-left: rem(15);
      color: var(--color-text-90);
    }
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
    color: var(--color-text-100);
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
